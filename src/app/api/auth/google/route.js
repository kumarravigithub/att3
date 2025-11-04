import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function GET(request) {
  try {
    await connectDatabase();
    
    const redirectUri = encodeURIComponent(GOOGLE_CALLBACK_URL);
    const scope = encodeURIComponent('profile email');
    const responseType = 'code';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Auth redirect error:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}

