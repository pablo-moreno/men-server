module.exports = {
  apps : [{
    name: 'Poppy',
    script: 'dist/index.js',
    instances: 2,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
}
