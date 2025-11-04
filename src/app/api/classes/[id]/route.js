import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { authenticate, requireRole } from '../../../../lib/auth.js';
import {
  findClassById,
  updateClass,
  deleteClass
} from '../../../../lib/models/Class.js';

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
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          error: true,
          message: 'Class name is required'
        },
        { status: 400 }
      );
    }

    const classToUpdate = await findClassById(id);
    
    if (!classToUpdate) {
      return NextResponse.json(
        {
          error: true,
          message: 'Class not found'
        },
        { status: 404 }
      );
    }

    if (classToUpdate.teacherId !== user.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'You do not have permission to update this class'
        },
        { status: 403 }
      );
    }

    const updatedClass = await updateClass(id, { name: name.trim() });
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Update class error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to update class' },
      { status: 500 }
    );
  }
}

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

    const classToDelete = await findClassById(id);
    
    if (!classToDelete) {
      return NextResponse.json(
        {
          error: true,
          message: 'Class not found'
        },
        { status: 404 }
      );
    }

    if (classToDelete.teacherId !== user.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'You do not have permission to delete this class'
        },
        { status: 403 }
      );
    }

    await deleteClass(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete class error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to delete class' },
      { status: 500 }
    );
  }
}

