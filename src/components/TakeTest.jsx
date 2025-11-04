import { useState, useCallback } from 'react';
import { useAttempt } from '../context/AttemptContext';

const TakeTest = ({ test, onFinish }) => {
  const { addAttempt } = useAttempt();
  const [answers, setAnswers] = useState(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(new Map(answers.set(questionId, answer)));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Calculate score
    let correctCount = 0;
    test.questions.forEach(q => {
      const studentAnswer = answers.get(q.id);
      if (q.type === 'multiple-choice') {
        if (studentAnswer === q.correctAnswer) {
          correctCount++;
        }
      } else {
        // Simple validation for short answers
        if (studentAnswer && studentAnswer.trim() !== '') {
          correctCount++;
        }
      }
    });

    const score = Math.round((correctCount / test.questions.length) * 100);

    const studentAnswers = Array.from(answers.entries()).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    
    await addAttempt(test.id, studentAnswers, score);
    setIsSubmitting(false);
    onFinish();
  }, [test, answers, addAttempt, onFinish]);

  const renderQuestion = (question) => {
    const studentAnswer = answers.get(question.id) || '';

    return (
      <div key={question.id} className="p-4 bg-white border rounded-lg shadow-sm">
        <p className="font-semibold text-slate-800 mb-3">{question.question}</p>
        {question.type === 'multiple-choice' && question.options ? (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={studentAnswer === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            value={studentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type your answer here..."
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-2xl animate-fade-in">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-800">{test.title}</h1>
        <p className="text-slate-500 mt-1">Answer all questions to the best of your ability.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {test.questions.map(renderQuestion)}
        <div className="pt-6 flex justify-center">
            <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:transform-none"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default TakeTest;

