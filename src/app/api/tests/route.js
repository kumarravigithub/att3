import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/database.js';
import { authenticate, requireRole } from '../../../lib/auth.js';
import {
  findAllTests,
  findTestsByTeacher,
  createTest
} from '../../../lib/models/Test.js';

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
    let tests;

    if (user.role === 'teacher') {
      tests = await findTestsByTeacher(user.email);
    } else if (user.role === 'student') {
      // For students, get tests assigned to their classes
      tests = await findAllTests();
      // Filter logic would require class data - simplified for now
    } else {
      tests = [];
    }

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Get tests error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to fetch tests' },
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
    
    const roleCheck = await requireRole(['teacher'])(request, authResult.user);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: true, message: roleCheck.error.message },
        { status: roleCheck.error.status }
      );
    }
    
    const user = authResult.user;
    const body = await request.json();
    const { title, chapterId, topics, questions, assignedClassIds } = body;

    if (!title || !chapterId || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        {
          error: true,
          message: 'title, chapterId, and questions are required'
        },
        { status: 400 }
      );
    }

    const { findChapterById } = await import('../../../lib/models/Chapter.js');
    const chapter = await findChapterById(chapterId);
    
    if (!chapter) {
      return NextResponse.json(
        {
          error: true,
          message: 'Chapter not found'
        },
        { status: 404 }
      );
    }

    if (chapter.teacherId !== user.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'You do not have permission to create tests for this chapter'
        },
        { status: 403 }
      );
    }

    const { v4: uuidv4 } = await import('uuid');
    const newTest = await createTest({
      title: title.trim(),
      chapterId,
      teacherId: user.email,
      topics: topics || [],
      questions: questions.map(q => ({
        id: q.id || uuidv4(),
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      })),
      assignedClassIds: assignedClassIds || []
    });

    return NextResponse.json(newTest, { status: 201 });
  } catch (error) {
    console.error('Create test error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to create test' },
      { status: 500 }
    );
  }
}

