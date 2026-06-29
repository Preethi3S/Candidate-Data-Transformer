const mongoose = require("mongoose");

async function connectDatabase(uri) {
  if (!uri) {
    return { connected: false, reason: "MONGODB_URI not configured" };
  }

  try {
    await mongoose.connect(uri);
    return { connected: true };
  } catch (error) {
    return { connected: false, reason: error.message };
  }
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, isMongoConnected };
