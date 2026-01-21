module.exports = {
    apps: [{
        name: 'stacktrails',
        script: 'npm',
        args: 'start',
        cwd: '/home/stacktrails/stacktrails',
        instances: 'max', // or a specific number like 2
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: '/home/stacktrails/stacktrails/logs/pm2-error.log',
        out_file: '/home/stacktrails/stacktrails/logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        min_uptime: '10s',
        max_restarts: 10,
        kill_timeout: 5000
    }]
}