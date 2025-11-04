import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../../lib/database.js';
import { authenticate } from '../../../../../lib/auth.js';
import {
  findAttemptsByTest
} from '../../../../../lib/models/Attempt.js';

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
    
    const { testId } = await params;
    const user = authResult.user;

    // Teachers can see all attempts, students can only see their own
    let attempts;
    if (user.role === 'teacher') {
      attempts = await findAttemptsByTest(testId);
    } else {
      const allAttempts = await findAttemptsByTest(testId);
      attempts = allAttempts.filter(a => a.studentId === user.email);
    }

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Get attempts by test error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}

