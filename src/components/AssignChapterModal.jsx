import { useState } from 'react';
import { useClass } from '../context/ClassContext';
import { useChapter } from '../context/ChapterContext';
import { useAuth } from '../hooks/useAuth';
import { CloseIcon } from './icons';

const AssignChapterModal = ({ chapter, onClose }) => {
  const { user } = useAuth();
  const { getClassesForTeacher } = useClass();
  const { assignChapterToClasses } = useChapter();
  
  const [selectedClassIds, setSelectedClassIds] = useState(chapter.assignedClassIds || []);
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const teacherClasses = getClassesForTeacher(user.email);

  const handleCheckboxChange = (classId) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await assignChapterToClasses(chapter.id, selectedClassIds);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Assign Chapter</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-slate-600 mb-1">Chapter: <span className="font-semibold">{chapter.fileName.replace('.pdf', '')}</span></p>
        <p className="text-slate-600 mb-4">Select the class(es) to assign this chapter to:</p>
        
        <div className="max-h-60 overflow-y-auto space-y-2 border p-3 rounded-md bg-slate-50">
            {teacherClasses.length > 0 ? teacherClasses.map(cls => (
                <label key={cls.id} className="flex items-center p-2 bg-white rounded-md hover:bg-slate-100 cursor-pointer">
                    <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedClassIds.includes(cls.id)}
                        onChange={() => handleCheckboxChange(cls.id)}
                    />
                    <span className="ml-3 text-slate-700 font-medium">{cls.name}</span>
                </label>
            )) : (
                <p className="text-slate-500 text-center py-4">You have not created any classes yet.</p>
            )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-slate-400"
            >
              {isSaving ? 'Saving...' : 'Save Assignments'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssignChapterModal;

