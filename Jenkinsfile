pipeline {
  agent any

  environment {
    // Project config
    PROJECT_NAME = "news-ai"
    DEMO_PATH = "/srv/demo/news-ai"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Deploy Natively via Compose') {
      steps {
        sh '''
          # Khởi tạo thư mục chạy
          mkdir -p ${DEMO_PATH}
          
          # Đồng bộ các source code cần thiết ra thư mục Demo (Bỏ rsync vì Agent chưa cài)
          cp -R . ${DEMO_PATH}/ || true
          rm -rf ${DEMO_PATH}/.git

          cd ${DEMO_PATH}
          
          # --- Inject Secrets từ /srv/secrets (chỉ cần đặt file lên server 1 lần) ---
          if [ -f /srv/secrets/news-ai-backend.env ]; then
            mkdir -p news-aggregator-backend
            cp /srv/secrets/news-ai-backend.env news-aggregator-backend/.env
            echo "Secrets backend loaded."
          else
            echo "WARN: /srv/secrets/news-ai-backend.env not found, API keys may be missing."
          fi
          
          if [ -f /srv/secrets/news-ai-frontend.env ]; then
            cp /srv/secrets/news-ai-frontend.env .env.local
            echo "Secrets frontend loaded."
          fi
          
          # Nâng cấp & Deploy
          docker compose build
          docker compose up -d
        '''
      }
    }
    
    stage('Clean Up') {
        steps {
            sh "docker image prune -f || true"
        }
    }
  }
}
