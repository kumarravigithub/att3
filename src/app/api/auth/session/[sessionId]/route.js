import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../../lib/database.js';
import { getSession } from '../../../../../lib/models/Session.js';

export async function GET(request, { params }) {
  try {
    await connectDatabase();
    
    const { sessionId } = await params;
    console.log('=== Session Exchange Request ===');
    console.log('Session ID received:', sessionId);
    console.log('Session ID type:', typeof sessionId);
    console.log('Session ID length:', sessionId?.length);
    
    const session = await getSession(sessionId);
    console.log('Session retrieved:', session ? 'Yes' : 'No');
    
    if (!session) {
      console.log('Session not found or expired');
      return NextResponse.json(
        {
          error: true,
          message: 'Invalid or expired session'
        },
        { status: 404 }
      );
    }
    
    console.log('Session exchange successful');
    return NextResponse.json({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    });
  } catch (error) {
    console.error('Session exchange error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: true,
        message: 'Failed to exchange session',
        details: error.message
      },
      { status: 500 }
    );
  }
}

