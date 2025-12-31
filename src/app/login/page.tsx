'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, userId: currentUserId } = useUser();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인되어 있으면 홈으로 리다이렉트
    if (currentUserId) {
      router.push('/');
    }
  }, [currentUserId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = userId.trim();
    if (!trimmedId) {
      alert('아이디를 입력해주세요.');
      return;
    }

    try {
      if (isSignUp) {
        // 회원가입 - 먼저 중복 체크
        if (!password) {
          alert('비밀번호를 입력해주세요.');
          return;
        }
        if (password !== confirmPassword) {
          alert('비밀번호가 일치하지 않습니다.');
          return;
        }

        // 아이디 중복 체크
        const checkResponse = await fetch(`/api/users/check?user_id=${encodeURIComponent(trimmedId)}`);
        const checkData = await checkResponse.json();

        if (checkData.exists) {
          alert('이미 존재하는 아이디입니다.');
          return;
        }

        // 회원가입 진행
        const createResponse = await fetch('/api/users/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: trimmedId, password }),
        });

        if (createResponse.ok) {
          login(trimmedId);
          router.push('/');
        } else {
          const errorData = await createResponse.json();
          alert(errorData.error || '회원가입에 실패했습니다.');
        }
      } else {
        // 로그인
        const checkResponse = await fetch(`/api/users/check?user_id=${encodeURIComponent(trimmedId)}`);
        const checkData = await checkResponse.json();

        if (checkData.exists) {
          // 비밀번호가 있는 경우 확인
          if (password) {
            const loginResponse = await fetch('/api/users/check', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: trimmedId, password }),
            });

            if (loginResponse.ok) {
              login(trimmedId);
              router.push('/');
            } else {
              const errorData = await loginResponse.json();
              alert(errorData.error || '로그인에 실패했습니다.');
            }
          } else {
            // 비밀번호가 없는 기존 사용자는 그냥 로그인
            login(trimmedId);
            router.push('/');
          }
        } else {
          // 존재하지 않으면 회원가입 모드로 전환
          setIsSignUp(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          TOEIC 단어 학습
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          {isSignUp ? '회원가입' : '로그인'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 {isSignUp && <span className="text-red-500">*</span>}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? "비밀번호를 입력하세요" : "비밀번호 (선택사항)"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              required={isSignUp}
            />
            {!isSignUp && (
              <p className="mt-2 text-sm text-gray-500">
                비밀번호가 설정된 계정만 비밀번호를 입력하세요.
              </p>
            )}
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors"
            >
              {isSignUp ? '회원가입' : '로그인'}
            </button>
            {!isSignUp && (
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="px-4 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-colors"
              >
                회원가입
              </button>
            )}
          </div>

          {isSignUp && (
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setPassword('');
                setConfirmPassword('');
              }}
              className="w-full text-gray-600 text-sm hover:text-gray-800"
            >
              이미 계정이 있으신가요? 로그인
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

