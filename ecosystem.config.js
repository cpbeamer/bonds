module.exports = {
  apps: [
    {
      name: 'finra-scheduler',
      script: 'tsx',
      args: 'scripts/start-scheduler.ts',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        USE_MOCK_FINRA_DATA: 'false'
      },
      error_file: './logs/finra-scheduler-error.log',
      out_file: './logs/finra-scheduler-out.log',
      log_file: './logs/finra-scheduler-combined.log',
      time: true,
      cron_restart: '0 0 * * *',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}