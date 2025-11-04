import { getDatabase } from '../database.js';

const COLLECTION_NAME = 'users';

export async function createUser(userData) {
  const db = getDatabase();
  const users = db.collection(COLLECTION_NAME);
  
  const user = {
    email: userData.email,
    name: userData.name,
    picture: userData.picture || '',
    role: userData.role || null,
    title: userData.title || '',
    school: userData.school || '',
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await users.insertOne(user);
  return user;
}

export async function findUserByEmail(email) {
  const db = getDatabase();
  const users = db.collection(COLLECTION_NAME);
  return await users.findOne({ email });
}

export async function findUserById(id) {
  const db = getDatabase();
  const users = db.collection(COLLECTION_NAME);
  return await users.findOne({ _id: id });
}

export async function updateUser(email, updates) {
  const db = getDatabase();
  const users = db.collection(COLLECTION_NAME);
  
  console.log('[User.updateUser] Updating user:', { email, updates });
  
  // First verify user exists
  const existingUser = await users.findOne({ email });
  if (!existingUser) {
    console.error('[User.updateUser] User not found before update:', email);
    return null;
  }
  
  console.log('[User.updateUser] User found, proceeding with update');
  
  // Use updateOne for more reliable updates
  const updateResult = await users.updateOne(
    { email },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    }
  );
  
  console.log('[User.updateUser] Update operation result:', { 
    matchedCount: updateResult.matchedCount,
    modifiedCount: updateResult.modifiedCount,
    acknowledged: updateResult.acknowledged
  });
  
  if (updateResult.matchedCount === 0) {
    console.error('[User.updateUser] No document matched for update:', email);
    return null;
  }
  
  // Fetch the updated document
  const updatedUser = await users.findOne({ email });
  console.log('[User.updateUser] Updated user fetched:', { 
    found: !!updatedUser,
    email: updatedUser?.email,
    role: updatedUser?.role 
  });
  
  return updatedUser;
}

export async function setRefreshToken(email, refreshToken) {
  const db = getDatabase();
  const users = db.collection(COLLECTION_NAME);
  
  await users.updateOne(
    { email },
    { 
      $set: { 
        refreshToken,
        updatedAt: new Date() 
      } 
    }
  );
}

export async function clearRefreshToken(email) {
  const db = getDatabase();
  const users = db.collection(COLLECTION_NAME);
  
  await users.updateOne(
    { email },
    { 
      $set: { 
        refreshToken: null,
        updatedAt: new Date() 
      } 
    }
  );
}

