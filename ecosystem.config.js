require("dotenv").config();

module.exports = {
    apps: [
      {
        name: "glpi-email-handler",
        script: "index.js",
        watch: false,
        time: true,
        autorestart: true,
        cron_restart: `*/${process.env.MAIL_FETCHING_INTERVAL} * * * *`, // Restart the app every 10 seconds
      },
    ],
  };