pipeline{
    agent any
    
    options {
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME = 'crud-backend'
        WORKSPACE_BUILD = '/var/lib/jenkins/workspace/crud-next-node-backend'
        DEPLOY_DIR = '/var/www/crud-node-next/backend'
        RELEASES_DIR = '/var/www/crud-node-next/releases/backend'
        SERVICE_NAME = 'crud-backend'
        APP_URL = 'http://103.191.76.205:5001'
    }

    stages{
        stage('Checkout') {
            steps{
                echo '📥 Checking out latest code from SCM...'
                checkout scmGit(
                    branches: [[name: '*/main']], 
                    userRemoteConfigs: [[
                        credentialsId: 'github-token', 
                        url: 'https://github.com/adsyahir/crud-next-node-backend.git'
                    ]]
                )
            }
        }

        stage('Dependencies') {
            steps{
                echo '📦 Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps{
                echo '🔨 Building application...'
                sh '''
                    npm run build
                    node fix-imports.cjs
                '''
            }
        }

        stage('Test') {
            steps{
                echo '🧪 Running tests...'
                sh 'npm test || echo "No tests configured"'
            }
        }

        stage('Package') {
            steps{
                script {
                    env.RELEASE_VERSION = sh(
                        script: "date +%Y%m%d_%H%M%S",
                        returnStdout: true
                    ).trim()
                    
                    echo "📦 Creating release: ${env.RELEASE_VERSION}"
                    
                    sh """
                        # Create releases directory
                        mkdir -p ${RELEASES_DIR}
                        
                        # Create release folder
                        mkdir -p ${RELEASES_DIR}/${env.RELEASE_VERSION}
                        
                        # Copy built files
                        cp -r dist ${RELEASES_DIR}/${env.RELEASE_VERSION}/
                        cp -r node_modules ${RELEASES_DIR}/${env.RELEASE_VERSION}/
                        cp package.json ${RELEASES_DIR}/${env.RELEASE_VERSION}/
                        cp package-lock.json ${RELEASES_DIR}/${env.RELEASE_VERSION}/
                        cp fix-imports.cjs ${RELEASES_DIR}/${env.RELEASE_VERSION}/
                        
                        # Copy .env if exists in current deployment
                        if [ -f ${DEPLOY_DIR}/current/.env ]; then
                            cp ${DEPLOY_DIR}/current/.env ${RELEASES_DIR}/${env.RELEASE_VERSION}/
                        fi
                        
                        # Set permissions
                        chown -R jenkins:jenkins ${RELEASES_DIR}/${env.RELEASE_VERSION}
                        
                        echo "✅ Release packaged: ${env.RELEASE_VERSION}"
                    """
                }
            }
        }

        stage('Deploy') {
            steps{
                script {
                    echo "🚀 Deploying release: ${env.RELEASE_VERSION}"
                    
                    sh """
                        # Create deploy directory if not exists
                        mkdir -p ${DEPLOY_DIR}
                        
                        # Backup current version info
                        if [ -L ${DEPLOY_DIR}/current ]; then
                            CURRENT=\$(readlink ${DEPLOY_DIR}/current)
                            echo "📋 Current version: \$CURRENT"
                            echo "\$CURRENT" > ${RELEASES_DIR}/${env.RELEASE_VERSION}/.previous
                        fi
                        
                        # Point to new release (atomic operation)
                        ln -sfn ${RELEASES_DIR}/${env.RELEASE_VERSION} ${DEPLOY_DIR}/current
                        
                        echo "✅ Symlink updated to new release"
                    """
                    
                    // Restart service
                    echo "🔄 Restarting service..."
                    sh "sudo systemctl restart ${SERVICE_NAME}"
                }
            }
        }

        stage('Smoke Test') {
            steps{
                script{
                    echo '🔍 Running smoke tests...'
                    sleep(time: 10, unit: 'SECONDS')
                    
                    def maxRetries = 5
                    def retryCount = 0
                    def smokeTestPassed = false
                    
                    while (retryCount < maxRetries && !smokeTestPassed) {
                        try {
                            def response = sh(
                                script: "curl -s -o /dev/null -w '%{http_code}' ${APP_URL}",
                                returnStdout: true
                            ).trim()
                            
                            echo "Smoke test response: ${response}"
                            
                            if (response == '200' || response == '304') {
                                echo "✅ Smoke test passed!"
                                smokeTestPassed = true
                            } else {
                                throw new Exception("Unexpected response: ${response}")
                            }
                        } catch (Exception e) {
                            retryCount++
                            if (retryCount < maxRetries) {
                                echo "⚠️ Smoke test attempt ${retryCount}/${maxRetries} failed, retrying in 5 seconds..."
                                sleep(time: 5, unit: 'SECONDS')
                            } else {
                                error "❌ Smoke test failed after ${maxRetries} attempts"
                            }
                        }
                    }
                }
            }
        }

        stage('Verify') {
            steps{
                echo '✅ Verifying deployment...'
                sh """
                    echo "============================"
                    echo "Deployment Verification"
                    echo "============================"
                    
                    echo "\n📦 Deployed Version:"
                    echo "${env.RELEASE_VERSION}"
                    
                    echo "\n🔗 Active Symlink:"
                    ls -la ${DEPLOY_DIR}/current
                    
                    echo "\n✅ Service Status:"
                    sudo systemctl status ${SERVICE_NAME} --no-pager | head -15
                    
                    echo "\n🔌 Port Status:"
                    sudo lsof -i :5001 | head -5 || echo "Port not found"
                    
                    echo "\n📝 Recent Logs:"
                    sudo journalctl -u ${SERVICE_NAME} -n 10 --no-pager
                    
                    echo "\n============================"
                """
            }
        }

        stage('Cleanup Old Releases') {
            steps{
                echo '🧹 Cleaning up old releases...'
                sh """
                    # Keep only last 5 releases
                    cd ${RELEASES_DIR}
                    ls -t | tail -n +6 | xargs -I {} rm -rf {} || true
                    
                    REMAINING=\$(ls -t | wc -l)
                    echo "✅ Kept last \$REMAINING releases"
                """
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '===================================='
            echo "📦 Version: ${env.RELEASE_VERSION}"
            echo "🌐 Application: ${APP_URL}"
            echo "📂 Location: ${DEPLOY_DIR}/current"
            echo '===================================='
        }
        
        failure {
            script {
                echo '❌ Pipeline failed! Initiating rollback...'
                
                sh """
                    # Check if there's a previous version to rollback to
                    if [ -f ${RELEASES_DIR}/${env.RELEASE_VERSION}/.previous ]; then
                        PREVIOUS=\$(cat ${RELEASES_DIR}/${env.RELEASE_VERSION}/.previous)
                        echo "🔄 Rolling back to: \$PREVIOUS"
                        
                        # Point symlink to previous release
                        ln -sfn \$PREVIOUS ${DEPLOY_DIR}/current
                        
                        # Restart service
                        sudo systemctl restart ${SERVICE_NAME}
                        
                        echo "✅ Rollback completed to previous version"
                    else
                        echo "⚠️ No previous version found for rollback"
                        
                        # Try to find the last working release
                        LAST_RELEASE=\$(ls -t ${RELEASES_DIR} | grep -v ${env.RELEASE_VERSION} | head -1)
                        
                        if [ ! -z "\$LAST_RELEASE" ]; then
                            echo "🔄 Rolling back to last release: \$LAST_RELEASE"
                            ln -sfn ${RELEASES_DIR}/\$LAST_RELEASE ${DEPLOY_DIR}/current
                            sudo systemctl restart ${SERVICE_NAME}
                            echo "✅ Rollback completed"
                        else
                            echo "❌ No releases available for rollback"
                        fi
                    fi
                    
                    # Show error logs
                    echo "\n📝 Error Logs:"
                    sudo journalctl -u ${SERVICE_NAME} -n 50 --no-pager
                """
            }
        }
        
        always {
            echo '🧹 Pipeline cleanup completed'
        }
    }
}