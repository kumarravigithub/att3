import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../../lib/database.js';
import { authenticate } from '../../../../../lib/auth.js';
import {
  findAttemptsByStudent
} from '../../../../../lib/models/Attempt.js';
import { findTestById } from '../../../../../lib/models/Test.js';
import { analyzeStudentPerformance } from '../../../../../lib/geminiService.js';

export async function GET(request, { params }) {
  try {
    await connectDatabase();
    
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: true, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }
    
    const { studentId } = await params;
    const user = authResult.user;

    // Students can only view their own analysis
    if (user.role === 'student' && studentId !== user.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'You can only view your own analysis'
        },
        { status: 403 }
      );
    }

    const attempts = await findAttemptsByStudent(studentId);
    
    if (attempts.length === 0) {
      return NextResponse.json(
        {
          error: true,
          message: 'No attempts found for this student to analyze.'
        },
        { status: 404 }
      );
    }

    // Get all test questions from attempts
    const testIds = [...new Set(attempts.map(a => a.testId))];
    const tests = [];
    for (const testId of testIds) {
      const test = await findTestById(testId);
      if (test) tests.push(test);
    }

    const allQuestions = tests.flatMap(t => t.questions);

    // Generate analysis using Gemini
    const analysis = await analyzeStudentPerformance(attempts, allQuestions);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Student analysis error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to analyze student performance' },
      { status: 500 }
    );
  }
}

