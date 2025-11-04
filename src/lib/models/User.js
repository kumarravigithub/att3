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
  
  const result = await users.findOneAndUpdate(
    { email },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result.value;
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

