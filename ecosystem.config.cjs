module.exports = {
  apps: [
    {
      name: "qrcode",
      script: "./server.js",
      watch: false,
      force: true,
      env: {
        PORT: 3131,
        NODE_ENV: "production",
        MY_ENV_VAR: "MyVarValue",
      },
    },
  ],
};
