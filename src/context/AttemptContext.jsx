'use client';

import React, { createContext, useState, useCallback, useContext } from 'react';
import * as api from '../services/api';

export const AttemptContext = createContext(undefined);

export const AttemptProvider = ({ children }) => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const fetchedAttempts = await api.fetchAttempts();
        setAttempts(fetchedAttempts);
    } catch(e) {
        setError(e instanceof Error ? e.message : 'Failed to load attempts.');
    } finally {
        setLoading(false);
    }
  }, []);

  const addAttempt = useCallback(async (testId, answers, score) => {
    try {
        const newAttempt = await api.submitAttempt(testId, answers, score);
        setAttempts(prev => [...prev, newAttempt]);
    } catch (e) {
        console.error("Failed to submit attempt:", e);
    }
  }, []);

  const getAttemptsForStudent = useCallback((studentId) => {
    return attempts
      .filter(a => a.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [attempts]);
  
  const getAttemptsForTest = useCallback((testId) => {
    return attempts.filter(a => a.testId === testId);
  }, [attempts]);
  
  const getAttemptForTest = useCallback((studentId, testId) => {
    return attempts.find(a => a.studentId === studentId && a.testId === testId);
  }, [attempts]);
  
  const deleteAttemptsForTest = useCallback((testId) => {
    // Local update, backend cascade delete is the source of truth
    setAttempts(prev => prev.filter(a => a.testId !== testId));
  }, []);

  const deleteAttemptsForTests = useCallback((testIds) => {
    // Local update
    setAttempts(prev => prev.filter(a => !testIds.includes(a.testId)));
  }, []);


  const value = { attempts, loading, error, load, addAttempt, getAttemptsForStudent, getAttemptsForTest, getAttemptForTest, deleteAttemptsForTest, deleteAttemptsForTests };

  return (
    <AttemptContext.Provider value={value}>
      {children}
    </AttemptContext.Provider>
  );
};

export const useAttempt = () => {
  const context = useContext(AttemptContext);
  if (context === undefined) {
    throw new Error('useAttempt must be used within a AttemptProvider');
  }
  return context;
};

