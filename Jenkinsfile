pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'kyuhunjo/backun-farm-backend'
        DOCKER_TAG = 'latest'
        DOCKER_CREDENTIALS = credentials('0dd8e584-8e25-4817-b865-bb1e8901663b')
        WEATHER_API_KEY = credentials('weather-api-key')
        AIR_KOREA_API_KEY = credentials('air-korea-api-key')
        MONGODB_URI = credentials('mongodb-uri')
        SUNRISE_API_KEY = credentials('sunrise-api-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Docker Login') {
            steps {
                sh 'echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin'
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
                    try {
                        sh 'docker network inspect myeongri || docker network create myeongri'
                        sh 'netstat -ano | grep :8084 || true'
                        sh 'fuser -k 8084/tcp || true'
                        sh "docker stop backun-farm-backend || true"
                        sh "docker rm backun-farm-backend || true"
                        sh """
                            docker run -d \
                            --name backun-farm-backend \
                            --network myeongri \
                            -p 8084:8084 \
                            -e MONGODB_URI=${env.MONGODB_URI} \
                            -e WEATHER_API_KEY=${env.WEATHER_API_KEY} \
                            -e AIR_KOREA_API_KEY=${env.AIR_KOREA_API_KEY} \
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                        """
                    } catch (Exception e) {
                        echo "배포 중 오류가 발생했습니다: ${e.message}"
                        throw e
                    }
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                cleanWs()
                sh 'docker logout'
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