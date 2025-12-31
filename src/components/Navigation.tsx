'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { userId, logout } = useUser();

  const navItems = [
    { href: '/', label: '달력', icon: '📅' },
    { href: '/study', label: '학습', icon: '📚' },
    { href: '/incorrect', label: '오답', icon: '❌' },
    { href: '/stats', label: '통계', icon: '📊' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex justify-between items-center gap-2 sm:gap-6">
        <div className="flex gap-2 sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base
                ${pathname === item.href
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-50'
                }
              `}
            >
              <span className="text-lg sm:text-xl">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {userId && (
            <>
              <span className="text-xs sm:text-sm text-gray-600 font-medium hidden sm:inline">
                {userId}
              </span>
              <button
                onClick={handleLogout}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                로그아웃
              </button>
            </>
          )}
          <div className="text-xs text-gray-400 font-mono hidden sm:block">
            v1.2.0
          </div>
        </div>
      </div>
    </nav>
  );
}


