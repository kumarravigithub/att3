'use client';

import React, { createContext, useState, useCallback, useContext } from 'react';
import * as api from '../services/api';

export const ChapterContext = createContext(undefined);

export const ChapterProvider = ({ children }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedChapters = await api.fetchChapters();
      setChapters(fetchedChapters);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chapters.');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAndAddChapter = useCallback(async (file) => {
    const newChapter = await api.uploadChapter(file);
    setChapters(prev => [...prev, newChapter]);
  }, []);
  
  const getChaptersForTeacher = useCallback((teacherId) => {
    return chapters
        .filter(c => c.teacherId === teacherId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [chapters]);

  const getChaptersForClass = useCallback((classId) => {
    return chapters
      .filter(c => c.assignedClassIds.includes(classId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [chapters]);

  const assignChapterToClasses = useCallback(async (chapterId, classIds) => {
    try {
        const updatedChapter = await api.assignChapterToClasses(chapterId, classIds);
        setChapters(prev => prev.map(c => (c.id === chapterId ? updatedChapter : c)));
    } catch (e) {
        console.error("Failed to assign chapter:", e);
    }
  }, []);
  
  const deleteChapter = useCallback(async (chapterId) => {
    try {
        await api.deleteChapter(chapterId);
        setChapters(prev => prev.filter(c => c.id !== chapterId));
    } catch(e) {
        console.error("Failed to delete chapter:", e);
    }
  }, []);

  const unassignClassFromChapters = useCallback((classId) => {
    // This is a local state update triggered by a class deletion.
    // The backend should handle the data consistency.
    setChapters(prev => prev.map(ch => ({
      ...ch,
      assignedClassIds: ch.assignedClassIds.filter(id => id !== classId)
    })));
  }, []);

  const value = { chapters, loading, error, load, uploadAndAddChapter, getChaptersForTeacher, getChaptersForClass, assignChapterToClasses, deleteChapter, unassignClassFromChapters };

  return (
    <ChapterContext.Provider value={value}>
      {children}
    </ChapterContext.Provider>
  );
};

export const useChapter = () => {
  const context = useContext(ChapterContext);
  if (context === undefined) {
    throw new Error('useChapter must be used within a ChapterProvider');
  }
  return context;
};

