import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../../lib/database.js';
import { authenticate } from '../../../../../lib/auth.js';
import {
  findAttemptsByStudent
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
    
    const { studentId } = await params;
    const user = authResult.user;

    // Teachers can see any student's attempts, students can only see their own
    if (user.role === 'student' && studentId !== user.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'You can only view your own attempts'
        },
        { status: 403 }
      );
    }

    const attempts = await findAttemptsByStudent(studentId);
    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Get attempts by student error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to fetch attempts' },
      { status: 500 }
    );
  }
}

