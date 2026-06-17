module.exports = {
  apps: [
    {
      name: "nolita-web",
      cwd: "/home/nolita/htdocs/nolita.com.ar/nolita/web",
      script: "./node_modules/.bin/next",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        VADMIN_API_URL: "http://127.0.0.1:8000/api",
        NEXT_PUBLIC_VADMIN_API_URL: "https://nolita.com.ar/api",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
