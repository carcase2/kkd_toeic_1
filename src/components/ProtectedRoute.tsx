'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userId } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      router.push('/login');
    }
  }, [userId, router]);

  if (!userId) {
    return null; // 로그인 페이지로 리다이렉트 중
  }

  return <>{children}</>;
}



