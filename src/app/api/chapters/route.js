import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../lib/database.js';
import { authenticate } from '../../../lib/auth.js';
import {
  findAllChapters,
  findChaptersByTeacher
} from '../../../lib/models/Chapter.js';

export async function GET(request) {
  try {
    await connectDatabase();
    
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: true, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }
    
    const user = authResult.user;
    let chapters;

    if (user.role === 'teacher') {
      chapters = await findChaptersByTeacher(user.email);
    } else if (user.role === 'student') {
      // For students, get chapters assigned to their classes
      const allChapters = await findAllChapters();
      // Filter logic would require class data - for now return all
      chapters = allChapters;
    } else {
      chapters = [];
    }

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

