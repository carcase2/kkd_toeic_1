'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '달력', icon: '📅' },
    { href: '/study', label: '학습', icon: '📚' },
    { href: '/stats', label: '통계', icon: '📊' },
  ];

  return (
    <nav className="bg-white shadow-md rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex justify-center items-center gap-2 sm:gap-6">
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
        <div className="text-xs text-gray-400 font-mono hidden sm:block">
          v1.1.0
        </div>
      </div>
    </nav>
  );
}


