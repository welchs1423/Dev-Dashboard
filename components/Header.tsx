"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('dev_dashboard_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('dev_dashboard_theme', newTheme ? 'dark' : 'light');
      window.dispatchEvent(new Event('themeChange')); // Footer와 상태 동기화
      return newTheme;
    });
  };

  useEffect(() => {
    const handleThemeChange = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const navLinks = [
    { href: '/', label: '채용공고' },
    { href: '/trend', label: '기술트렌드' },
    { href: '/calendar', label: 'IT 캘린더' }
  ];

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 transition-colors duration-200 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={`hover:text-blue-600 dark:hover:text-blue-400 ${pathname === link.href ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <button onClick={toggleDarkMode} className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>
      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 transition-colors duration-200">
        <div className="flex justify-center items-center">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Dev Dashboard</span>
        </div>
      </header>
    </>
  );
}