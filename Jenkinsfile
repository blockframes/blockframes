pipeline {
  agent {
    docker {
      image 'blockframes/ci:latest'
    }

  }
  stages {
    stage('setup') {
      steps {
        sh '''npm install
rm -rf node_modules/ganache-core/node_modules/web3-providers-ws/node_modules/websocket/.git'''
      }
    }
    stage('build') {
      steps {
        sh '''cp env/env.ci.ts env/env.ts # required for typechecking & file rewrite to work
npm run build:all'''
      }
    }
    stage('lint') {
      parallel {
        stage('lint') {
          steps {
            sh '''npm run lint
        '''
          }
        }
        stage('test') {
          steps {
            sh '''npm run test
        '''
          }
        }
      }
    }
  }
  environment {
    ENV = 'ci'
    NODE_OPTIONS = '--max_old_space_size=6144'
  }
}