pipeline{
    agent any
    parameters{
        choice(name: "VERSION", choices: ["1.0", "2.0", "3.0"], description: "")
        booleanParam(name: "executeTests", defaultValue: true, description: "")
    }
    stages{
        stage("install"){
            steps{
                sh 'npm install'
            }
        }
        stage("build"){
            steps{
                sh 'npm run build'
            }
        }
        stage("deploy"){
            when{
                expression{
                    BRANCH_NAME == "main" || BRANCH_NAME == "dev"
                }
            }
            steps{
                sh '''
                    if pm2 list |  grep -q "crud-backend"; then
                        echo "App exists, reloading..."
                        pm2 reload crud-backend
                    else
                        echo "App does't exist, starting new..."
                        pm2 start npm --name "crud-backend" --start
                    fi
                '''
            }
        }
    }
}