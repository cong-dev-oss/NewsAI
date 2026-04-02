import httpx
from bs4 import BeautifulSoup
from typing import List, Dict

class CrawlerService:
    @staticmethod
    def crawl_article(url: str) -> str:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        try:
            response = httpx.get(url, headers=headers, timeout=10.0, follow_redirects=True)
            if response.status_code != 200:
                print(f"Failed to fetch {url}: {response.status_code}")
                return ""
                
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Simple heuristic to get article text - adjust for specific sites if needed
            # For VNExpress: article_content, description, title
            paragraphs = soup.find_all(['p', 'span'])
            
            text_lines = []
            for p in paragraphs:
                text = p.get_text().strip()
                if len(text) > 50: # Avoid small meta bits
                    text_lines.append(text)
            
            return "\n".join(text_lines)
            
        except Exception as e:
            print(f"Error crawling {url}: {e}")
            return ""

    @staticmethod
    def get_links_from_category(category_url: str, limit: int = 5) -> List[str]:
        # This function should be more specific per site, but for now a generic one
        headers = {"User-Agent": "Mozilla/5.0"}
        try:
            response = httpx.get(category_url, headers=headers, timeout=10.0, follow_redirects=True)
            soup = BeautifulSoup(response.text, "html.parser")
            
            links = []
            # VNE example links are often in h3 > a
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.startswith('http') and ('.html' in href or 'vnexpress.net' in href):
                    if href not in links:
                        links.append(href)
                if len(links) >= limit:
                    break
            return links
        except Exception as e:
            print(f"Error getting links from {category_url}: {e}")
            return []
