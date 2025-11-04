import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/database.js';
import { authenticate, requireRole } from '../../../lib/auth.js';
import {
  findClassesByTeacher,
  findClassesByStudent,
  createClass
} from '../../../lib/models/Class.js';
import { generateClassCode } from '../../../lib/helpers.js';

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
    let classes;

    if (user.role === 'teacher') {
      classes = await findClassesByTeacher(user.email);
    } else if (user.role === 'student') {
      classes = await findClassesByStudent(user.email);
    } else {
      // If no role set, return empty array
      classes = [];
    }

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to fetch classes' },
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

    const code = generateClassCode();
    const newClass = await createClass({
      name: name.trim(),
      code,
      teacherId: user.email,
      studentIds: []
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to create class' },
      { status: 500 }
    );
  }
}

