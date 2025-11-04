'use client';

import { useAuth } from '../../../hooks/useAuth';

const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691c-1.229 2.503-1.936 5.31-1.936 8.309s.707 5.806 1.936 8.309l-5.657 5.657C.22 33.438 0 28.864 0 24s.22-9.438 2.649-13.657l5.657 4.348z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238c-2.008 1.349-4.402 2.13-7.219 2.13c-5.216 0-9.757-3.467-11.307-8.182l-5.657 5.657C7.34 39.123 15.254 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083L43.595 20L42 20H24v8h11.303c-.792 2.23-2.24 4.135-4.062 5.571l6.19 5.238c3.637-3.341 6.128-8.261 6.128-14.409c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

const LoginPage = () => {
  const { login } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-10 bg-white rounded-xl shadow-2xl max-w-md w-full animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
          Welcome to <span className="text-blue-600">AnyTimeTeacher</span> AI
        </h1>
        <p className="text-slate-500 mt-4 mb-8">
          Your AI-powered assistant for creating comprehensive lesson plans from NCERT chapters.
        </p>
        <button
          onClick={login}
          className="w-full flex items-center justify-center bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Sign in with Google"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

