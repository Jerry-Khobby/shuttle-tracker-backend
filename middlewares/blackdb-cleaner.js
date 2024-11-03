const cron = require("node-cron");
const BlackList = require("../models/BlackList");

cron.schedule("0 0 * * *", async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await BlackList.deleteMany({ createdAt: { $lt: sevenDaysAgo } });
  console.log(
    "Expired blacklisted tokens older than 7days removed from the database"
  );
});
