pipeline {
    agent { 
        kubernetes{
            label 'jenkins-slave'
        }
        
    }
    environment{
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
    }
    stages {
        stage('docker login') {
            steps{
                sh(script: """
                    docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
                """, returnStdout: true) 
            }
        }

        stage('git clone') {
            steps{
                sh(script: """
                    git clone https://ankur-dwivedi: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@github.com/Novasign/cascade-backend
                """, returnStdout: true) 
            }
        }

        stage('docker build') {
            steps{
                sh script: '''
                #!/bin/bash
                cd $WORKSPACE
                docker build . --network host -t ankurdwivedi/padboat-backend:${BUILD_NUMBER}
                '''
            }
        }

        stage('docker push') {
            steps{
                sh(script: """
                    docker push ankurdwivedi/padboat-backend:${BUILD_NUMBER}
                """)
            }
        }

        stage('deploy') {
            steps{
                sh script: '''
                #!/bin/bash
                cd $WORKSPACE
                kubectl apply -f=./kubernetes/mongodb.yaml
                kubectl apply -f=./kubernetes/backend-service.yaml -f=./kubernetes/backend-deployment.yaml
                '''
        }
    }
}
}