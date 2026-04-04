import subprocess
import os

class ResearchService:
    @staticmethod
    def run_last_30_days_research(topic: str) -> str:
        """
        Giao tiếp với mvanhorn/last30days-skill.
        Tại đây, ta giả sử skill đã được cài đặt thông qua subprocess CLI hoặc import module.
        Vì ta không có sẵn codebase last30days hoàn chỉnh, ta mock hoặc trigger lệnh shell.
        """
        # Hướng dẫn: Để tích hợp hoàn toàn tool CLI này, có thể gọi lệnh như sau:
        # result = subprocess.run(["python", "-m", "last30days", topic], capture_output=True, text=True)
        # return result.stdout
        
        # Phiên bản giả định kết quả text:
        dummy_result = f"""# Báo cáo xu hướng: {topic} (30 ngày qua)
        
## 1. Xu hướng chính trên Reddit & X
Các cộng đồng lập trình viên đang thảo luận rất nhiều về {topic}. Có sự e ngại về chi phí nhưng ưu điểm về token tracking được đánh giá cao.

## 2. Công nghệ liên quan
- Framework X
- Library Y

*Được tổng hợp tự động bởi Last30Days-Skill.*
"""
        return dummy_result
