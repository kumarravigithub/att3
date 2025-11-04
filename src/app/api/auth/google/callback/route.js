import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../../lib/database.js';
import { createUser, findUserByEmail, updateUser, setRefreshToken } from '../../../../../lib/models/User.js';
import { generateAccessToken, generateRefreshToken } from '../../../../../lib/authService.js';
import { createSession } from '../../../../../lib/models/Session.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function GET(request) {
  try {
    await connectDatabase();
    
    console.log('=== OAuth Callback Started ===');
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    console.log('OAuth code received:', code ? 'Yes' : 'No');
    
    if (!code) {
      console.log('No OAuth code in query, redirecting to frontend');
      return NextResponse.redirect(`${FRONTEND_URL}/?error=no_code`);
    }

    console.log('Exchanging code for tokens...');
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(`${FRONTEND_URL}/?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received from Google');

    console.log('Fetching user info from Google...');
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('User info fetch failed:', userInfoResponse.status, errorText);
      return NextResponse.redirect(`${FRONTEND_URL}/?error=user_info_failed`);
    }

    const profile = await userInfoResponse.json();
    console.log('User profile received:', profile.email, profile.name);

    // Create or update user
    const userData = {
      email: profile.email,
      name: profile.name,
      picture: profile.picture || ''
    };

    let user = await findUserByEmail(userData.email);
    
    if (!user) {
      console.log('Creating new user:', userData.email);
      user = await createUser(userData);
    } else {
      console.log('Updating existing user:', userData.email);
      // Update user info if changed
      await updateUser(userData.email, {
        name: userData.name,
        picture: userData.picture
      });
      user = await findUserByEmail(userData.email);
    }

    console.log('Generating JWT tokens...');
    // Generate our tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    console.log('JWT tokens generated successfully');

    // Store refresh token
    await setRefreshToken(user.email, refreshToken);
    console.log('Refresh token stored');

    // Create a temporary session with tokens
    console.log('Creating session with tokens...');
    const sessionId = await createSession(accessToken, refreshToken);
    console.log('Session created successfully');
    console.log('Session ID:', sessionId);

    // Redirect to frontend with session ID (much shorter than tokens)
    const redirectUrl = `${FRONTEND_URL}/auth/callback?sessionId=${sessionId}`;
    console.log('Redirecting to frontend:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.redirect(`${FRONTEND_URL}/?error=auth_failed`);
  }
}

