import { ObjectId } from 'mongodb';
import { getDatabase } from '../database.js';

const COLLECTION_NAME = 'classes';

export async function createClass(classData) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  
  const _id = new ObjectId();
  const newClass = {
    _id,
    id: _id.toString(),
    name: classData.name,
    code: classData.code,
    teacherId: classData.teacherId,
    studentIds: classData.studentIds || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await classes.insertOne(newClass);
  return newClass;
}

export async function findAllClasses() {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  return await classes.find({}).toArray();
}

export async function findClassesByTeacher(teacherId) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  return await classes.find({ teacherId }).toArray();
}

export async function findClassesByStudent(studentId) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  return await classes.find({ studentIds: studentId }).toArray();
}

export async function findClassById(id) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  return await classes.findOne({ id });
}

export async function findClassByCode(code) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  return await classes.findOne({ code: code.toUpperCase() });
}

export async function updateClass(id, updates) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  
  const result = await classes.findOneAndUpdate(
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

export async function addStudentToClass(id, studentId) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  
  const result = await classes.findOneAndUpdate(
    { id },
    { 
      $addToSet: { studentIds: studentId },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );
  
  return result.value;
}

export async function deleteClass(id) {
  const db = getDatabase();
  const classes = db.collection(COLLECTION_NAME);
  await classes.deleteOne({ id });
}

