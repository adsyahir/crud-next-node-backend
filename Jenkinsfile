pipeline{
    agent any
    
    environment {
        DEPLOY_DIR = '/var/www/crud-node-next/crud-next-node-backend'
        APP_NAME = 'crud-backend'
    }
    
    parameters{
        choice(name: "VERSION", choices: ["1.0", "2.0", "3.0"], description: "")
        booleanParam(name: "executeTests", defaultValue: true, description: "")
    }
    
    stages{
        stage("checkout"){
            steps{
                // Clone to Jenkins workspace (has proper permissions)
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
                // Install in workspace
                sh 'npm install'
            }
        }
        
        stage("build"){
            steps{
                // Build in workspace
                sh 'npm run build'
            }
        }
        
        stage("deploy"){
            steps{
                sh '''
                    # Create deployment directory if doesn't exist
                    sudo mkdir -p ${DEPLOY_DIR}
                    
                    # Sync files to deployment directory
                    sudo rsync -av --delete \
                        --exclude 'node_modules' \
                        --exclude '.git' \
                        --exclude '.env' \
                        ${WORKSPACE}/ ${DEPLOY_DIR}/
                    
                    # Copy node_modules (or install fresh in deploy dir)
                    sudo rsync -av ${WORKSPACE}/node_modules ${DEPLOY_DIR}/
                    
                    # Fix ownership
                    sudo chown -R jenkins:jenkins ${DEPLOY_DIR}
                    
                    # Navigate to deployment directory and restart PM2
                    cd ${DEPLOY_DIR}
                    
                    if pm2 list | grep -q "${APP_NAME}"; then
                        echo "App exists, reloading..."
                        pm2 reload ${APP_NAME} --update-env
                    else
                        echo "App doesn't exist, starting new..."
                        pm2 start npm --name ${APP_NAME} -- start
                    fi
                    
                    pm2 save
                    pm2 list
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}