import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';

export async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function analyzeChapter(pdfText) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const prompt = `Analyze the following NCERT chapter text and generate a comprehensive educational plan in JSON format. The JSON must include:

{
  "learningOutcomes": ["array of learning objectives"],
  "lessonPlan": [
    {
      "step": 1,
      "title": "Introduction",
      "description": "Description of the step",
      "duration": "10 mins"
    }
  ],
  "activities": [
    {
      "title": "Activity title",
      "description": "Activity description",
      "materials": ["material1", "material2"]
    }
  ],
  "assessmentTests": [
    {
      "type": "Quiz",
      "description": "Assessment description",
      "questions": ["question1", "question2"]
    }
  ],
  "learningGaps": [
    {
      "gap": "Potential misconception",
      "identificationMethod": "How to identify",
      "remedialAction": "How to correct"
    }
  ]
}

Chapter text:
${pdfText.substring(0, 30000)} // Limit to avoid token limits

Generate the educational plan:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }
    
    const content = JSON.parse(jsonMatch[0]);
    return content;
  } catch (error) {
    console.error('Error analyzing chapter:', error);
    throw new Error('Failed to analyze chapter with AI');
  }
}

export async function extractTopics(pdfText) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const prompt = `Extract key topics and sub-topics from the following chapter text. Return a JSON object with a "topics" array:

{
  "topics": ["topic1", "topic2", "topic3"]
}

Chapter text:
${pdfText.substring(0, 30000)}

Extract topics:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse topics response');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    return data;
  } catch (error) {
    console.error('Error extracting topics:', error);
    throw new Error('Failed to extract topics');
  }
}

export async function generateTestQuestions(chapterText, topics) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const prompt = `Generate test questions based on the following chapter text and topics. Create a mix of multiple-choice and short-answer questions. Return JSON in this format:

{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1"
    },
    {
      "type": "short-answer",
      "question": "Question text?"
    }
  ]
}

Topics to focus on: ${topics.join(', ')}

Chapter text:
${chapterText.substring(0, 30000)}

Generate diverse test questions:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions response');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    return data;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate test questions');
  }
}

export async function analyzeStudentPerformance(attempts, testQuestions) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const attemptsSummary = attempts.map(attempt => ({
      testId: attempt.testId,
      score: attempt.score,
      submittedAt: attempt.submittedAt
    }));
    
    const prompt = `Analyze the following student test attempts and provide feedback. Return JSON:

{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "remedialSuggestions": ["suggestion1", "suggestion2"],
  "overallFeedback": "Overall encouraging feedback"
}

Student attempts:
${JSON.stringify(attemptsSummary, null, 2)}

Test questions covered:
${testQuestions.map(q => q.question).join('\n')}

Provide analysis:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse student analysis');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing student performance:', error);
    throw new Error('Failed to analyze student performance');
  }
}

export async function analyzeClassPerformance(attempts, test) {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    
    const scores = attempts.map(a => a.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Calculate question difficulty
    const questionStats = test.questions.map(question => {
      const correct = attempts.filter(attempt => {
        const answer = attempt.answers.find(a => a.questionId === question.id);
        if (!answer) return false;
        if (question.type === 'multiple-choice') {
          return answer.answer === question.correctAnswer;
        }
        return answer.answer && answer.answer.trim().length > 0;
      }).length;
      
      const incorrect = attempts.length - correct;
      const incorrectPercentage = (incorrect / attempts.length) * 100;
      
      return {
        question: question.question,
        incorrectPercentage: Math.round(incorrectPercentage)
      };
    });
    
    const prompt = `Analyze the following class performance data and provide insights. Return JSON:

{
  "overallPerformanceSummary": "Summary of class performance",
  "commonMisconceptions": ["misconception1", "misconception2"],
  "mostDifficultQuestions": [
    {
      "question": "Question text",
      "incorrectPercentage": 65
    }
  ]
}

Average score: ${Math.round(averageScore)}%
Total students: ${attempts.length}
Question statistics: ${JSON.stringify(questionStats, null, 2)}

Test title: ${test.title}

Provide class analysis:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse class analysis');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing class performance:', error);
    throw new Error('Failed to analyze class performance');
  }
}

