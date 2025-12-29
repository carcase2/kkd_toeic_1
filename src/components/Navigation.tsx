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
    <nav className="bg-white shadow-md rounded-xl p-4 mb-6">
      <div className="flex justify-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all
              ${pathname === item.href
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-blue-50'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

