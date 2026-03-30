"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

useEffect(() => {
  // 초기 다크모드 상태 확인
  const checkTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  };

  checkTheme();

  const handleThemeChange = () => {
    // 🚀 React가 렌더링 중일 때 setState를 호출하지 않도록 보장
    requestAnimationFrame(() => {
      checkTheme();
    });
  };

  window.addEventListener('themeChange', handleThemeChange);
  return () => window.removeEventListener('themeChange', handleThemeChange);
}, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      document.documentElement.classList.toggle('dark', newTheme);
      localStorage.setItem('dev_dashboard_theme', newTheme ? 'dark' : 'light');
      window.dispatchEvent(new Event('themeChange'));
      return newTheme;
    });
  };

  return (
    <>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-10 mt-12 pb-24 md:pb-10 transition-colors duration-200 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-bold text-gray-400">© 2026 Dev Dashboard</p>
        </div>
      </footer>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-50">
        <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <span className="text-xl mb-1">💼</span><span className="text-[10px] font-medium">채용공고</span>
        </Link>
        <Link href="/trend" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/trend' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
          <span className="text-xl mb-1">📈</span><span className="text-[10px] font-medium">트렌드</span>
        </Link>
        <button onClick={toggleDarkMode} className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
          <span className="text-xl mb-1">{isDarkMode ? '🌙' : '☀️'}</span><span className="text-[10px] font-medium">테마</span>
        </button>
      </nav>
    </>
  );
}