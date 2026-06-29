const mongoose = require("mongoose");

const ConfigurationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    config: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Configuration", ConfigurationSchema);
