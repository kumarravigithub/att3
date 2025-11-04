import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../../lib/database.js';
import { authenticate, requireRole } from '../../../../../lib/auth.js';
import {
  findChapterById,
  updateChapter
} from '../../../../../lib/models/Chapter.js';

export async function PATCH(request, { params }) {
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
    
    const { id } = await params;
    const user = authResult.user;
    const body = await request.json();
    const { classIds } = body;

    if (!Array.isArray(classIds)) {
      return NextResponse.json(
        {
          error: true,
          message: 'classIds must be an array'
        },
        { status: 400 }
      );
    }

    const chapter = await findChapterById(id);
    
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
          message: 'You do not have permission to assign this chapter'
        },
        { status: 403 }
      );
    }

    const updatedChapter = await updateChapter(id, {
      assignedClassIds: classIds
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error('Assign chapter error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to assign chapter' },
      { status: 500 }
    );
  }
}

