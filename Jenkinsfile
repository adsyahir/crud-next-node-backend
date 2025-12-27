pipeline{
    agent any
    parameters{
        choice(name: "VERSION", choices: ["1.0", "2.0", "3.0"], description: "")
        booleanParam(name: "executeTests", defaultValue: true, description: "")
    }
    stages{
        stage("install"){
            steps{
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-token', url: 'https://github.com/adsyahir/crud-next-node-backend.git']])
                sh 'npm install'
            }
        }
        stage("build"){
            steps{
                sh 'npm run build'
            }
        }
        stage("deploy"){
            steps{
                sh '''
                    if pm2 list |  grep -q "crud-backend"; then
                        echo "App exists, reloading..."
                        pm2 reload crud-backend
                    else
                        echo "App does't exist, starting new..."
                        pm2 start npm --name "crud-backend" -- start
                    fi
                '''
            }
        }
    }
}