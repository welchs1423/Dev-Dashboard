import os
import json
import requests

def fetch_jumpit_jobs():
    # 점핏 채용 공고 API 엔드포인트
    url = "https://api.jumpit.co.kr/api/positions"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    params = {
        "sort": "reg_dt",
        "page": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        jobs = []
        positions = data.get("result", {}).get("positions", [])

        for item in positions:
            job_id = item.get("id")
            job = {
                "id": job_id,
                "company": item.get("companyName"),
                "title": item.get("title"),
                "skills": item.get("techStacks", []),
                # 실제 점핏 공고 상세 페이지 URL 생성
                "url": f"https://www.jumpit.co.kr/position/{job_id}"
            }
            jobs.append(job)

        return jobs

    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def main():
    data = fetch_jumpit_jobs()

    save_dir = "public"
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    file_path = os.path.join(save_dir, "jobs_data.json")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()