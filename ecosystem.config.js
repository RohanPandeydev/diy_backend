module.exports = {
  apps: [
    {
      name: "diy-backend",
      script: "index.js",
      instances: 1,
      exec_mode: "cluster",
      watch: true,
      ignore_watch: ["node_modules", "public"],
    },
  ],
};
