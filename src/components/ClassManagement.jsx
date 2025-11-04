import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClass } from '../context/ClassContext';
import { useChapter } from '../context/ChapterContext';
import { useTest } from '../context/TestContext';
import { PlusIcon, CopyIcon, CloseIcon, ClassesIcon, EditIcon, TrashIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

const CreateClassModal = ({ onClose, onSubmit, value, onChange, isCreating }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Create a New Class</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor="className" className="block text-sm font-medium text-slate-700 mb-2">Class Name</label>
        <input
          id="className"
          type="text"
          value={value}
          onChange={onChange}
          placeholder="e.g., Grade 10 - Science"
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
          required
          autoFocus
        />
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-slate-400"
          >
            {isCreating ? 'Creating...' : 'Create Class'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const ClassManagement = () => {
  const { user } = useAuth();
  const { createClass, getClassesForTeacher, updateClassName, deleteClass } = useClass();
  const { unassignClassFromChapters } = useChapter();
  const { unassignClassFromTests } = useTest();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingClassName, setEditingClassName] = useState('');
  const [classToDelete, setClassToDelete] = useState(null);

  if (!user) return null;

  const teacherClasses = getClassesForTeacher(user.email);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (newClassName.trim()) {
      setIsCreating(true);
      await createClass(newClassName.trim());
      setNewClassName('');
      setIsModalOpen(false);
      setIsCreating(false);
    }
  };
  
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStartEdit = (cls) => {
    setEditingClassId(cls.id);
    setEditingClassName(cls.name);
  };

  const handleCancelEdit = () => {
      setEditingClassId(null);
      setEditingClassName('');
  };

  const handleSaveEdit = async () => {
      if (editingClassId && editingClassName.trim()) {
          await updateClassName(editingClassId, editingClassName.trim());
      }
      handleCancelEdit();
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;
    unassignClassFromChapters(classToDelete.id);
    unassignClassFromTests(classToDelete.id);
    await deleteClass(classToDelete.id);
    setClassToDelete(null);
  };

  return (
    <div className="p-6 md:p-8 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 md:mb-0">Class Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create New Class</span>
        </button>
      </div>

      {teacherClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherClasses.map(cls => (
            <div key={cls.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
              <div>
                {editingClassId === cls.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingClassName}
                      onChange={(e) => setEditingClassName(e.target.value)}
                      className="w-full text-lg font-bold text-slate-700 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                     <div className="flex items-center space-x-2 mt-2">
                        <button onClick={handleSaveEdit} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Save</button>
                        <button onClick={handleCancelEdit} className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start group">
                    <div>
                        <h3 className="text-lg font-bold text-slate-700">{cls.name}</h3>
                        <p className="text-sm text-slate-500">{cls.studentIds.length} Student{cls.studentIds.length !== 1 && 's'}</p>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleStartEdit(cls)} className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors">
                            <EditIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setClassToDelete(cls)} className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-2">Class Code:</p>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg bg-slate-200 text-slate-700 px-3 py-1 rounded-md">{cls.code}</span>
                  <button onClick={() => handleCopyCode(cls.code)} className="p-2 text-slate-500 hover:bg-slate-300 rounded-md transition">
                    <CopyIcon className="w-5 h-5" />
                  </button>
                  {copiedCode === cls.code && <span className="text-sm text-green-600">Copied!</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
          <ClassesIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No classes yet</h3>
          <p className="text-slate-500 mt-2">Click "Create New Class" to get started and invite your students.</p>
        </div>
      )}

      {isModalOpen && (
        <CreateClassModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateClass}
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          isCreating={isCreating}
        />
      )}

      {classToDelete && (
        <ConfirmationModal
            isOpen={!!classToDelete}
            onClose={() => setClassToDelete(null)}
            onConfirm={handleDeleteClass}
            title="Delete Class"
            message={
                <p>
                    Are you sure you want to delete the class <span className="font-semibold">"{classToDelete.name}"</span>? 
                    <br/><br/>
                    This action will un-assign all chapters and tests from this class and cannot be undone.
                </p>
            }
        />
      )}
    </div>
  );
};

export default ClassManagement;

