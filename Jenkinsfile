pipeline {
    agent {
        label 'students'
    }

    environment {
        REGISTRY = "ghcr.io"

        // Use your GitHub username/organization and repository name
        GHCR_REPO = 'ghcr.io/the-eye-org/etherx-registration-site'
        // This should match your Docker image tag
        IMAGE_TAG = 'latest'
        DOCKER_CREDS = credentials('psgdcgit')
    }

    stages {
         stage('Login to GHCR') {
      steps {
        sh '''
          echo "$DOCKER_CREDS_PSW" | docker login $REGISTRY -u $DOCKER_CREDS_USR --password-stdin
        '''
      }
    }

        stage('Pull Docker Image') {
            steps {
                sh "docker pull ${GHCR_REPO}:${IMAGE_TAG}"
            }
        }

        stage('Stop Existing Container') {
            steps {
                script {
                    // Safely stop and remove existing container if it exists
                    sh '''
                        if [ "$(docker ps -q --filter name=etherx-registration-site)" ]; then
                            # output is non-empty, container exists
                            docker stop etherx-registration-site
                            docker rm etherx-registration-site
                        fi

                    '''
                }
            }
        }

        stage('Run Container') {
            steps {
                // Run the container with the website
                sh """
                    docker run -d \
                        --name etherx-registration-site \
                        -p 8005:3000 \
                        --restart unless-stopped \
                        ${GHCR_REPO}:${IMAGE_TAG}
                """
            }
        }
    }

    post {
        always {
            // Always logout from GHCR after the pipeline
            sh 'docker logout ghcr.io'
        }
        success {
            echo 'Successfully deployed the website!'
        }
        failure {
            echo 'Pipeline failed! Please check the logs for details.'
        }
    }
}
