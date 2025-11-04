import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { authenticate, requireRole } from '../../../../lib/auth.js';
import { findChapterById } from '../../../../lib/models/Chapter.js';
import { generateTestQuestions } from '../../../../lib/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    await connectDatabase();
    
    const authResult = await authenticate(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: true, message: authResult.error.message },
        { status: authResult.error.status }
      );
    }
    
    const roleCheck = await requireRole(['teacher'])(request, authResult.user);
    if (roleCheck.error) {
      return NextResponse.json(
        { error: true, message: roleCheck.error.message },
        { status: roleCheck.error.status }
      );
    }
    
    const user = authResult.user;
    const body = await request.json();
    const { chapterId, topics } = body;

    if (!chapterId) {
      return NextResponse.json(
        {
          error: true,
          message: 'chapterId is required'
        },
        { status: 400 }
      );
    }

    const chapter = await findChapterById(chapterId);
    
    if (!chapter) {
      return NextResponse.json(
        {
          error: true,
          message: 'Chapter not found'
        },
        { status: 404 }
      );
    }

    if (chapter.teacherId !== user.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'You do not have permission to generate questions for this chapter'
        },
        { status: 403 }
      );
    }

    // Get chapter text (would need to fetch from GCS and parse)
    // For now, use chapter content as context
    const chapterText = JSON.stringify(chapter.content);

    // Generate questions
    const topicsToUse = topics && Array.isArray(topics) ? topics : [];
    const questionsData = await generateTestQuestions(chapterText, topicsToUse);

    // Add IDs to questions
    const questions = questionsData.questions.map(q => ({
      id: uuidv4(),
      ...q
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Test generation error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to generate test questions' },
      { status: 500 }
    );
  }
}

