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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold">Dev Dashboard</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500">인기 스택 Top 3</h2>
              <p className="mt-2 text-lg font-bold">React, Java, Python</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-500">신규 공고</h2>
              <p className="mt-2 text-lg font-bold">{jobs.length} 건</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">신입 및 주니어 채용 공고</h2>
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-md">
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <div className="mt-2 flex gap-2">
                      {job.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">데이터를 불러올 수 없습니다.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-500 text-sm">
            광고 배너 영역
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold mb-4">주요 일정</h2>
            <ul className="text-sm space-y-2">
              <li>B 기업 하반기 공채 시작: 4/15</li>
              <li>정보처리기사 실기 접수: 4/1 ~ 4/4</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}