import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClass } from '../context/ClassContext';
import { useChapter } from '../context/ChapterContext';
import { useTest } from '../context/TestContext';
import { useAttempt } from '../context/AttemptContext';
import { ChaptersIcon, TestsIcon } from './icons';

const StudentClassView = ({ onStartTest }) => {
    const { user } = useAuth();
    const { joinClass, getClassesForStudent } = useClass();
    const { getChaptersForClass } = useChapter();
    const { getTestsForClass } = useTest();
    const { getAttemptForTest } = useAttempt();
    const [classCode, setClassCode] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isJoining, setIsJoining] = useState(false);

    if (!user) return null;

    const studentClasses = getClassesForStudent(user.email);

    const handleJoinClass = async (e) => {
        e.preventDefault();
        if (classCode.trim()) {
            setIsJoining(true);
            const result = await joinClass(classCode.trim());
            if (result.success) {
                setFeedback({ type: 'success', message: result.message });
                setClassCode('');
            } else {
                setFeedback({ type: 'error', message: result.message });
            }
            setIsJoining(false);
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">Join a Class</h3>
                    <form onSubmit={handleJoinClass} className="space-y-4">
                        <div>
                            <label htmlFor="class-code" className="block text-sm font-medium text-slate-600 mb-1">Enter Class Code</label>
                            <input
                                type="text"
                                id="class-code"
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value)}
                                placeholder="e.g., A1B2C3"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                            />
                        </div>
                        <button type="submit" disabled={isJoining} className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400">
                            {isJoining ? 'Joining...' : 'Join'}
                        </button>
                    </form>
                    {feedback && (
                        <p className={`mt-3 text-sm font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback.message}
                        </p>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2">
                 <div className="p-6 bg-white rounded-xl shadow-lg h-full">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4">My Classes</h3>
                    {studentClasses.length > 0 ? (
                        <div className="space-y-4">
                        {studentClasses.map(cls => {
                            const assignedChapters = getChaptersForClass(cls.id);
                            const assignedTests = getTestsForClass(cls.id);
                            return (
                                <div key={cls.id} className="bg-slate-50 border rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-slate-800 text-lg">{cls.name}</p>
                                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Enrolled</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center">
                                                <ChaptersIcon className="w-4 h-4 mr-2" />
                                                Assigned Chapters
                                            </h4>
                                            {assignedChapters.length > 0 ? (
                                                <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                                                    {assignedChapters.map(chapter => (
                                                        <li key={chapter.id}>{chapter.fileName.replace('.pdf', '')}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-slate-400">No chapters assigned yet.</p>
                                            )}
                                        </div>
                                         <div>
                                            <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center">
                                                <TestsIcon className="w-4 h-4 mr-2" />
                                                Assigned Tests
                                            </h4>
                                            {assignedTests.length > 0 ? (
                                                <ul className="text-sm text-slate-500 space-y-2">
                                                    {assignedTests.map(test => {
                                                        const attempt = getAttemptForTest(user.email, test.id);
                                                        return (
                                                            <li key={test.id} className="flex justify-between items-center">
                                                                <span>{test.title}</span>
                                                                {attempt ? (
                                                                    <span className="text-xs font-bold text-green-600">COMPLETED</span>
                                                                ) : (
                                                                    <button onClick={() => onStartTest(test)} className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                                                        Take Test
                                                                    </button>
                                                                )}
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-slate-400">No tests assigned yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-500">You haven't joined any classes yet.</p>
                            <p className="text-sm text-slate-400 mt-1">Use the form to join your first class!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentClassView;

