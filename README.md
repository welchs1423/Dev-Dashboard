# 🚀 Dev Dashboard - 주니어 개발자 커리어 대시보드

> 매일 업데이트되는 신입 및 주니어 채용 공고와 기술 트렌드를 한눈에 확인하는 개인용 대시보드입니다.

## ✨ 주요 기능

- **실시간 채용 큐레이션**: 점핏(Jumpit), 사람인(Saramin), 원티드(Wanted) API를 활용한 최신 주니어 공고 수집
- **기술 스택 분석 및 필터**: 공고별 필수 기술 스택(Skills) 시각화 및 버튼 클릭 필터링 지원
- **완전 자동화**: GitHub Actions를 이용해 매일 정해진 시간에 데이터 자동 갱신
- **반응형 디자인**: Tailwind CSS를 활용한 직관적인 대시보드 UI

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend/Scraper**: Python 3.10 (Requests, BeautifulSoup4)
- **Deployment**: Vercel
- **Automation**: GitHub Actions

## 🏗 시스템 구조 (Pipeline)

1. **Scraping**: GitHub Actions가 `scraper.py` 실행하여 3사 플랫폼 데이터 수집
2. **Commit**: 수집된 통합 데이터(`jobs_data.json`)를 GitHub 저장소에 자동 커밋 및 푸시
3. **Deployment**: 데이터 변경을 감지한 Vercel이 즉시 웹사이트 재배포
4. **Service**: 전 세계 어디서나 최신 채용 정보를 웹으로 확인

## 📅 개발 일지

- **2026-03-29**
  - 공고 북마크(찜하기) 기능 및 로컬스토리지 연동
  - 텍스트 기반 공고 검색 기능 추가
  - 스크롤 탑(Scroll to Top) 기능 구현
  - SEO 및 Open Graph 메타데이터 최적화
  - 사람인(Saramin), 원티드(Wanted) 채용 공고 크롤러 추가 및 연동
  - 프론트엔드 Client Component 전환 및 기술 스택 필터링 동적 기능 구현
  - 플랫폼별 출처 배지(Badge) UI 추가
  - 구글 애드센스(AdSense) 연동 및 개인정보처리방침, 이용약관 페이지 신설
  - 점핏(Jumpit) API 크롤러 연동 및 GitHub Actions 자동화 파이프라인 구축
  - Next.js 기반 기본 대시보드 UI 개발 및 Vercel 배포 완료

## ⚖️ 데이터 출처 및 저작권

본 프로젝트의 모든 채용 정보는 점핏, 사람인, 원티드에서 제공하는 공개 API 및 웹 데이터를 바탕으로 합니다. 채용 정보의 저작권은 각 기업 및 원본 채용 플랫폼에 있으며, 본 서비스는 정보 제공의 편의만을 목적으로 합니다.

---

© 2026 Dev Dashboard. All rights reserved.
