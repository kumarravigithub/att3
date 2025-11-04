'use client';

import { useState } from 'react';
import ChapterManagement from '../../../components/ChapterManagement';
import ProfileSettings from '../../../components/ProfileSettings';
import ClassManagement from '../../../components/ClassManagement';
import TestManagement from '../../../components/TestManagement';
import TeacherAnalysisDashboard from '../../../components/TeacherAnalysisDashboard';
import { ChaptersIcon, ClassesIcon, TestsIcon, ProfileIcon, AnalysisIcon } from '../../../components/icons';
import { Header } from '../../../components/Header';
import { DataInitializer } from '../../../components/DataInitializer';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('chapters');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chapters':
        return <ChapterManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'tests':
        return <TestManagement />;
      case 'analysis':
        return <TeacherAnalysisDashboard />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

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

  return (
    <DataInitializer>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="animate-fade-in">
          <div className="mb-8" role="tablist" aria-label="Teacher Dashboard">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 p-2 bg-slate-100 rounded-lg">
              <TabButton tabId="chapters" label="Chapters" icon={<ChaptersIcon className="w-5 h-5"/>} />
              <TabButton tabId="classes" label="Classes" icon={<ClassesIcon className="w-5 h-5"/>} />
              <TabButton tabId="tests" label="Tests" icon={<TestsIcon className="w-5 h-5"/>} />
              <TabButton tabId="analysis" label="Analysis" icon={<AnalysisIcon className="w-5 h-5"/>} />
              <TabButton tabId="profile" label="Profile" icon={<ProfileIcon className="w-5 h-5"/>} />
            </div>
          </div>
          <div role="tabpanel">
            {renderTabContent()}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </DataInitializer>
  );
};

export default TeacherDashboard;

