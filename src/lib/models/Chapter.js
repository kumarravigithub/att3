import { ObjectId } from 'mongodb';
import { getDatabase } from '../database.js';

const COLLECTION_NAME = 'chapters';

export async function createChapter(chapterData) {
  const db = getDatabase();
  const chapters = db.collection(COLLECTION_NAME);
  
  const _id = new ObjectId();
  const newChapter = {
    _id,
    id: _id.toString(),
    fileName: chapterData.fileName,
    fileUrl: chapterData.fileUrl || '',
    content: chapterData.content,
    createdAt: new Date().toISOString(),
    teacherId: chapterData.teacherId,
    assignedClassIds: chapterData.assignedClassIds || []
  };

  await chapters.insertOne(newChapter);
  return newChapter;
}

export async function findAllChapters() {
  const db = getDatabase();
  const chapters = db.collection(COLLECTION_NAME);
  return await chapters.find({}).toArray();
}

export async function findChaptersByTeacher(teacherId) {
  const db = getDatabase();
  const chapters = db.collection(COLLECTION_NAME);
  return await chapters.find({ teacherId }).toArray();
}

export async function findChaptersByClass(classId) {
  const db = getDatabase();
  const chapters = db.collection(COLLECTION_NAME);
  return await chapters.find({ assignedClassIds: classId }).toArray();
}

export async function findChapterById(id) {
  const db = getDatabase();
  const chapters = db.collection(COLLECTION_NAME);
  return await chapters.findOne({ id });
}

export async function updateChapter(id, updates) {
  const db = getDatabase();
  const chapters = db.collection(COLLECTION_NAME);
  
  const result = await chapters.findOneAndUpdate(
    { id },
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

export async function deleteChapter(id) {
  const db = getDatabase();
  const chapters = db.collection(COLLECTION_NAME);
  await chapters.deleteOne({ id });
}

