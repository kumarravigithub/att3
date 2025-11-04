import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClass } from '../context/ClassContext';
import { useChapter } from '../context/ChapterContext';
import { useTest } from '../context/TestContext';
import { useAttempt } from '../context/AttemptContext';
import { FullScreenLoader } from './FullScreenLoader';

// Use a module-level map to track initialization across component remounts
const initializationMap = new Map();

export const DataInitializer = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const { load: loadClasses, loading: classesLoading, error: classesError } = useClass();
    const { load: loadChapters, loading: chaptersLoading, error: chaptersError } = useChapter();
    const { load: loadTests, loading: testsLoading, error: testsError } = useTest();
    const { load: loadAttempts, loading: attemptsLoading, error: attemptsError } = useAttempt();
    
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Only load data if user is authenticated
        if (authLoading || !user) {
            setIsInitialized(false);
            return;
        }

        const userId = user.id || user.email || user._id;
        if (!userId) return;
        
        // Check module-level map to see if we've already initialized for this user
        const existingState = initializationMap.get(userId);
        
        if (existingState) {
            if (existingState.status === 'initialized') {
                setIsInitialized(true);
                return;
            }
            // If already initializing, wait for it to complete
            if (existingState.status === 'initializing') {
                return;
            }
        }

        // Mark as initializing in module-level map
        initializationMap.set(userId, { status: 'initializing' });

        const initializeData = async () => {
            try {
                await Promise.allSettled([
                    loadClasses(),
                    loadChapters(),
                    loadTests(),
                    loadAttempts(),
                ]);
                // Mark as initialized in module-level map
                initializationMap.set(userId, { status: 'initialized' });
                setIsInitialized(true);
            } catch (error) {
                console.error('Data initialization error:', error);
                // Still mark as initialized to show error
                initializationMap.set(userId, { status: 'initialized' });
                setIsInitialized(true);
            }
        };
        
        initializeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, user?.email, authLoading]);

    const isLoading = authLoading || classesLoading || chaptersLoading || testsLoading || attemptsLoading || !isInitialized;
    const error = classesError || chaptersError || testsError || attemptsError;


    if (isLoading || !user) {
        return <FullScreenLoader message="Loading your dashboard..." />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-center">
                <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <h2 className="text-xl font-bold">Failed to load data</h2>
                    <p className="mt-2">{error}</p>
                    <p className="mt-4 text-sm">Please try refreshing the page.</p>
                </div>
            </div>
        );
    }
    
    return <>{children}</>;
};

