import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { authenticate } from '../../../../lib/auth.js';
import { updateUser } from '../../../../lib/models/User.js';

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
    
    const user = authResult.user;
    const body = await request.json();
    const { role } = body;

    if (!role || !['teacher', 'student'].includes(role)) {
      return NextResponse.json(
        {
          error: true,
          message: 'Invalid role. Must be "teacher" or "student"'
        },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(user.email, { role });

    if (!updatedUser) {
      console.error('[ROLE] User not found after update:', user.email);
      return NextResponse.json(
        {
          error: true,
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      email: updatedUser.email,
      name: updatedUser.name,
      picture: updatedUser.picture,
      role: updatedUser.role,
      title: updatedUser.title || '',
      school: updatedUser.school || ''
    });
  } catch (error) {
    console.error('[ROLE] Error setting role:', error);
    console.error('[ROLE] Error stack:', error.stack);
    return NextResponse.json(
      {
        error: true,
        message: error.message || 'Failed to set role'
      },
      { status: 500 }
    );
  }
}

