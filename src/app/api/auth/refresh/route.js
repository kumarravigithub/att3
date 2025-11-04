import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { findUserByEmail } from '../../../../lib/models/User.js';
import { verifyRefreshToken, generateAccessToken } from '../../../../lib/authService.js';

export async function POST(request) {
  try {
    await connectDatabase();
    
    const body = await request.json();
    const { refreshToken: token } = body;

    if (!token) {
      return NextResponse.json(
        {
          error: true,
          message: 'Refresh token required'
        },
        { status: 400 }
      );
    }

    const decoded = verifyRefreshToken(token);
    const user = await findUserByEmail(decoded.email);

    if (!user || user.refreshToken !== token) {
      return NextResponse.json(
        {
          error: true,
          message: 'Invalid refresh token'
        },
        { status: 401 }
      );
    }

    const newAccessToken = generateAccessToken(user);

    return NextResponse.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message: error.message || 'Invalid refresh token'
      },
      { status: 401 }
    );
  }
}

