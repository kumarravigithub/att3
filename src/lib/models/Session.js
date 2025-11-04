import { getDatabase } from '../database.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'sessions';
const SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export async function createSession(accessToken, refreshToken) {
  const db = getDatabase();
  const sessions = db.collection(COLLECTION_NAME);
  
  const session = {
    accessToken,
    refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_EXPIRY_MS)
  };
  
  const result = await sessions.insertOne(session);
  return result.insertedId.toString();
}

export async function getSession(sessionId) {
  const db = getDatabase();
  const sessions = db.collection(COLLECTION_NAME);
  
  try {
    console.log('Getting session from database:', sessionId);
    
    // Validate sessionId format
    if (!sessionId || typeof sessionId !== 'string') {
      console.error('Invalid sessionId format:', sessionId);
      return null;
    }
    
    // Check if it's a valid ObjectId format
    if (!ObjectId.isValid(sessionId)) {
      console.error('Invalid ObjectId format:', sessionId);
      return null;
    }
    
    const objectId = new ObjectId(sessionId);
    console.log('Converted to ObjectId:', objectId);
    
    const session = await sessions.findOne({ 
      _id: objectId,
      expiresAt: { $gt: new Date() }
    });
    
    console.log('Session found in database:', session ? 'Yes' : 'No');
    
    if (!session) {
      // Check if session exists but expired
      const expiredSession = await sessions.findOne({ _id: objectId });
      if (expiredSession) {
        console.log('Session found but expired');
      } else {
        console.log('Session not found in database');
      }
      return null;
    }
    
    console.log('Session retrieved successfully');
    
    // Delete the session after retrieval (one-time use)
    await sessions.deleteOne({ _id: session._id });
    console.log('Session deleted after retrieval');
    
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    };
  } catch (error) {
    console.error('Error getting session:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      sessionId: sessionId
    });
    return null;
  }
}

// Clean up expired sessions periodically
export async function cleanupExpiredSessions() {
  const db = getDatabase();
  const sessions = db.collection(COLLECTION_NAME);
  
  await sessions.deleteMany({
    expiresAt: { $lt: new Date() }
  });
}

