'use client';

import React, { createContext, useState, useCallback, useContext } from 'react';
import * as api from '../services/api';

export const TestContext = createContext(undefined);

export const TestProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTests = await api.fetchTests();
      setTests(fetchedTests);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tests.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTest = useCallback(async (testData) => {
    try {
        const newTest = await api.createTest(testData);
        setTests(prev => [...prev, newTest]);
    } catch (e) {
        console.error("Failed to add test:", e);
    }
  }, []);

  const getTestsForTeacher = useCallback((teacherId) => {
    return tests
      .filter(t => t.teacherId === teacherId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tests]);
  
  const getTestsForClass = useCallback((classId) => {
    return tests
      .filter(t => t.assignedClassIds.includes(classId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tests]);

  const deleteTest = useCallback(async (testId) => {
    try {
        await api.deleteTest(testId);
        setTests(prev => prev.filter(t => t.id !== testId));
        return testId;
    } catch (e) {
        console.error("Failed to delete test:", e);
    }
  }, []);

  const deleteTestsForChapter = useCallback((chapterId) => {
    const testsToDelete = tests.filter(t => t.chapterId === chapterId);
    const deletedTestIds = testsToDelete.map(t => t.id);
    // This is a local update. The backend should handle the actual cascade deletion
    // when a chapter is deleted. This keeps the UI consistent.
    setTests(prev => prev.filter(t => t.chapterId !== chapterId));
    return deletedTestIds;
  }, [tests]);

  const unassignClassFromTests = useCallback((classId) => {
    setTests(prev => prev.map(t => ({
        ...t,
        assignedClassIds: t.assignedClassIds.filter(id => id !== classId)
    })));
  }, []);

  const value = { tests, loading, error, load, addTest, getTestsForTeacher, getTestsForClass, deleteTest, deleteTestsForChapter, unassignClassFromTests };

  return (
    <TestContext.Provider value={value}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};

