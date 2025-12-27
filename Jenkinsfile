pipeline{
    agent any
    
    environment {
        APP_DIR = '/var/www/crud-node-next/crud-next-node-backend'
        APP_NAME = 'crud-backend'
    }
    
    parameters{
        choice(name: "VERSION", choices: ["1.0", "2.0", "3.0"], description: "")
        booleanParam(name: "executeTests", defaultValue: true, description: "")
    }
    
    stages{
        stage("checkout"){
            steps{
                dir("${APP_DIR}") {
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
        }
        
        stage("install"){
            steps{
                dir("${APP_DIR}") {
                    sh 'npm install'
                }
            }
        }
        
        stage("build"){
            steps{
                dir("${APP_DIR}") {
                    sh 'npm run build'
                }
            }
        }
        
        stage("deploy"){
            steps{
                dir("${APP_DIR}") {
                    sh '''
                        if pm2 list | grep -q "crud-backend"; then
                            echo "App exists, reloading..."
                            pm2 reload crud-backend --update-env
                        else
                            echo "App doesn't exist, starting new..."
                            pm2 start npm --name crud-backend -- start
                        fi
                        
                        pm2 save
                        pm2 list
                    '''
                }
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