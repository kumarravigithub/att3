import { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { Loader } from './Loader';
import { useChapter } from '../context/ChapterContext';

const ChapterAnalysis = ({ onAnalysisComplete, onCancel }) => {
  const { uploadAndAddChapter } = useChapter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  const handleFileUpload = useCallback(async (file) => {
    setError(null);
    setIsLoading(true);
    setLoadingMessage('Uploading file and generating educational plan... This may take a moment.');

    try {
      await uploadAndAddChapter(file);
      onAnalysisComplete();
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`An error occurred: ${errorMessage}. Please try again.`);
    } finally {
        setIsLoading(false);
    }
  }, [uploadAndAddChapter, onAnalysisComplete]);
  
  const handleTryAgain = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);


  if (isLoading) {
    return <Loader message={loadingMessage} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-start">
            <button 
                onClick={onCancel}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors text-sm"
            >
                &larr; Back to Chapter History
            </button>
        </div>

        {error ? (
             <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-lg">
                <p className="font-bold text-lg">Oops! Something went wrong.</p>
                <p className="mt-2">{error}</p>
                <button onClick={handleTryAgain} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                    Try Again
                </button>
            </div>
        ) : (
             <FileUpload onFileSelect={handleFileUpload} />
        )}
    </div>
  );
};

export default ChapterAnalysis;

