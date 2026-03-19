/* eslint-disable import/no-commonjs, @typescript-eslint/no-require-imports */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env.deploy') })

const {
  DEPLOY_USER,
  DEPLOY_HOST,
  DEPLOY_PATH,
  DEPLOY_REPO,
  DEPLOY_REF = 'main',
} = process.env

module.exports = {
  apps: [
    {
      name: 'mesto-backend',
      script: 'dist/app.js',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: `origin/${DEPLOY_REF}`,
      repo: DEPLOY_REPO,
      path: DEPLOY_PATH,
      'pre-deploy-local': `scp .env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/shared/.env`,
      'post-deploy': `ln -nfs ${DEPLOY_PATH}/shared/.env .env && npm install && npm run build && pm2 startOrRestart ecosystem.config.js --env production`,
    },
  },
}
