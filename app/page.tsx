import fs from 'fs';
import path from 'path';

interface Job {
  id: number;
  company: string;
  title: string;
  skills: string[];
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-blue-600">Dev Dashboard</h1>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 leading-relaxed">
            <h2 className="text-lg font-bold mb-2">주니어 개발자를 위한 기술 트렌드 및 채용 큐레이션</h2>
            <p className="text-sm text-gray-600 mb-2">
              최근 IT 채용 시장에서는 특정 프레임워크나 언어에 대한 이해도뿐만 아니라, 실제 서비스 운영 경험을 중요하게 생각합니다. 
              Dev Dashboard는 매일 업데이트되는 신입 및 주니어 채용 공고를 분석하여, 현재 시장에서 가장 수요가 높은 기술 스택 트렌드를 제공합니다.
            </p>
            <p className="text-sm text-gray-600">
              복잡한 검색 없이 자신에게 맞는 포지션을 찾고, 커리어 성장에 필요한 핵심 기술을 한눈에 파악해 보세요. 성공적인 취업과 이직을 위한 데이터 기반의 인사이트를 제공합니다.
            </p>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500">인기 스택 Top 3</h2>
              <p className="mt-2 text-lg font-bold">React, Java, Python</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500">오늘의 신규 공고</h2>
              <p className="mt-2 text-lg font-bold">{jobs.length} 건</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {/* 👇 출처 표기 1: 공고 리스트 상단 👇 */}
            <div className="flex justify-between items-end mb-4 border-b pb-2">
              <h2 className="text-lg font-bold">신입 및 주니어 채용 공고 리스트</h2>
              <span className="text-xs text-gray-400">데이터 제공: 점핏(Jumpit)</span>
            </div>
            <div className="space-y-4 mt-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">채용 공고 데이터를 불러오는 중입니다.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-500 text-sm border border-gray-300 border-dashed">
            구글 애드센스 광고 영역
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">주요 IT 일정</h2>
            <ul className="text-sm space-y-3 text-gray-600">
              <li>• 정보처리기사 실기 원서 접수</li>
              <li>• 주요 플랫폼 하반기 공채 시작</li>
              <li>• 오픈소스 컨트리뷰톤 멘티 모집</li>
            </ul>
          </div>
        </aside>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 👇 출처 표기 2: 하단 푸터 영역 👇 */}
          <div className="text-sm text-gray-500">
            <p>© 2026 Dev Dashboard. All rights reserved.</p>
            <p className="text-xs mt-1 text-gray-400">본 웹사이트의 채용 정보는 점핏(Jumpit)에서 제공하는 공개 API 데이터를 바탕으로 작성되었습니다.</p>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-blue-600 cursor-pointer">개인정보처리방침</a>
            <a href="/terms" className="hover:text-blue-600 cursor-pointer">이용약관</a>
          </div>
        </div>
      </footer>
    </div>
  );
}