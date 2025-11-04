import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const ProfileSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [school, setSchool] = useState(user?.school || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTitle(user.title || '');
      setSchool(user.school || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserProfile({ name, title, school });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!user) {
    return null;
  }

  const InputField = ({ label, id, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

  return (
    <div className="p-6 md:p-10 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <img 
          src={user.picture} 
          alt="Profile" 
          className="w-16 h-16 rounded-full border-2 border-slate-200"
        />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Profile Settings</h2>
          <p className="text-slate-500">Update your personal information.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vikram Singh" />
        
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-100 text-slate-500 cursor-not-allowed"
            />
        </div>

        <InputField label="Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grade 7 Science Teacher" />
        
        <InputField label="School / Organization" id="school" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Delhi Public School" />

        <div className="flex items-center justify-end pt-4">
            <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-slate-400"
            >
                {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;

