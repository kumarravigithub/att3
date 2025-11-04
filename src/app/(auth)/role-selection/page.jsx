'use client';

import { useAuth } from '../../../hooks/useAuth';
import { TeacherIcon, StudentIcon } from '../../../components/icons';

const RoleSelectionPage = () => {
  const { user, selectRole } = useAuth();

  if (!user) return null; // Or a loading/error state

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-10 bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-2 mb-8">To get started, please tell us who you are.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => selectRole('teacher')}
            className="group p-8 border-2 border-slate-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Select Teacher role"
          >
            <div className="flex justify-center mb-4">
                <TeacherIcon className="w-16 h-16 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 group-hover:text-blue-600">I am a Teacher</h2>
            <p className="text-slate-500 mt-2">Create lesson plans, manage classes, and track student progress.</p>
          </button>
          <button
            onClick={() => selectRole('student')}
            className="group p-8 border-2 border-slate-200 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Select Student role"
          >
             <div className="flex justify-center mb-4">
                <StudentIcon className="w-16 h-16 text-slate-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 group-hover:text-green-600">I am a Student</h2>
            <p className="text-slate-500 mt-2">Join classes, take tests, and view your performance.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

