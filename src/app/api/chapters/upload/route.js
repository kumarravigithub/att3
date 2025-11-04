import { NextResponse } from 'next/server';
import { connectDatabase } from '../../../../lib/database.js';
import { authenticate, requireRole } from '../../../../lib/auth.js';
import { createChapter } from '../../../../lib/models/Chapter.js';
import { uploadFile } from '../../../../lib/storageService.js';
import { extractTextFromPDF, analyzeChapter } from '../../../../lib/geminiService.js';

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
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        {
          error: true,
          message: 'No file uploaded'
        },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        {
          error: true,
          message: 'Only PDF files are allowed'
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfText = await extractTextFromPDF(buffer);

    // Upload to Google Cloud Storage
    const { fileUrl } = await uploadFile(buffer, file.name);

    // Analyze with Gemini
    const content = await analyzeChapter(pdfText);

    // Create chapter record
    const newChapter = await createChapter({
      fileName: file.name,
      fileUrl,
      content,
      teacherId: user.email,
      assignedClassIds: []
    });

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error('Chapter upload error:', error);
    return NextResponse.json(
      { error: true, message: error.message || 'Failed to upload and analyze chapter' },
      { status: 500 }
    );
  }
}

