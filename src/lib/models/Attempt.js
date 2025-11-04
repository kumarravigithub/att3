import { ObjectId } from 'mongodb';
import { getDatabase } from '../database.js';

const COLLECTION_NAME = 'attempts';

export async function createAttempt(attemptData) {
  const db = getDatabase();
  const attempts = db.collection(COLLECTION_NAME);
  
  const _id = new ObjectId();
  const newAttempt = {
    _id,
    id: _id.toString(),
    testId: attemptData.testId,
    studentId: attemptData.studentId,
    answers: attemptData.answers || [],
    score: attemptData.score || 0,
    submittedAt: new Date().toISOString()
  };

  await attempts.insertOne(newAttempt);
  return newAttempt;
}

export async function findAllAttempts() {
  const db = getDatabase();
  const attempts = db.collection(COLLECTION_NAME);
  return await attempts.find({}).toArray();
}

export async function findAttemptsByStudent(studentId) {
  const db = getDatabase();
  const attempts = db.collection(COLLECTION_NAME);
  return await attempts.find({ studentId }).toArray();
}

export async function findAttemptsByTest(testId) {
  const db = getDatabase();
  const attempts = db.collection(COLLECTION_NAME);
  return await attempts.find({ testId }).toArray();
}

export async function findAttemptByStudentAndTest(studentId, testId) {
  const db = getDatabase();
  const attempts = db.collection(COLLECTION_NAME);
  return await attempts.findOne({ studentId, testId });
}

export async function deleteAttemptsByTest(testId) {
  const db = getDatabase();
  const attempts = db.collection(COLLECTION_NAME);
  await attempts.deleteMany({ testId });
}

export async function deleteAttemptsByTests(testIds) {
  const db = getDatabase();
  const attempts = db.collection(COLLECTION_NAME);
  await attempts.deleteMany({ testId: { $in: testIds } });
}

