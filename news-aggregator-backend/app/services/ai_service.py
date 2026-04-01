import httpx
from typing import Optional
from app.core.config import settings
import ollama

class AIService:
    def __init__(self, model: str = "qwen2:1.5b"):
        self.model = model
        self.client = ollama.Client(host=settings.OLLAMA_BASE_URL)

    async def summarize_text(self, text: str) -> Optional[str]:
        try:
            # Prompt cực mạnh để ép Qwen2 dịch sang tiếng Việt
            prompt = f"""
            Nhiệm vụ: Đọc và tóm tắt bài báo sau.
            Yêu cầu BẮT BUỘC:
            1. Trả về kết quả hoàn toàn bằng TIẾNG VIỆT.
            2. Tóm tắt ngắn gọn trong 2-3 câu.
            3. Giữ nguyên các từ chuyên ngành (Kubernetes, AI, Docker, Ruby, JVM, AST...).
            4. Phải viết theo văn phong báo chí hiện đại, không mở đầu bằng "Đây là bản tóm tắt...".

            Nội dung bài báo (Tiếng Anh):
            {text[:4000]}
            """
            
            response = self.client.generate(model=self.model, prompt=prompt)
            return response['response'].strip()
        except Exception as e:
            print(f"Error summarizing with Ollama: {e}")
            return None

    async def translate_title(self, title: str) -> Optional[str]:
        """Dịch tiêu đề sang tiếng Việt nhưng giữ thuật ngữ chuyên ngành"""
        try:
            prompt = f"Nhiệm vụ: Dịch tiêu đề sau sang tiếng Việt tự nhiên nhất. YÊU CẦU: CHỈ TRẢ VỀ KẾT QUẢ DỊCH, KHÔNG THÊM BẤT KỲ LỜI GIỚI THIỆU NÀO: '{title}'"
            response = self.client.generate(model=self.model, prompt=prompt)
            return response['response'].strip().replace('"', '')
        except Exception as e:
            print(f"Error translating title: {e}")
            return title

    async def translate_text(self, text: str) -> Optional[str]:
        """Dịch đoạn văn bản dài sang tiếng Việt chuyên sâu công nghệ"""
        try:
            prompt = f"""
            HÀNH ĐỘNG: Dịch đoạn văn bản sau sang tiếng Việt.
            QUY TẮC: 
            1. CHỈ TRẢ VỀ BẢN DỊCH. 
            2. KHÔNG LẶP LẠI YÊU CẦU NÀY. 
            3. KHÔNG THÊM LỜI DẪN.
            4. Giữ nguyên thuật ngữ chuyên môn.

            Văn bản cần dịch:
            {text[:3000]}
            """
            response = self.client.generate(model=self.model, prompt=prompt)
            # Loại bỏ sạch các dòng thừa nếu AI cố tình trả về
            result = response['response'].strip()
            return result
        except Exception as e:
            print(f"Error translating content: {e}")
            return text 

    async def generate_image(self, summary: str) -> Optional[str]:
        """Placeholder cho việc tạo ảnh AI (DALL-E/Stable Diffusion)"""
        # Hiện tại trả về None để dùng ảnh gốc từ trang báo hoặc placeholder
        return None
        """
        Placeholder for image generation. 
        In Phase 3, this could call DALL-E or a local Stable Diffusion instance.
        """
        # For now, it might return a generated prompt to be used via another API or a mock URL
        # For demonstration purposes, I'll return a placeholder.
        print(f"Generating image for: {summary}")
        # In a real use case, you'd use something like OpenAI's DALL-E or a local SD API
        # return f"https://placehold.co/600x400?text=Generated+for+{summary[:20]}"
        return None

ai_service = AIService()
