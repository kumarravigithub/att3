import { NextResponse } from 'next/server';
import { connectDatabase, getDatabase } from '../../../../lib/database.js';
import { authenticate } from '../../../../lib/auth.js';
import { updateUser, findUserByEmail } from '../../../../lib/models/User.js';

export async function POST(request) {
  try {
    await connectDatabase();
    
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      console.error('[ROLE] Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: true, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }
    
    const user = authResult.user;
    console.log('[ROLE] Authenticated user:', { email: user.email, currentRole: user.role });
    
    const body = await request.json();
    const { role: requestedRole } = body;
    console.log('[ROLE] Requested role:', requestedRole);

    if (!requestedRole || !['teacher', 'student'].includes(requestedRole)) {
      return NextResponse.json(
        {
          error: true,
          message: 'Invalid role. Must be "teacher" or "student"'
        },
        { status: 400 }
      );
    }

    // Verify user exists before attempting update
    const existingUser = await findUserByEmail(user.email);
    console.log('[ROLE] User lookup before update:', { 
      found: !!existingUser,
      email: existingUser?.email,
      currentRole: existingUser?.role 
    });
    
    if (!existingUser) {
      console.error('[ROLE] User does not exist in database:', user.email);
      return NextResponse.json(
        {
          error: true,
          message: `User not found in database. Email: ${user.email}`
        },
        { status: 404 }
      );
    }

    console.log('[ROLE] Updating user with email:', user.email);
    const updatedUser = await updateUser(user.email, { role: requestedRole });
    console.log('[ROLE] Update result:', { 
      found: !!updatedUser, 
      email: updatedUser?.email,
      role: updatedUser?.role 
    });

    if (!updatedUser) {
      console.error('[ROLE] Update returned null - user may have been deleted or email mismatch');
      console.error('[ROLE] Attempting to find user again after update...');
      
      const userAfterUpdate = await findUserByEmail(user.email);
      console.error('[ROLE] User lookup after update:', { 
        found: !!userAfterUpdate,
        email: userAfterUpdate?.email,
        role: userAfterUpdate?.role 
      });
      
      // If user doesn't exist after update, it means they were deleted or never existed
      // Return 401 to force re-authentication
      if (!userAfterUpdate) {
        return NextResponse.json(
          {
            error: true,
            message: 'User account not found. Please log in again.',
            requiresReauth: true
          },
          { status: 401 }
        );
      }
      
      // If user exists but update failed, return 500
      return NextResponse.json(
        {
          error: true,
          message: `Failed to update user. Email: ${user.email}. Please try again.`
        },
        { status: 500 }
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

