module.exports = {
    apps: [
        {
            name: "stacktrails",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            cwd: "/home/stacktrails/stacktrails",
            instances: 1,          // Next.js is not cluster-safe by default
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
                PORT: 3000
            },
            autorestart: true,
            watch: false,
            max_memory_restart: "600M",
            kill_timeout: 5000,
            listen_timeout: 5000
        }
    ]
};
