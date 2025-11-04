import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChapter } from '../context/ChapterContext';
import { useClass } from '../context/ClassContext';
import { useTest } from '../context/TestContext';
import * as api from '../services/api';
import { Loader } from './Loader';

const CreateTestWizard = ({ onFinish }) => {
  const { user } = useAuth();
  const { getChaptersForTeacher } = useChapter();
  const { getClassesForTeacher, findClassById } = useClass();
  const { addTest } = useTest();
  
  const [step, setStep] = useState('selectChapter');
  const [selectedChapter, setSelectedChapter] = useState(null);
  // Topic extraction is now assumed to be part of the backend flow, 
  // so we'll simplify this step for the frontend. A real implementation might still have this.
  const [availableTopics, setAvailableTopics] = useState(['All Topics']);
  const [selectedTopics, setSelectedTopics] = useState(['All Topics']);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [testTitle, setTestTitle] = useState('');
  const [assignedClassIds, setAssignedClassIds] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  
  if (!user) return null;
  const teacherChapters = getChaptersForTeacher(user.email);

  const handleSelectChapter = async (chapter) => {
    setSelectedChapter(chapter);
    // In the new flow, we can go straight to generating questions based on the whole chapter,
    // or a more advanced backend could still extract topics first. We simplify here.
    setIsLoading(true);
    setLoadingMessage('AI is generating test questions for the selected chapter...');
    setError(null);
    try {
        // The backend can decide to use topics or the whole text. We pass a generic request.
        const { questions } = await api.generateTestQuestions(chapter.id, ['All']);
        const questionsWithIds = questions.map((q, i) => ({ ...q, id: `q-${Date.now()}-${i}` }));
        setGeneratedQuestions(questionsWithIds);
        setSelectedQuestions(questionsWithIds); // Pre-select all
        setStep('generateQuestions');
    } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to generate questions.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFinalize = async () => {
    if (!testTitle || !selectedChapter || selectedQuestions.length === 0) return;
    await addTest({
      title: testTitle,
      chapterId: selectedChapter.id,
      topics: selectedTopics,
      questions: selectedQuestions,
      assignedClassIds,
    });
    onFinish();
  };
  
  const toggleQuestion = (question) => {
    setSelectedQuestions(prev => prev.find(q => q.id === question.id) ? prev.filter(q => q.id !== question.id) : [...prev, question]);
  };

  const availableClassesForAssignment = useMemo(() => {
    if (!selectedChapter) return [];
    return selectedChapter.assignedClassIds.map(id => findClassById(id)).filter(Boolean);
  }, [selectedChapter, findClassById]);
  

  const renderContent = () => {
    if (isLoading) return <Loader message={loadingMessage} />;
    if (error) return (
        <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-bold text-lg">Oops! Something went wrong.</p>
            <p className="mt-2">{error}</p>
            <button onClick={() => { setError(null); setStep('selectChapter'); }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                Start Over
            </button>
        </div>
    );


    switch (step) {
      case 'selectChapter':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700">Step 1: Select a Chapter</h3>
             <p className="text-sm text-slate-500 mb-4">Choose a chapter to generate a test for. The AI will create questions based on its content.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherChapters.map(ch => (
                <button key={ch.id} onClick={() => handleSelectChapter(ch)} className="p-4 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-400 text-left transition">
                  <p className="font-bold text-slate-800">{ch.fileName.replace('.pdf', '')}</p>
                  <p className="text-sm text-slate-500">Created: {new Date(ch.createdAt).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'generateQuestions':
        return (
            <div>
                <h3 className="text-xl font-semibold mb-2 text-slate-700">Step 2: Select Questions</h3>
                 <p className="text-sm text-slate-500 mb-4">The AI has generated these questions from "{selectedChapter?.fileName.replace('.pdf', '')}". Review and select the ones you want in the test.</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto p-3 bg-slate-50 rounded-md border">
                    {generatedQuestions.map(q => (
                        <div key={q.id} className="p-3 bg-white rounded-lg border">
                             <label className="flex items-start">
                                <input type="checkbox" checked={selectedQuestions.some(sq => sq.id === q.id)} onChange={() => toggleQuestion(q)} className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <div className="ml-3">
                                    <p className="font-medium text-slate-800">{q.question}</p>
                                    {q.type === 'multiple-choice' && q.options && (
                                        <div className="mt-2 space-y-1 text-sm">
                                            {q.options.map(opt => <p key={opt} className={`text-slate-600 ${opt === q.correctAnswer ? 'font-bold text-green-600' : ''}`}>{opt}</p>)}
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={() => setStep('finalize')} disabled={selectedQuestions.length === 0} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400">
                        Next: Finalize & Assign
                    </button>
                </div>
            </div>
        );

      case 'finalize':
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-700">Step 3: Finalize and Assign</h3>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="testTitle" className="block text-sm font-medium text-slate-700 mb-1">Test Title</label>
                        <input type="text" id="testTitle" value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="e.g., Chapter 5 Quiz" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-1">Assign to Classes</h4>
                        <p className="text-xs text-slate-500 mb-2">This test can be assigned to classes where the chapter "{selectedChapter?.fileName.replace('.pdf', '')}" is already assigned.</p>
                        <div className="space-y-2 p-2 bg-slate-50 rounded-md border">
                            {availableClassesForAssignment.length > 0 ? availableClassesForAssignment.map(cls => (
                                cls && <label key={cls.id} className="flex items-center p-2 bg-white rounded-md hover:bg-slate-100 cursor-pointer">
                                    <input type="checkbox" checked={assignedClassIds.includes(cls.id)} onChange={() => setAssignedClassIds(prev => prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id])} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="ml-3 text-slate-700">{cls.name}</span>
                                </label>
                            )) : <p className="text-slate-500 text-sm p-2">No relevant classes found. Assign the chapter to a class first.</p>}
                        </div>
                    </div>
                </div>
                 <div className="mt-6 flex justify-between items-center">
                    <button onClick={() => setStep('generateQuestions')} className="text-sm font-medium text-slate-600 hover:text-slate-900">&larr; Back</button>
                    <button onClick={handleFinalize} disabled={!testTitle || selectedQuestions.length === 0} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-slate-400">
                        Create Test
                    </button>
                </div>
            </div>
        )
    }
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Create a New Test</h2>
          <p className="text-slate-500 text-sm">Follow the steps to build your assessment.</p>
        </div>
        <button onClick={onFinish} className="text-sm font-medium text-slate-600 hover:text-slate-900">Cancel</button>
      </div>
      {renderContent()}
    </div>
  );
};

export default CreateTestWizard;

