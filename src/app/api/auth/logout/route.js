import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { verifyAccessToken } from '../../../../lib/authService.js';
import { clearRefreshToken } from '../../../../lib/models/User.js';

export async function POST(request) {
  try {
    await connectDatabase();
    
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyAccessToken(token);
        
        // Clear refresh token
        await clearUserRefreshToken(decoded.email);
      } catch (error) {
        // Token might be invalid, still consider logout successful
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    // Even if there's an error, consider logout successful
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

