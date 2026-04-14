pipeline {
  agent any

  environment {
    PROJECT_NAME = "news-ai"
    SECRETS_DIR  = "/srv/secrets"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Inject Secrets') {
      steps {
        sh '''
          # Copy secrets từ /srv/secrets vào workspace hiện tại (chỉ cần đặt file lên server 1 lần)
          if [ -f ${SECRETS_DIR}/news-ai-backend.env ]; then
            mkdir -p news-aggregator-backend
            cp ${SECRETS_DIR}/news-ai-backend.env news-aggregator-backend/.env
            echo "Backend secrets loaded."
          else
            echo "WARN: ${SECRETS_DIR}/news-ai-backend.env not found."
          fi

          if [ -f ${SECRETS_DIR}/news-ai-frontend.env ]; then
            cp ${SECRETS_DIR}/news-ai-frontend.env .env.local
            echo "Frontend secrets loaded."
          fi
        '''
      }
    }

    stage('Build & Deploy') {
      steps {
        sh '''
          # Dừng và xóa container cũ trước (tránh conflict tên container)
          docker compose down --remove-orphans --timeout 30 || true

          # Build image mới và khởi chạy
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
