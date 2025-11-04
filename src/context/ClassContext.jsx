'use client';

import React, { createContext, useState, useCallback, useContext } from 'react';
import * as api from '../services/api';

export const ClassContext = createContext(undefined);

export const ClassProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedClasses = await api.fetchClasses();
      setClasses(fetchedClasses);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createClass = useCallback(async (name) => {
    try {
      const newClass = await api.createClass(name);
      setClasses(prev => [...prev, newClass]);
    } catch (e) {
      console.error("Failed to create class:", e);
      // Optionally re-throw or handle error state
    }
  }, []);

  const joinClass = useCallback(async (code) => {
    try {
      const result = await api.joinClass(code);
      if (result.success) {
        setClasses(prev => [...prev, result.class]);
      }
      return { success: result.success, message: result.message };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'An error occurred.' };
    }
  }, []);
  
  const updateClassName = useCallback(async (classId, newName) => {
      try {
          const updatedClass = await api.updateClassName(classId, newName);
          setClasses(prev => prev.map(c => (c.id === classId ? updatedClass : c)));
      } catch (e) {
          console.error("Failed to update class name:", e);
      }
  }, []);

  const deleteClass = useCallback(async (classId) => {
    try {
        await api.deleteClass(classId);
        setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (e) {
        console.error("Failed to delete class:", e);
    }
  }, []);


  const getClassesForTeacher = useCallback((teacherId) => {
    return classes.filter(c => c.teacherId === teacherId);
  }, [classes]);

  const getClassesForStudent = useCallback((studentId) => {
    return classes.filter(c => c.studentIds.includes(studentId));
  }, [classes]);

  const findClassById = useCallback((classId) => {
    return classes.find(c => c.id === classId);
  }, [classes]);

  const value = { classes, loading, error, load, createClass, joinClass, getClassesForTeacher, getClassesForStudent, findClassById, updateClassName, deleteClass };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};

