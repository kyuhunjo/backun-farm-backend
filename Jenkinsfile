pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'kyuhunjo/backun-farm-backend'
        DOCKER_TAG = "${BUILD_NUMBER}"
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
        
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    echo "WEATHER_API_KEY=${WEATHER_API_KEY}" > .env
                    echo "AIR_KOREA_API_KEY=${AIR_KOREA_API_KEY}" >> .env
                    echo "MONGODB_URI=${MONGODB_URI}" >> .env
                    echo "PORT=8084" >> .env
                    
                    docker stop backun-farm-backend || true
                    docker rm backun-farm-backend || true
                    
                    if ! docker network inspect myeongri >/dev/null 2>&1; then
                        docker network create myeongri
                    fi
                    
                    docker run -d \
                        --name backun-farm-backend \
                        --restart always \
                        --network myeongri \
                        -p 8084:8084 \
                        --env-file .env \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
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
            echo '배포가 성공적으로 완료되었습니다.'
        }
        failure {
            echo '배포 중 오류가 발생했습니다.'
        }
    }
} 