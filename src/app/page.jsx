'use client';

import { useAuth } from '../hooks/useAuth';
import LoginPage from './(auth)/login/page';
import RoleSelectionPage from './(auth)/role-selection/page';
import TeacherDashboard from './(dashboard)/teacher/page';
import StudentDashboard from './(dashboard)/student/page';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { DataInitializer } from '../components/DataInitializer';
import { Header } from '../components/Header';

export default function Home() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader message="Initializing..." />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!role) {
    return <RoleSelectionPage />;
  }

  return (
    <DataInitializer>
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </DataInitializer>
  );
}

