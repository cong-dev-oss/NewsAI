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
          
          # Đồng bộ các source code cần thiết ra thư mục Demo
          rsync -avz --exclude '.git' --delete ./ ${DEMO_PATH}/

          cd ${DEMO_PATH}
          
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
