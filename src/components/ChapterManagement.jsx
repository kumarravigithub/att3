import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChapter } from '../context/ChapterContext';
import { useTest } from '../context/TestContext';
import { useAttempt } from '../context/AttemptContext';
import ChapterAnalysis from './ChapterAnalysis';
import { ResultsDisplay } from './ResultsDisplay';
import AssignChapterModal from './AssignChapterModal';
import { ConfirmationModal } from './ConfirmationModal';
import { PlusIcon, ChaptersIcon, AssignIcon, TrashIcon } from './icons';

export const ChapterManagement = () => {
    const { user } = useAuth();
    const { getChaptersForTeacher, deleteChapter } = useChapter();
    const { deleteTestsForChapter } = useTest();
    const { deleteAttemptsForTests } = useAttempt();
    
    const [view, setView] = useState('history');
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [chapterToAssign, setChapterToAssign] = useState(null);
    const [chapterToDelete, setChapterToDelete] = useState(null);

    if (!user) return null;

    const teacherChapters = getChaptersForTeacher(user.email);

    const handleAnalysisComplete = () => {
        setView('history');
    };

    const handleViewChapter = (chapter) => {
        setSelectedChapter(chapter);
        setView('viewing');
    };
    
    const handleAssignChapter = (chapter) => {
        setChapterToAssign(chapter);
    };

    const handleDeleteChapter = async () => {
        if (!chapterToDelete) return;
        
        // The backend should handle cascading deletes. 
        // We perform local state updates for UI consistency.
        const deletedTestIds = deleteTestsForChapter(chapterToDelete.id);
        if (deletedTestIds.length > 0) {
            deleteAttemptsForTests(deletedTestIds);
        }

        // Make the API call to delete the chapter
        await deleteChapter(chapterToDelete.id);

        setChapterToDelete(null); // Close modal
    };

    if (view === 'addNew') {
        return <ChapterAnalysis onAnalysisComplete={handleAnalysisComplete} onCancel={() => setView('history')} />;
    }
    
    if (view === 'viewing' && selectedChapter) {
        return (
            <div>
                 <div className="mb-6">
                    <button onClick={() => setView('history')} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-sm">
                        &larr; Back to Chapter History
                    </button>
                </div>
                <ResultsDisplay content={selectedChapter.content} fileName={selectedChapter.fileName} onReset={() => setView('history')} />
            </div>
        );
    }


    return (
        <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 md:mb-0">Chapter History</h2>
                <button
                    onClick={() => setView('addNew')}
                    className="flex items-center justify-center space-x-2 w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Analyze New Chapter</span>
                </button>
            </div>

            {teacherChapters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherChapters.map(chapter => (
                        <div key={chapter.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="text-lg font-bold text-slate-700 truncate">{chapter.fileName.replace('.pdf', '')}</h3>
                                <p className="text-sm text-slate-500">
                                    Created on: {new Date(chapter.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center space-x-2">
                                <button 
                                    onClick={() => handleViewChapter(chapter)}
                                    className="flex-1 px-3 py-2 bg-white border border-slate-300 text-slate-600 text-sm font-semibold rounded-md hover:bg-slate-100 transition-colors"
                                >
                                    View Plan
                                </button>
                                <button 
                                    onClick={() => handleAssignChapter(chapter)}
                                    className="px-3 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1.5"
                                >
                                    <AssignIcon className="w-4 h-4" />
                                    <span>Assign</span>
                                </button>
                                <button 
                                    onClick={() => setChapterToDelete(chapter)}
                                    className="p-2 bg-red-100 text-red-700 text-sm font-semibold rounded-md hover:bg-red-200 transition-colors"
                                    aria-label={`Delete chapter ${chapter.fileName}`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
                    <ChaptersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No chapters analyzed yet</h3>
                    <p className="text-slate-500 mt-2">Click "Analyze New Chapter" to create your first educational plan.</p>
                </div>
            )}
            
            {chapterToAssign && (
                <AssignChapterModal 
                    chapter={chapterToAssign}
                    onClose={() => setChapterToAssign(null)}
                />
            )}

            {chapterToDelete && (
                <ConfirmationModal
                    isOpen={!!chapterToDelete}
                    onClose={() => setChapterToDelete(null)}
                    onConfirm={handleDeleteChapter}
                    title="Delete Chapter"
                    message={
                        <p>
                            Are you sure you want to delete the chapter <span className="font-semibold">"{chapterToDelete.fileName.replace('.pdf', '')}"</span>? 
                            <br/><br/>
                            <span className="font-bold">This will also delete all associated tests and student attempts.</span> This action cannot be undone.
                        </p>
                    }
                />
            )}
        </div>
    );
};

export default ChapterManagement;

