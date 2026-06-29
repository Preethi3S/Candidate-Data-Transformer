const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    candidate_id: { type: String, required: true, unique: true, index: true },
    canonical_profile: { type: Object, required: true },
    projected_profiles: { type: Array, default: [] },
    provenance: { type: Array, default: [] },
    confidence: { type: Object, default: {} },
    conflicts: { type: Array, default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", CandidateSchema);
