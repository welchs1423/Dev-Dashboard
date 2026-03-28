# 🚀 Dev Dashboard - 주니어 개발자 커리어 대시보드

> 매일 업데이트되는 신입 및 주니어 채용 공고와 기술 트렌드를 한눈에 확인하는 개인용 대시보드입니다.

## ✨ 주요 기능

- **실시간 채용 큐레이션**: 점핏(Jumpit) API를 활용한 최신 주니어 공고 수집
- **기술 스택 분석**: 공고별 필수 기술 스택(Skills) 시각화
- **완전 자동화**: GitHub Actions를 이용해 매일 오전 9시(KST) 데이터 갱신
- **반응형 디자인**: Tailwind CSS를 활용한 깔끔한 대시보드 UI

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend/Scraper**: Python 3.10 (Requests, BeautifulSoup4)
- **Deployment**: Vercel
- **Automation**: GitHub Actions

## 🏗 시스템 구조 (Pipeline)

1. **Scraping**: GitHub Actions가 정해진 시간에 `scraper.py` 실행
2. **Commit**: 수집된 데이터(`jobs_data.json`)를 GitHub 저장소에 자동 커밋/푸시
3. **Deployment**: 데이터 변경을 감지한 Vercel이 즉시 사이트 재배포
4. **Service**: 전 세계 어디서나 최신 채용 정보를 웹으로 확인

## ⚖️ 데이터 출처 및 저작권

본 프로젝트의 모든 채용 정보는 [점핏(Jumpit)](https://www.jumpit.co.kr)에서 제공하는 공개 API를 바탕으로 합니다. 채용 정보의 저작권은 각 기업 및 점핏에 있으며, 본 서비스는 정보 제공의 편의만을 목적으로 합니다.

---

© 2026 Dev Dashboard. All rights reserved.
