'use client';

import { useState } from 'react';
import ProfileSettings from '../../../components/ProfileSettings';
import StudentClassView from '../../../components/StudentClassView';
import StudentAnalysisDashboard from '../../../components/StudentAnalysisDashboard';
import TakeTest from '../../../components/TakeTest';
import { ProfileIcon, ClassesIcon, AnalysisIcon } from '../../../components/icons';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('main');
  const [testToTake, setTestToTake] = useState(null);

  const handleStartTest = (test) => {
    setTestToTake(test);
  };
  
  const handleFinishTest = () => {
    setTestToTake(null);
    setActiveTab('analysis'); // Switch to analysis tab after finishing test
  };

  if (testToTake) {
    return <TakeTest test={testToTake} onFinish={handleFinishTest} />;
  }

  const TabButton = ({ tabId, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center space-x-2 px-4 py-3 font-medium rounded-lg transition-colors text-sm md:text-base ${
        activeTab === tabId
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
      role="tab"
      aria-selected={activeTab === tabId}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'main':
        return (
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Student Dashboard</h2>
            <StudentClassView onStartTest={handleStartTest} />
          </div>
        );
      case 'analysis':
        return <StudentAnalysisDashboard />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8" role="tablist" aria-label="Student Dashboard">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 p-2 bg-slate-100 rounded-lg">
          <TabButton tabId="main" label="Dashboard" icon={<ClassesIcon className="w-5 h-5"/>} />
          <TabButton tabId="analysis" label="Analysis" icon={<AnalysisIcon className="w-5 h-5"/>} />
          <TabButton tabId="profile" label="Profile" icon={<ProfileIcon className="w-5 h-5"/>} />
        </div>
      </div>
      <div role="tabpanel">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;

