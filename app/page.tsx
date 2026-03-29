"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsTicker from '../components/NewsTicker';
import JobCard from '../components/JobCard';
import StatsSummary from '../components/StatsSummary';

interface Job { id: string; company: string; title: string; skills: string[]; url: string; }
interface NewsItem { title: string; url: string; }

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [customSkills, setCustomSkills] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [displayCount, setDisplayCount] = useState<number>(20);
  
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [hiddenCompanies, setHiddenCompanies] = useState<string[]>([]);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/jobs_data.json').then(res => res.json()).then((data: Job[]) => {
      const uniqueJobs = data.filter((job, index, self) => index === self.findIndex((t) => t.company.trim() === job.company.trim() && t.title.trim() === job.title.trim()));
      const jumpit = uniqueJobs.filter(j => j.id.startsWith('jumpit'));
      const saramin = uniqueJobs.filter(j => j.id.startsWith('saramin'));
      const wanted = uniqueJobs.filter(j => j.id.startsWith('wanted'));
      const mixedJobs: Job[] = [];
      const maxLength = Math.max(jumpit.length, saramin.length, wanted.length);
      for (let i = 0; i < maxLength; i++) {
        if (jumpit[i]) mixedJobs.push(jumpit[i]);
        if (saramin[i]) mixedJobs.push(saramin[i]);
        if (wanted[i]) mixedJobs.push(wanted[i]);
      }
      setJobs(mixedJobs); setIsLoading(false);
    }).catch(() => setIsLoading(false));

    fetch('/news_data.json').then(res => res.json()).then(data => { if (data && data.length > 0) setNews(data); }).catch(() => {});

    setTimeout(() => {
      const savedBookmarks = localStorage.getItem('dev_dashboard_bookmarks'); if (savedBookmarks) setBookmarkedJobs(JSON.parse(savedBookmarks));
      const savedHidden = localStorage.getItem('dev_dashboard_hidden'); if (savedHidden) setHiddenCompanies(JSON.parse(savedHidden));
      const savedMemos = localStorage.getItem('dev_dashboard_memos'); if (savedMemos) setMemos(JSON.parse(savedMemos));
    }, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem('dev_dashboard_bookmarks', JSON.stringify(bookmarkedJobs));
    localStorage.setItem('dev_dashboard_hidden', JSON.stringify(hiddenCompanies));
    localStorage.setItem('dev_dashboard_memos', JSON.stringify(memos));
  }, [bookmarkedJobs, hiddenCompanies, memos]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setDisplayCount(prev => prev + 20); }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInputRef.current?.focus(); }
      else if (e.key === '/' && document.activeElement !== searchInputRef.current) { e.preventDefault(); searchInputRef.current?.focus(); }
      else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) { searchInputRef.current?.blur(); setSearchQuery(""); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTopSkills = () => {
    const skillCounts: Record<string, number> = {};
    jobs.forEach(job => job.skills?.forEach(skill => skillCounts[skill] = (skillCounts[skill] || 0) + 1));
    return Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(entry => entry[0]);
  };

  const filterOptions = ["All", "Bookmark", "Memo", "Hidden", ...getTopSkills()];
  const platformOptions = [{ id: "All", label: "전체 플랫폼" }, { id: "jumpit", label: "점핏" }, { id: "saramin", label: "사람인" }, { id: "wanted", label: "원티드" }];

  const filteredJobs = jobs.filter(job => {
    if (selectedSkill === "Hidden") return hiddenCompanies.includes(job.company);
    if (hiddenCompanies.includes(job.company)) return false;

    const matchPlatform = selectedPlatform === "All" || job.id.startsWith(selectedPlatform);
    let matchSkill = false;
    if (selectedSkill === "All") matchSkill = true;
    else if (selectedSkill === "Bookmark") matchSkill = bookmarkedJobs.includes(job.id);
    else if (selectedSkill === "Memo") matchSkill = !!memos[job.id]; // 메모 필터 로직 추가
    else if (selectedSkill === "Custom") matchSkill = customSkills.length === 0 || customSkills.every(s => job.skills?.some(js => js.toLowerCase().includes(s.toLowerCase())));
    else matchSkill = job.skills?.includes(selectedSkill) ?? false;

    const keyword = searchQuery.toLowerCase().trim();
    const matchSearch = keyword === "" || job.company.toLowerCase().includes(keyword) || job.title.toLowerCase().includes(keyword);

    return matchSkill && matchSearch && matchPlatform;
  });

  const visibleJobs = filteredJobs.slice(0, displayCount);

  const toggleBookmark = (e: React.MouseEvent, jobId: string) => { e.preventDefault(); e.stopPropagation(); setBookmarkedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]); };
  const toggleHiddenCompany = (e: React.MouseEvent, companyName: string) => { e.preventDefault(); e.stopPropagation(); setHiddenCompanies(prev => prev.includes(companyName) ? prev.filter(n => n !== companyName) : [...prev, companyName]); };
  const handleShare = async (e: React.MouseEvent, job: Job) => { e.preventDefault(); e.stopPropagation(); try { if (navigator.share) await navigator.share({ title: job.title, text: `${job.company} - ${job.title}`, url: job.url }); else { await navigator.clipboard.writeText(job.url); alert('링크가 복사되었습니다.'); } } catch {} };
  const handleMemo = (e: React.MouseEvent, jobId: string) => { e.preventDefault(); e.stopPropagation(); const newMemo = window.prompt("메모를 남겨주세요:", memos[jobId] || ""); if (newMemo !== null) setMemos(prev => { const updated = { ...prev }; if (newMemo.trim() === "") delete updated[jobId]; else updated[jobId] = newMemo; return updated; }); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const addCurrentSkill = () => { const newSkill = currentInput.trim(); if (newSkill !== '' && !customSkills.includes(newSkill)) { setCustomSkills(prev => [...prev, newSkill]); setCurrentInput(""); setSelectedSkill("Custom"); setDisplayCount(20); } };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans relative transition-colors duration-200">
      <Header />
      <main className="grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="md:col-span-2 space-y-6">
          <StatsSummary jobs={jobs} topSkills={getTopSkills()} />
          <NewsTicker news={news} />
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-2 border-b dark:border-gray-700 gap-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">최신 채용 공고</h2>
              {!isLoading && (
                <div className="w-full sm:w-64 relative">
                  <input ref={searchInputRef} type="text" placeholder="회사명, 제목 검색 (/ 또는 Cmd+K)" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setDisplayCount(20); }} className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>

            {!isLoading && (
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map(p => <button key={p.id} onClick={() => { setSelectedPlatform(p.id); setDisplayCount(20); }} className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${selectedPlatform === p.id ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 border-transparent' : 'bg-white text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'}`}>{p.label}</button>)}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {filterOptions.map(skill => (
                    <button key={skill} onClick={() => { setSelectedSkill(skill); setDisplayCount(20); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedSkill === skill ? (skill === "Bookmark" ? 'bg-yellow-500 text-white' : skill === "Memo" ? 'bg-blue-500 text-white' : skill === "Hidden" ? 'bg-red-500 text-white' : 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900') : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      {skill === "All" ? "전체 보기" : skill === "Bookmark" ? "⭐ 찜한 공고" : skill === "Memo" ? "📝 내 메모" : skill === "Hidden" ? "🚫 숨긴 기업" : skill}
                    </button>
                  ))}
                  <div className={`flex flex-wrap items-center gap-1.5 px-3 py-1.5 ml-1 rounded-full border transition-all ${selectedSkill === "Custom" || customSkills.length > 0 ? 'bg-blue-50 border-blue-300' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                    {customSkills.map((skill, idx) => <span key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">{skill} <button onClick={() => { const newSkills = customSkills.filter(s => s !== skill); setCustomSkills(newSkills); if(newSkills.length === 0 && selectedSkill === "Custom") setSelectedSkill("All"); }} className="hover:text-red-500">×</button></span>)}
                    <input type="text" placeholder="추가 스택..." value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') addCurrentSkill(); else if (e.key === 'Backspace' && currentInput === '') { const n=[...customSkills]; n.pop(); setCustomSkills(n); if(n.length===0) setSelectedSkill("All"); } }} onBlur={addCurrentSkill} className="bg-transparent text-xs text-gray-700 dark:text-gray-200 focus:outline-none w-24" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isLoading ? Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="block p-5 border border-gray-100 dark:border-gray-700 rounded-xl animate-pulse bg-white dark:bg-gray-800"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div><div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div></div>)
                : visibleJobs.length > 0 ? visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} isBookmarked={bookmarkedJobs.includes(job.id)} isHidden={hiddenCompanies.includes(job.company)} memo={memos[job.id]} onBookmark={toggleBookmark} onHide={toggleHiddenCompany} onMemo={handleMemo} onShare={handleShare} />
                )) : <div className="text-center py-10"><p className="text-sm text-gray-400">검색 조건에 맞는 공고가 없습니다.</p></div>}
            </div>

            {!isLoading && visibleJobs.length < filteredJobs.length && <div ref={loaderRef} className="py-8 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div></div>}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-xl flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200 dark:border-gray-700">AdSense 광고 영역</div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 border-l-4 border-blue-500 pl-2">IT 커리어 일정</h2><Link href="/calendar" className="text-[10px] text-blue-500 hover:underline">전체보기</Link></div>
            <ul className="text-xs space-y-4 text-gray-600 dark:text-gray-400"><li className="flex gap-2 underline underline-offset-4">• 정보처리기사 실기 시험 접수</li><li className="flex gap-2 underline underline-offset-4">• 상반기 주요 IT 기업 공채 시작</li><li className="flex gap-2 underline underline-offset-4">• 부트캠프 및 교육생 모집 소식</li></ul>
          </div>
        </aside>
      </main>
      <Footer />
      {showScrollTop && <button onClick={scrollToTop} className="fixed bottom-24 md:bottom-8 right-8 p-3 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:-translate-y-1 transition-all z-40">↑</button>}
    </div>
  );
}