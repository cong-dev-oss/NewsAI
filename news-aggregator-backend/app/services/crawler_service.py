import httpx
from bs4 import BeautifulSoup
from typing import Optional, Dict

class CrawlerService:
    @staticmethod
    async def get_hacker_news_top_stories(limit: int = 10):
        """Lấy tin từ Hacker News qua API"""
        try:
            async with httpx.AsyncClient() as client:
                top_ids_resp = await client.get("https://hacker-news.firebaseio.com/v0/topstories.json")
                top_ids = top_ids_resp.json()[:limit]
                
                stories = []
                for story_id in top_ids:
                    story_resp = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json")
                    story_data = story_resp.json()
                    if story_data and "url" in story_data:
                        stories.append({
                            "title": story_data.get("title"),
                            "url": story_data.get("url"),
                            "category": "Công nghệ"
                        })
                return stories
        except Exception as e:
            print(f"Error fetching Hacker News: {e}")
            return []

    @staticmethod
    async def extract_content(url: str) -> Optional[Dict[str, str]]:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, follow_redirects=True)
                response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # This is a generic scraper. For production, you'd want 
            # domain-specific parers as mentioned in 'Rủi ro 3'.
            title = soup.find('h1') or soup.find('title')
            content_divs = soup.find_all(['p', 'div'], class_=['fck_detail', 'content', 'post-content'])
            
            if not title:
                return None
                
            content = ""
            for div in content_divs:
                content += div.get_text(separator='\n', strip=True) + "\n"
                
            # If standard divs not found, just get all paragraphs
            if not content:
                content = "\n".join([p.get_text() for p in soup.find_all('p')])

            return {
                "title": title.get_text(strip=True),
                "content": content,
                "url": url,
                "image_url": CrawlerService._get_og_image(soup)
            }
        except Exception as e:
            print(f"Error crawling {url}: {e}")
            return None

    @staticmethod
    def _get_og_image(soup: BeautifulSoup) -> Optional[str]:
        og_image = soup.find("meta", property="og:image")
        if og_image:
            return og_image.get("content")
        return None

crawler_service = CrawlerService()
