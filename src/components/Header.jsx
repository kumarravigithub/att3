import { useAuth } from '../hooks/useAuth';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            <span className="text-blue-600">AnyTimeTeacher</span> AI
          </h1>
          <p className="text-slate-500 text-sm md:text-base">Your AI-Powered Teaching Assistant</p>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-slate-700">{user.name}</p>
              <p className="text-sm text-slate-500">{user.title || user.email}</p>
            </div>
            <img 
              src={user.picture} 
              alt="User profile" 
              className="w-12 h-12 rounded-full border-2 border-slate-200"
            />
            {logout && (
              <button
                onClick={logout}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

