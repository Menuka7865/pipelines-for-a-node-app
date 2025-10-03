pipeline {
    agent any 
    
    stages { 
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/Menuka7865/pipelines-for-a-node-app.git'
                }
            }
        }
        stage('Build Docker Image') {
            steps {  
                bat 'docker build -t menuka2002/expense-tracker:%BUILD_NUMBER% .'
            }
        }
        stage('Login to Docker Hub') {
            steps {
               withCredentials([string(credentialsId: 'expense-tracker-id', variable: 'expense-tracker-id')]) {
                    script {
                        bat "docker login -u menuka2002 -p ${expense-tracker-id}"
                    }
                }
            }
        }
        stage('Push Image') {
            steps {
                bat 'docker push  menuka2002/expense-tracker:%BUILD_NUMBER%'
            }
        }
    }
    post {
        always {
            bat 'docker logout'
        }
    }
}