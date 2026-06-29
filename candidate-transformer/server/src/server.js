require("dotenv").config();
const app = require("./app");
const { connectDatabase } = require("./config/db");

const port = process.env.PORT || 8000;

(async () => {
  const db = await connectDatabase(process.env.MONGODB_URI);
  if (!db.connected) {
    console.warn(`MongoDB unavailable: ${db.reason}. Using in-memory fallback.`);
  }

  app.listen(port, () => {
    console.log(`Candidate transformer API listening on http://localhost:${port}`);
  });
})();
