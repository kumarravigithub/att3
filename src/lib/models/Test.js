import { ObjectId } from 'mongodb';
import { getDatabase } from '../database.js';

const COLLECTION_NAME = 'tests';

export async function createTest(testData) {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  
  const _id = new ObjectId();
  const newTest = {
    _id,
    id: _id.toString(),
    title: testData.title,
    chapterId: testData.chapterId,
    teacherId: testData.teacherId,
    topics: testData.topics || [],
    questions: testData.questions || [],
    assignedClassIds: testData.assignedClassIds || [],
    createdAt: new Date().toISOString()
  };

  await tests.insertOne(newTest);
  return newTest;
}

export async function findAllTests() {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  return await tests.find({}).toArray();
}

export async function findTestsByTeacher(teacherId) {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  return await tests.find({ teacherId }).toArray();
}

export async function findTestsByClass(classId) {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  return await tests.find({ assignedClassIds: classId }).toArray();
}

export async function findTestsByChapter(chapterId) {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  return await tests.find({ chapterId }).toArray();
}

export async function findTestById(id) {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  return await tests.findOne({ id });
}

export async function deleteTest(id) {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  await tests.deleteOne({ id });
}

export async function deleteTestsByChapter(chapterId) {
  const db = getDatabase();
  const tests = db.collection(COLLECTION_NAME);
  await tests.deleteMany({ chapterId });
}

