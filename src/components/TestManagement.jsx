import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTest } from '../context/TestContext';
import { useChapter } from '../context/ChapterContext';
import { useAttempt } from '../context/AttemptContext';
import CreateTestWizard from './CreateTestWizard';
import { ConfirmationModal } from './ConfirmationModal';
import { PlusIcon, TestsIcon, TrashIcon } from './icons';

const TestManagement = () => {
  const { user } = useAuth();
  const { getTestsForTeacher, deleteTest } = useTest();
  const { chapters } = useChapter();
  const { deleteAttemptsForTest } = useAttempt();
  const [isCreating, setIsCreating] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  if (!user) return null;

  const teacherTests = getTestsForTeacher(user.email);
  const chapterMap = new Map(chapters.map(ch => [ch.id, ch.fileName]));

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    // The backend handles cascade deletion of attempts.
    // This local call is for UI consistency.
    deleteAttemptsForTest(testToDelete.id);
    await deleteTest(testToDelete.id);
    setTestToDelete(null); // Close modal
  };

  if (isCreating) {
    return <CreateTestWizard onFinish={() => setIsCreating(false)} />;
  }

  return (
    <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 md:mb-0">Test Management</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center space-x-2 w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create New Test</span>
        </button>
      </div>

      {teacherTests.length > 0 ? (
        <div className="space-y-4">
          {teacherTests.map(test => (
            <div key={test.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 group">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-700">{test.title}</h3>
                    <p className="text-sm text-slate-500">
                      Chapter: {chapterMap.get(test.chapterId)?.replace('.pdf', '') || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Created on: {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => setTestToDelete(test)}
                    className="p-2 bg-red-100 text-red-700 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all"
                    aria-label={`Delete test ${test.title}`}
                  >
                      <TrashIcon className="w-5 h-5" />
                  </button>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-600">Topics Covered:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {test.topics.map(topic => (
                    <span key={topic} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">{topic}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
          <TestsIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No tests created yet</h3>
          <p className="text-slate-500 mt-2">Click "Create New Test" to build your first assessment.</p>
        </div>
      )}

      {testToDelete && (
          <ConfirmationModal
              isOpen={!!testToDelete}
              onClose={() => setTestToDelete(null)}
              onConfirm={handleDeleteTest}
              title="Delete Test"
              message={
                  <p>
                      Are you sure you want to delete the test <span className="font-semibold">"{testToDelete.title}"</span>?
                      <br/><br/>
                      <span className="font-bold">All student attempts for this test will also be deleted.</span> This action cannot be undone.
                  </p>
              }
          />
      )}
    </div>
  );
};

export default TestManagement;

