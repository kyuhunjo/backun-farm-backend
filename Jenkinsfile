pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'backun-farm-backend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        WEATHER_API_KEY = credentials('weather-api-key')
        AIR_KOREA_API_KEY = credentials('air-korea-api-key')
        MONGODB_URI = credentials('mongodb-uri')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // 환경 변수 파일 생성
                    sh """
                        echo "PORT=8084" > .env
                        echo "NODE_ENV=production" >> .env
                        echo "MONGODB_URI=${MONGODB_URI}" >> .env
                        echo "WEATHER_API_KEY=${WEATHER_API_KEY}" >> .env
                        echo "AIR_KOREA_API_KEY=${AIR_KOREA_API_KEY}" >> .env
                    """
                    
                    // 기존 컨테이너 중지 및 제거
                    sh """
                        docker stop ${DOCKER_IMAGE} || true
                        docker rm ${DOCKER_IMAGE} || true
                    """
                    
                    // 새 컨테이너 실행
                    sh """
                        docker run -d \\
                            --name ${DOCKER_IMAGE} \\
                            --restart unless-stopped \\
                            -p 8084:8084 \\
                            --env-file .env \\
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                cleanWs()
            }
        }
    }
    
    post {
        success {
            echo '배포가 성공적으로 완료되었습니다!'
        }
        failure {
            echo '배포 중 오류가 발생했습니다.'
        }
    }
} 