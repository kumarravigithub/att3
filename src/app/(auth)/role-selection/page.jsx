'use client';

import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { TeacherIcon, StudentIcon } from '../../../components/icons';

const RoleSelectionPage = () => {
  const { user, selectRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null; // Or a loading/error state

  const handleRoleSelect = async (role) => {
    setLoading(true);
    setError(null);
    
    try {
      await selectRole(role);
      // Redirect to appropriate dashboard after role selection
      if (role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }
    } catch (err) {
      console.error('Error selecting role:', err);
      
      // If authentication is required, redirect to login
      if (err.status === 401 || (err.details && err.details.errorData?.requiresReauth)) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(err.message || 'Failed to set role. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-10 bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800">Welcome, {user.name.split(' ')[0]}!</h1>
        <p className="text-slate-500 mt-2 mb-8">To get started, please tell us who you are.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleRoleSelect('teacher')}
            disabled={loading}
            className="group p-8 border-2 border-slate-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Select Teacher role"
          >
            <div className="flex justify-center mb-4">
                <TeacherIcon className="w-16 h-16 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 group-hover:text-blue-600">I am a Teacher</h2>
            <p className="text-slate-500 mt-2">Create lesson plans, manage classes, and track student progress.</p>
          </button>
          <button
            onClick={() => handleRoleSelect('student')}
            disabled={loading}
            className="group p-8 border-2 border-slate-200 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Select Student role"
          >
             <div className="flex justify-center mb-4">
                <StudentIcon className="w-16 h-16 text-slate-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 group-hover:text-green-600">I am a Student</h2>
            <p className="text-slate-500 mt-2">Join classes, take tests, and view your performance.</p>
          </button>
        </div>
        
        {loading && (
          <div className="mt-6">
            <p className="text-slate-500">Setting up your account...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectionPage;

