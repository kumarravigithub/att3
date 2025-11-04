import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/database.js';
import { authenticate, requireRole } from '../../../lib/auth.js';
import {
  findAllAttempts,
  findAttemptsByStudent,
  createAttempt,
  findAttemptByStudentAndTest
} from '../../../lib/models/Attempt.js';
import { findTestById } from '../../../lib/models/Test.js';
import { calculateScore } from '../../../lib/helpers.js';

export async function GET(request) {
  try {
    await connectDatabase();
    
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: true, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }
    
    const user = authResult.user;
    let attempts;

    if (user.role === 'teacher') {
      attempts = await findAllAttempts();
    } else if (user.role === 'student') {
      attempts = await findAttemptsByStudent(user.email);
    } else {
      attempts = [];
    }

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDatabase();
    
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: true, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }
    
    const roleCheck = await requireRole(['student'])(request, authResult.user);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: true, message: roleCheck.error.message },
        { status: roleCheck.error.status }
      );
    }
    
    const user = authResult.user;
    const body = await request.json();
    const { testId, answers } = body;

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        {
          error: true,
          message: 'testId and answers are required'
        },
        { status: 400 }
      );
    }

    const test = await findTestById(testId);
    
    if (!test) {
      return NextResponse.json(
        {
          error: true,
          message: 'Test not found'
        },
        { status: 404 }
      );
    }

    // Check if student already attempted this test
    const existingAttempt = await findAttemptByStudentAndTest(user.email, testId);
    if (existingAttempt) {
      return NextResponse.json(
        {
          error: true,
          message: 'You have already attempted this test'
        },
        { status: 400 }
      );
    }

    // Calculate score
    const score = calculateScore(test.questions, answers);

    // Create attempt
    const newAttempt = await createAttempt({
      testId,
      studentId: user.email,
      answers,
      score
    });

    return NextResponse.json(newAttempt, { status: 201 });
  } catch (error) {
    console.error('Attempt submission error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to submit attempt' },
      { status: 500 }
    );
  }
}

