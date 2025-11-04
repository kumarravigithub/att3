'use client';

import { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { FullScreenLoader } from '../../../components/FullScreenLoader';
import { useRouter } from 'next/navigation';

const AuthCallbackPage = () => {
  const { loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // The AuthContext will handle the session exchange
    // Once auth is complete, the root page will redirect appropriately
    if (!loading) {
      // Small delay to ensure tokens are processed
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  }, [loading, router]);

  return <FullScreenLoader message="Completing authentication..." />;
};

export default AuthCallbackPage;

