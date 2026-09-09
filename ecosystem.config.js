module.exports = {
  apps: [
    {
      name: "sonic-backend",
      script: "src/app.js",
      instances: 1,
      exec_mode: "fork", // keep as "fork" — the in-memory/JSON-file db is not shared across cluster workers
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
