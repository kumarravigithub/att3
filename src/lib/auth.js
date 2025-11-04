import { verifyAccessToken } from './authService.js';
import { findUserByEmail } from './models/User.js';

export async function authenticate(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] No authorization header found');
      return { error: { status: 401, message: 'No token provided' } };
    }

    const token = authHeader.substring(7);
    console.log('[AUTH] Token received, length:', token.length);
    
    try {
      const decoded = verifyAccessToken(token);
      console.log('[AUTH] Token verified, email:', decoded.email);
      
      // Verify user exists
      const user = await findUserByEmail(decoded.email);
      if (!user) {
        console.log('[AUTH] User not found for email:', decoded.email);
        return { error: { status: 401, message: 'User not found' } };
      }

      console.log('[AUTH] Authentication successful for:', user.email);
      return { user };
    } catch (verifyError) {
      console.error('[AUTH] Token verification failed:', verifyError.message);
      return { error: { status: 401, message: verifyError.message || 'Invalid token' } };
    }
  } catch (error) {
    console.error('[AUTH] Authentication error:', error.message);
    return { error: { status: 401, message: error.message || 'Invalid token' } };
  }
}

export function requireRole(allowedRoles) {
  return async function(request, user) {
    if (!user) {
      return { error: { status: 401, message: 'Authentication required' } };
    }

    if (!allowedRoles.includes(user.role)) {
      return { error: { status: 403, message: 'Insufficient permissions' } };
    }

    return { user };
  };
}

