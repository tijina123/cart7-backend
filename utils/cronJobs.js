// utils/cronJobs.js
const cron = require("node-cron");
const { User } = require("../models/userModel"); // Adjust path as needed

const startCronJobs = () => {
  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const expiredUsers = await User.find({
        plan: { $in: ["premium", "standard"] },
        planValidUntil: { $lt: now },
      });

      for (let user of expiredUsers) {
        user.plan = "basic";
        user.planValidUntil = null;
        await user.save();
      }

      console.log(`${expiredUsers.length} users downgraded to basic plan`);
    } catch (error) {
      console.error("Cron job error:", error);
    }
  });
};

module.exports = startCronJobs;
