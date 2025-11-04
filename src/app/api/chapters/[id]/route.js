import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { authenticate, requireRole } from '../../../../lib/auth.js';
import {
  findChapterById,
  deleteChapter
} from '../../../../lib/models/Chapter.js';

export async function DELETE(request, { params }) {
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
          message: 'You do not have permission to delete this chapter'
        },
        { status: 403 }
      );
    }

    await deleteChapter(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete chapter error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to delete chapter' },
      { status: 500 }
    );
  }
}

