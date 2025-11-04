import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { authenticate, requireRole } from '../../../../lib/auth.js';
import {
  findClassByCode,
  addStudentToClass
} from '../../../../lib/models/Class.js';

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
    const { code } = body;

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        {
          error: true,
          message: 'Class code is required'
        },
        { status: 400 }
      );
    }

    const classToJoin = await findClassByCode(code.trim().toUpperCase());
    
    if (!classToJoin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Class code not found.',
          class: null
        },
        { status: 404 }
      );
    }

    if (classToJoin.studentIds.includes(user.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'You are already in this class.',
          class: classToJoin
        },
        { status: 400 }
      );
    }

    const updatedClass = await addStudentToClass(classToJoin.id, user.email);
    
    return NextResponse.json({
      success: true,
      message: `Successfully joined ${updatedClass.name}!`,
      class: updatedClass
    });
  } catch (error) {
    console.error('Join class error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to join class' },
      { status: 500 }
    );
  }
}

