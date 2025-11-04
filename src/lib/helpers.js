export function generateClassCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function calculateScore(questions, answers) {
  let correct = 0;
  const total = questions.length;

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return;

    if (question.type === 'multiple-choice') {
      if (question.correctAnswer === answer.answer) {
        correct++;
      }
    } else if (question.type === 'short-answer') {
      // For short-answer questions, we'll consider them correct if they're not empty
      // In production, you might want AI-based grading
      if (answer.answer && answer.answer.trim().length > 0) {
        correct++;
      }
    }
  });

  return Math.round((correct / total) * 100);
}

