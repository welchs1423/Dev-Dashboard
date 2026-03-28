import fs from 'fs';
import path from 'path';

interface Job {
  id: number;
  company: string;
  title: string;
  skills: string[];
  url: string;
}

export default function Home() {
  const filePath = path.join(process.cwd(), 'public', 'jobs_data.json');
  let jobs: Job[] = [];

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    jobs = JSON.parse(fileContents);
  } catch (error) {
    console.error("File read failed:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Dev Dashboard</h1>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600">채용공고</a>
            <a href="#" className="hover:text-blue-600">기술트렌드</a>
          </nav>
        </div>
      </header>

      <main className="grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          {/* 서비스 소개 (애드센스 승인용 텍스트) */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 leading-relaxed">
            <h2 className="text-lg font-bold mb-3 text-gray-800">주니어 개발자를 위한 맞춤형 커리어 대시보드</h2>
            <p className="text-sm text-gray-600 mb-3">
              Dev Dashboard는 실시간 채용 데이터를 분석하여 주니어 개발자들에게 꼭 필요한 정보를 선별해 드립니다. 
              단순히 공고를 나열하는 것을 넘어, 현재 시장에서 요구하는 핵심 기술 스택(React, Node.js, Spring 등)의 변화를 추적합니다.
            </p>
            <p className="text-sm text-gray-600">
              성공적인 커리어의 시작을 위해 매일 아침 업데이트되는 공고 리스트를 확인하고, 본인에게 가장 적합한 포지션을 찾아보세요. 
              기술 스택 기반 필터링을 통해 효율적인 취업 준비를 도와드립니다.
            </p>
          </section>

          {/* 대시보드 요약 정보 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">주요 기술 스택</h2>
              <p className="mt-1 text-lg font-bold text-gray-700">React, Java, Python</p>
            </div>
            <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-green-500">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">오늘의 채용 공고</h2>
              <p className="mt-1 text-lg font-bold text-gray-700">{jobs.length} 건 업데이트됨</p>
            </div>
          </section>

          {/* 채용 공고 리스트 */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 pb-2 border-b">
              <h2 className="text-lg font-bold text-gray-800">최신 신입 및 주니어 공고</h2>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">제공: 점핏(Jumpit)</span>
            </div>
            
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <a 
                    key={job.id} 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block p-5 border border-gray-100 rounded-xl hover:bg-blue-50/30 hover:border-blue-200 transition-all group relative"
                  >
                    <div className="flex justify-between items-start">
                      <div className="pr-8">
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-base">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{job.company}</p>
                      </div>
                      <span className="text-gray-300 group-hover:text-blue-400 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-1 bg-white text-blue-600 text-[11px] rounded-md border border-blue-100 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400 italic">데이터를 불러오는 중이거나 현재 등록된 공고가 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 사이드바 */}
        <aside className="space-y-6">
          <div className="bg-gray-100 h-64 rounded-xl flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-200">
            AdSense 광고 영역
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold mb-4 text-gray-800 border-l-4 border-blue-500 pl-2">IT 커리어 일정</h2>
            <ul className="text-xs space-y-4 text-gray-600">
              <li className="flex gap-2 underline decoration-gray-100 underline-offset-4">• 정보처리기사 실기 시험 접수</li>
              <li className="flex gap-2 underline decoration-gray-100 underline-offset-4">• 상반기 주요 IT 기업 공채 시작</li>
              <li className="flex gap-2 underline decoration-gray-100 underline-offset-4">• 부트캠프 및 교육생 모집 소식</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="bg-white border-t border-gray-100 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-400">© 2026 Dev Dashboard</p>
              <p className="text-[11px] text-gray-400 max-w-md leading-relaxed">
                본 서비스는 점핏(Jumpit)의 오픈 API 데이터를 활용하여 주니어 개발자의 커리어 성장을 돕기 위해 제작된 대시보드입니다. 
                채용 정보의 저작권은 각 채용 공고의 원작자 및 점핏에 있습니다.
              </p>
            </div>
            <div className="flex gap-6 text-xs font-medium text-gray-400">
              <a href="/privacy" className="hover:text-blue-500 transition-colors">개인정보처리방침</a>
              <a href="/terms" className="hover:text-blue-500 transition-colors">이용약관</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}