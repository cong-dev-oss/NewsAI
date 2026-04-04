import httpx
from bs4 import BeautifulSoup
from typing import List, Dict
from app.core.config import settings

class CrawlerService:
    @staticmethod
    def crawl_article(url: str) -> dict:
        headers = {
            "User-Agent": settings.DEFAULT_USER_AGENT
        }
        try:
            response = httpx.get(url, headers=headers, timeout=10.0, follow_redirects=True)
            if response.status_code != 200:
                return {"title": "", "content": "", "image_url": ""}
                
            soup = BeautifulSoup(response.text, "html.parser")
            
            # 1. Trích xuất Title (VNE: title.title-detail)
            title = soup.find('h1', class_='title-detail')
            if not title: title = soup.find('h1')
            title_text = title.get_text().strip() if title else ""
            
            # 2. Trích xuất Image (VNE: meta property="og:image")
            image = soup.find('meta', property='og:image')
            image_url = image['content'] if image else ""

            # 3. Trích xuất Content
            paragraphs = soup.find_all(['p', 'span'])
            text_lines = []
            for p in paragraphs:
                text = p.get_text().strip()
                if len(text) > 80: # Loại bỏ các đoạn rác nhỏ
                    text_lines.append(text)
            
            return {
                "title": title_text,
                "content": "\n".join(text_lines),
                "image_url": image_url
            }
            
        except Exception as e:
            print(f"Error crawling {url}: {e}")
            return {"title": "", "content": "", "image_url": ""}

    @staticmethod
    def get_links_from_category(category_url: str, limit: int = 5) -> List[str]:
        headers = {
            "User-Agent": settings.DEFAULT_USER_AGENT
        }
        links = []
        try:
            print(f"Crawl links from category: {category_url}")
            response = httpx.get(category_url, headers=headers, timeout=10.0, follow_redirects=True)
            if response.status_code != 200:
                print(f"Failed to fetch category {category_url}: {response.status_code}")
                return []
                
            soup = BeautifulSoup(response.text, "html.parser")
            for a in soup.find_all('a', href=True):
                href = a['href']
                # Support both absolute and relative urls
                if href.startswith('/'):
                    href = "https://vnexpress.net" + href
                
                # Check for common VnExpress article patterns
                if 'vnexpress.net' in href and '.html' in href and len(href) > 40:
                    if href not in links:
                        links.append(href)
                        print(f" Found article: {href}")
                
                if len(links) >= limit:
                    break
            
            print(f"Total links found: {len(links)}")
            return links
        except Exception as e:
            print(f"Error fetching links from {category_url}: {e}")
            return []
