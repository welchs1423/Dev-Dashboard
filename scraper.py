import os
import json
import requests
import time
from deep_translator import GoogleTranslator

# 공통 헤더 설정 (차단 방지)
COMMON_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9"
}

def fetch_it_news():
    """IT 뉴스 수집 및 영어 제목 한국어 번역"""
    translator = GoogleTranslator(source='auto', target='ko')
    news_list = []
    
    # 1. 긱뉴스 (Hada) - 국내 IT 커뮤니티
    try:
        from bs4 import BeautifulSoup
        url = "https://news.hada.io/"
        response = requests.get(url, headers=COMMON_HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 최신 뉴스 10개 추출
        for item in soup.select('.topictitle a')[:10]:
            title = item.text.strip()
            link = item.get('href', '')
            if not link.startswith('http'): 
                link = "https://news.hada.io" + link
            news_list.append({
                "source": "긱뉴스", 
                "title": title, 
                "url": link
            })
    except Exception as e:
        print(f"Hada Parsing Error: {e}")

    # 2. Hacker News - 글로벌 기술 트렌드 (공식 API)
    try:
        top_stories_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
        ids_res = requests.get(top_stories_url, timeout=10)
        story_ids = ids_res.json()[:10]
        
        for sid in story_ids:
            item_url = f"https://hacker-news.firebaseio.com/v0/item/{sid}.json"
            item_res = requests.get(item_url, timeout=5)
            item_data = item_res.json()
            
            if item_data and "title" in item_data and "url" in item_data:
                original_title = item_data['title']
                # 제목 번역
                translated_title = translator.translate(original_title)
                news_list.append({
                    "source": "Hacker News", 
                    "title": f"[번역] {translated_title}", 
                    "original_title": original_title,
                    "url": item_data['url']
                })
            time.sleep(0.1) # 짧은 지연시간 추가
    except Exception as e:
        print(f"Hacker News API Error: {e}")

    # 3. Dev.to - 개발자 아티클 및 인사이트 (공식 API)
    try:
        dev_to_url = "https://dev.to/api/articles?top=1&per_page=10"
        response = requests.get(dev_to_url, headers=COMMON_HEADERS, timeout=10)
        data = response.json()
        
        for item in data:
            original_title = item['title']
            # 제목 번역
            translated_title = translator.translate(original_title)
            news_list.append({
                "source": "Dev.to", 
                "title": f"[번역] {translated_title}",
                "original_title": original_title,
                "url": item['url']
            })
    except Exception as e:
        print(f"Dev.to API Error: {e}")

    return news_list

def main():
    save_dir = "public"
    if not os.path.exists(save_dir): 
        os.makedirs(save_dir)

    print("IT 뉴스 수집 및 번역을 시작합니다...")
    all_news = fetch_it_news()
    
    # 결과 저장
    save_path = os.path.join(save_dir, "news_data.json")
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)
        
    print(f"작업 완료: 총 {len(all_news)}개의 뉴스가 {save_path}에 저장되었습니다.")

if __name__ == "__main__":
    main()