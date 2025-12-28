pipeline{
    agent any

    environment {
        DEPLOY_DIR = '/var/www/crud-node-next/crud-next-node-backend'
        SERVICE_NAME = 'crud-backend'
        APP_URL = 'http://103.191.76.205:5001'
        HEALTH_ENDPOINT = '/'
    }

    parameters{
        choice(name: "VERSION", choices: ["1.0", "2.0", "3.0"], description: "Version to deploy")
        booleanParam(name: "executeTests", defaultValue: true, description: "Execute tests")
    }

    stages{
        stage("checkout"){
            steps{
                checkout scmGit(
                    branches: [[name: '*/main']], 
                    extensions: [], 
                    userRemoteConfigs: [[
                        credentialsId: 'github-token', 
                        url: 'https://github.com/adsyahir/crud-next-node-backend.git'
                    ]]
                )
            }
        }

        stage("install"){
            steps{
                sh 'npm install'
            }
        }

        stage("build"){
            steps{
                sh '''
                    npm run build
                    node fix-imports.cjs
                '''
            }
        }

        stage("deploy"){
            steps{
                sh '''
                    mkdir -p ${DEPLOY_DIR}
                    
                    # Sync files
                    rsync -av --delete \
                        --exclude 'node_modules' \
                        --exclude '.git' \
                        ${WORKSPACE}/ ${DEPLOY_DIR}/
                    
                    rsync -av ${WORKSPACE}/node_modules ${DEPLOY_DIR}/

                    
                    # Restart service
                    sudo systemctl restart ${SERVICE_NAME}
                '''
            }
        }

        stage("health check"){
            steps{
                script{
                    echo '🔍 Performing health check...'
                    
                    // Wait for app to start
                    sleep(time: 10, unit: 'SECONDS')
                    
                    // Retry health check up to 5 times
                    def maxRetries = 5
                    def retryCount = 0
                    def healthCheckPassed = false
                    
                    while (retryCount < maxRetries && !healthCheckPassed) {
                        try {
                            sh """
                                response=\$(curl -s -o /dev/null -w "%{http_code}" ${APP_URL}${HEALTH_ENDPOINT})
                                echo "Health check response code: \$response"
                                
                                if [ "\$response" -eq "200" ] || [ "\$response" -eq "304" ]; then
                                    echo "✅ Health check passed!"
                                    exit 0
                                else
                                    echo "❌ Health check failed with status \$response"
                                    exit 1
                                fi
                            """
                            healthCheckPassed = true
                        } catch (Exception e) {
                            retryCount++
                            if (retryCount < maxRetries) {
                                echo "⚠️ Health check attempt ${retryCount} failed, retrying in 5 seconds..."
                                sleep(time: 5, unit: 'SECONDS')
                            } else {
                                error "❌ Health check failed after ${maxRetries} attempts"
                            }
                        }
                    }
                }
            }
        }

        stage("verify service status"){
            steps{
                sh '''
                    echo "📊 Service Status:"
                    sudo systemctl status ${SERVICE_NAME} --no-pager
                    
                    echo "\n📝 Recent Logs:"
                    sudo journalctl -u ${SERVICE_NAME} -n 20 --no-pager
                    
                    echo "\n🔌 Port Status:"
                    sudo lsof -i :5001
                    
                    echo "\n🗄️ MongoDB Connection:"
                    mongosh --eval "db.adminCommand('ping')" || echo "⚠️ MongoDB not accessible"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "🌐 Application is running at: http://103.191.76.205:5001"
            sh 'sudo systemctl status ${SERVICE_NAME} --no-pager'
        }
        failure {
            echo '❌ Pipeline failed!'
            sh '''
                echo "🔍 Checking service logs for errors..."
                sudo journalctl -u ${SERVICE_NAME} -n 50 --no-pager || true
                
                echo "\n📊 Current service status:"
                sudo systemctl status ${SERVICE_NAME} --no-pager || true
            '''
        }
        always {
            echo '🧹 Cleaning up workspace...'
        }
    }
}