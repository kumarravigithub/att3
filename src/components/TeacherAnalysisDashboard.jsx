import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClass } from '../context/ClassContext';
import { useTest } from '../context/TestContext';
import { useChapter } from '../context/ChapterContext';
import { useAttempt } from '../context/AttemptContext';
import * as api from '../services/api';
import { Loader } from './Loader';
import { AnalysisIcon } from './icons';

const TeacherAnalysisDashboard = () => {
  const [view, setView] = useState('byTest');

  const ViewSelector = () => (
    <div className="mb-6 flex justify-center bg-slate-100 rounded-lg p-1.5">
      {(['byTest', 'byStudent', 'byChapter']).map(v => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full ${
            view === v ? 'bg-white text-blue-600 shadow' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          {v === 'byTest' ? 'By Test' : v === 'byStudent' ? 'By Student' : 'By Chapter'}
        </button>
      ))}
    </div>
  );
  
  const renderContent = () => {
      switch(view) {
          case 'byTest': return <AnalysisByTest />;
          case 'byStudent': return <AnalysisByStudent />;
          case 'byChapter': return <AnalysisByChapter />;
          default: return null;
      }
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Performance Analysis</h2>
      <ViewSelector />
      <div>{renderContent()}</div>
    </div>
  );
};

// Analysis By Test Component
const AnalysisByTest = () => {
    const { user } = useAuth();
    const { getTestsForTeacher } = useTest();
    const { getAttemptsForTest } = useAttempt();
    const { chapters } = useChapter();
    const [selectedTest, setSelectedTest] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if(!user) return null;
    const teacherTests = getTestsForTeacher(user.email);
    const chapterMap = new Map(chapters.map(ch => [ch.id, ch.fileName]));

    const handleSelectTest = async (test) => {
        setSelectedTest(test);
        setAnalysis(null);
        setIsLoading(true);
        const attempts = getAttemptsForTest(test.id);
        if (attempts.length === 0) {
            setIsLoading(false);
            return;
        }
        
        try {
            const result = await api.fetchClassAnalysis(test.id);
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const attemptsForSelectedTest = selectedTest ? getAttemptsForTest(selectedTest.id) : [];
    const averageScore = useMemo(() => {
        if(attemptsForSelectedTest.length === 0) return 0;
        const total = attemptsForSelectedTest.reduce((sum, a) => sum + a.score, 0);
        return Math.round(total / attemptsForSelectedTest.length);
    }, [attemptsForSelectedTest]);

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a test to analyze class performance:</h3>
            <div className="flex flex-wrap gap-2">
                {teacherTests.map(t => (
                    <button key={t.id} onClick={() => handleSelectTest(t)} className={`px-3 py-1.5 text-sm rounded-full border ${selectedTest?.id === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                        {t.title}
                    </button>
                ))}
            </div>
            
            {selectedTest && (
                <div className="mt-6 p-4 border rounded-lg bg-slate-50">
                    {isLoading && <Loader message="AI is analyzing class performance..." />}
                    {!isLoading && attemptsForSelectedTest.length === 0 && <p className="text-center text-slate-500">No students have taken this test yet.</p>}
                    {!isLoading && attemptsForSelectedTest.length > 0 && (
                        <div>
                             <h4 className="text-xl font-bold text-slate-800">{selectedTest.title} - Analysis</h4>
                            <p className="text-sm text-slate-500 mb-4">Chapter: {chapterMap.get(selectedTest.chapterId)?.replace('.pdf', '')}</p>
                            
                            <div className="mb-4">
                               <p className="text-lg font-semibold">Class Average: <span className="text-blue-600">{averageScore}%</span></p>
                            </div>
                            
                            {analysis && (
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="font-semibold text-slate-700">Overall Summary</h5>
                                        <p className="text-sm text-slate-600 bg-white p-3 rounded-md">{analysis.overallPerformanceSummary}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-slate-700">Common Misconceptions</h5>
                                        <ul className="list-disc list-inside text-sm text-slate-600 bg-white p-3 rounded-md space-y-1">
                                            {analysis.commonMisconceptions.map((mc, i) => <li key={i}>{mc}</li>)}
                                        </ul>
                                    </div>
                                     <div>
                                        <h5 className="font-semibold text-slate-700">Most Difficult Questions</h5>
                                         <ul className="text-sm text-slate-600 bg-white p-3 rounded-md space-y-2">
                                            {analysis.mostDifficultQuestions.map((q, i) => <li key={i}>"{q.question}" <span className="font-bold text-red-600">({q.incorrectPercentage}% incorrect)</span></li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Analysis By Student Component
const AnalysisByStudent = () => {
    const { user } = useAuth();
    const { getClassesForTeacher, findClassById } = useClass();
    const { getAttemptsForStudent } = useAttempt();
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    if(!user) return null;
    const teacherClasses = getClassesForTeacher(user.email);
    
    const handleSelectStudent = async (studentId) => {
        setSelectedStudent(studentId);
        setAnalysis(null);
        if (!studentId) return;

        setIsLoading(true);
        const attempts = getAttemptsForStudent(studentId);
        if(attempts.length === 0) {
            setIsLoading(false);
            return;
        }
        
        try {
            const result = await api.fetchStudentAnalysis(studentId);
            setAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
             <div className="flex gap-4">
                <select onChange={e => {setSelectedClass(findClassById(e.target.value) || null); handleSelectStudent('');}} className="p-2 border rounded-md">
                    <option value="">Select a Class</option>
                    {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {selectedClass && (
                    <select onChange={e => handleSelectStudent(e.target.value)} className="p-2 border rounded-md" value={selectedStudent || ''}>
                         <option value="">Select a Student</option>
                        {selectedClass.studentIds.map(sid => <option key={sid} value={sid}>{sid}</option>)}
                    </select>
                )}
             </div>
             {selectedStudent && (
                 <div className="mt-6 p-4 border rounded-lg bg-slate-50">
                     {isLoading && <Loader message={`AI is analyzing ${selectedStudent}'s performance...`} />}
                     {!isLoading && !analysis && <p className="text-center text-slate-500">This student has not taken any tests yet.</p>}
                     {analysis && (
                         <div>
                            <h4 className="text-xl font-bold text-slate-800">Performance Report for {selectedStudent}</h4>
                             <div className="space-y-4 mt-4">
                                 <div>
                                    <h5 className="font-semibold text-slate-700">Overall Feedback</h5>
                                    <p className="text-sm text-slate-600 bg-white p-3 rounded-md">{analysis.overallFeedback}</p>
                                 </div>
                                 <div className="grid md:grid-cols-2 gap-4">
                                     <div>
                                        <h5 className="font-semibold text-green-700">Strengths</h5>
                                        <ul className="list-disc list-inside text-sm text-slate-600 bg-green-50 p-3 rounded-md space-y-1">
                                            {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-red-700">Areas for Improvement</h5>
                                        <ul className="list-disc list-inside text-sm text-slate-600 bg-red-50 p-3 rounded-md space-y-1">
                                            {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                 </div>
                                  <div>
                                    <h5 className="font-semibold text-slate-700">Remedial Suggestions</h5>
                                    <ul className="list-disc list-inside text-sm text-slate-600 bg-blue-50 p-3 rounded-md space-y-1">
                                        {analysis.remedialSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                             </div>
                         </div>
                     )}
                 </div>
             )}
        </div>
    );
};


// Analysis By Chapter Component
const AnalysisByChapter = () => {
    const { user } = useAuth();
    const { getChaptersForTeacher } = useChapter();
    const { tests } = useTest();
    const { attempts } = useAttempt();
    const [selectedChapter, setSelectedChapter] = useState(null);

    if (!user) return null;
    const teacherChapters = getChaptersForTeacher(user.email);
    
    const chapterAnalysis = useMemo(() => {
        if (!selectedChapter) return null;
        
        const relevantTests = tests.filter(t => t.chapterId === selectedChapter.id);
        if(relevantTests.length === 0) return { avg: 0, count: 0 };
        
        const testIds = relevantTests.map(t => t.id);
        const relevantAttempts = attempts.filter(a => testIds.includes(a.testId));
        if (relevantAttempts.length === 0) return { avg: 0, count: 0 };
        
        const totalScore = relevantAttempts.reduce((sum, a) => sum + a.score, 0);
        
        return {
            avg: Math.round(totalScore / relevantAttempts.length),
            count: relevantAttempts.length,
        };
    }, [selectedChapter, tests, attempts]);
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Select a chapter to see overall class performance:</h3>
             <div className="flex flex-wrap gap-2">
                {teacherChapters.map(c => (
                    <button key={c.id} onClick={() => setSelectedChapter(c)} className={`px-3 py-1.5 text-sm rounded-full border ${selectedChapter?.id === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                        {c.fileName.replace('.pdf', '')}
                    </button>
                ))}
            </div>
            
            {selectedChapter && chapterAnalysis && (
                <div className="mt-6 p-4 border rounded-lg bg-slate-50 text-center">
                    <h4 className="text-xl font-bold text-slate-800">{selectedChapter.fileName.replace('.pdf', '')}</h4>
                    {chapterAnalysis.count > 0 ? (
                        <div>
                            <p className="text-3xl font-bold text-blue-600 my-2">{chapterAnalysis.avg}%</p>
                            <p className="text-slate-500">Average score across all related tests</p>
                            <p className="text-sm text-slate-400">Based on {chapterAnalysis.count} attempt(s).</p>
                        </div>
                    ) : (
                         <div className="py-4">
                            <AnalysisIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500">No test attempts found for this chapter.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherAnalysisDashboard;

