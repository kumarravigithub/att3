import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { authenticate } from '../../../../lib/auth.js';

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
    
    // Return user without internal fields
    return NextResponse.json({
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      title: user.title || '',
      school: user.school || ''
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
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
    const { name, picture, title, school } = body;

    const { updateUser } = await import('../../../../lib/models/User.js');
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (picture !== undefined) updates.picture = picture;
    if (title !== undefined) updates.title = title;
    if (school !== undefined) updates.school = school;

    const updatedUser = await updateUser(user.email, updates);

    return NextResponse.json({
      email: updatedUser.email,
      name: updatedUser.name,
      picture: updatedUser.picture,
      role: updatedUser.role,
      title: updatedUser.title || '',
      school: updatedUser.school || ''
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

