import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAttempt } from '../context/AttemptContext';
import * as api from '../services/api';
import { Loader } from './Loader';
import { AnalysisIcon } from './icons';

const StudentAnalysisDashboard = () => {
  const { user } = useAuth();
  const { getAttemptsForStudent } = useAttempt();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchAnalysis = async () => {
      setIsLoading(true);
      const attempts = getAttemptsForStudent(user.email);
      if (attempts.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        const result = await api.fetchStudentAnalysis(user.email);
        setAnalysis(result);
      } catch (e) {
        console.error("Failed to get student analysis", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [user, getAttemptsForStudent]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg">
        <Loader message="AI is analyzing your performance..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg text-center">
        <AnalysisIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">No Analysis Available Yet</h2>
        <p className="text-slate-500 mt-2">Complete a test to see your personalized performance report.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Performance Report</h2>
       <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-slate-700 text-lg">Overall Feedback</h3>
                <p className="text-md text-slate-600 bg-slate-50 p-4 rounded-md mt-2">{analysis.overallFeedback}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-green-700 text-lg">Your Strengths</h3>
                    <ul className="list-disc list-inside text-md text-slate-600 bg-green-50 p-4 rounded-md mt-2 space-y-1">
                        {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-red-700 text-lg">Topics to Review</h3>
                    <ul className="list-disc list-inside text-md text-slate-600 bg-red-50 p-4 rounded-md mt-2 space-y-1">
                        {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-slate-700 text-lg">Suggestions for Improvement</h3>
                <ul className="list-disc list-inside text-md text-slate-600 bg-blue-50 p-4 rounded-md mt-2 space-y-1">
                    {analysis.remedialSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
       </div>
    </div>
  );
};

export default StudentAnalysisDashboard;

