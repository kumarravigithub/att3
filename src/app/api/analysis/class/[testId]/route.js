import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../../lib/database.js';
import { authenticate, requireRole } from '../../../../../lib/auth.js';
import {
  findAttemptsByTest
} from '../../../../../lib/models/Attempt.js';
import { findTestById } from '../../../../../lib/models/Test.js';
import { analyzeClassPerformance } from '../../../../../lib/geminiService.js';

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
    
    const roleCheck = await requireRole(['teacher'])(request, authResult.user);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: true, message: roleCheck.error.message },
        { status: roleCheck.error.status }
      );
    }
    
    const { testId } = await params;
    const user = authResult.user;

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

    if (test.teacherId !== user.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'You do not have permission to analyze this test'
        },
        { status: 403 }
      );
    }

    const attempts = await findAttemptsByTest(testId);
    
    if (attempts.length === 0) {
      return NextResponse.json(
        {
          error: true,
          message: 'No attempts found for this test'
        },
        { status: 404 }
      );
    }

    // Generate analysis using Gemini
    const analysis = await analyzeClassPerformance(attempts, test);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Class analysis error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to analyze class performance' },
      { status: 500 }
    );
  }
}

