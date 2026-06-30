const Candidate = require("../models/Candidate");
const { isMongoConnected } = require("../config/db");

const memoryStore = new Map();

class CandidateRepository {
  async save(processed) {
    const doc = {
      candidate_id: processed.canonicalProfile.candidate_id,
      canonical_profile: processed.canonicalProfile,
      projected_profiles: [processed.projectedProfile],
      provenance: processed.canonicalProfile.provenance,
      confidence: processed.confidence,
      conflicts: processed.conflicts,
      premium: processed.premium
    };

    if (isMongoConnected()) {
      await Candidate.findOneAndUpdate({ candidate_id: doc.candidate_id }, doc, {
        upsert: true,
        new: true
      });
    }

    memoryStore.set(doc.candidate_id, doc);
    return doc;
  }

  async appendProjection(candidateId, projectedProfile) {
    const existing = await this.findById(candidateId);
    if (!existing) return null;
    existing.projected_profiles = [...(existing.projected_profiles || []), projectedProfile];

    if (isMongoConnected()) {
      await Candidate.findOneAndUpdate(
        { candidate_id: candidateId },
        { $push: { projected_profiles: projectedProfile } }
      );
    }

    memoryStore.set(candidateId, existing);
    return existing;
  }

  async findById(candidateId) {
    if (isMongoConnected()) {
      const doc = await Candidate.findOne({ candidate_id: candidateId }).lean();
      if (doc) return doc;
    }
    return memoryStore.get(candidateId) || null;
  }

  async findAll() {
    if (isMongoConnected()) {
      const docs = await Candidate.find({}).sort({ createdAt: -1 }).lean();
      if (docs.length) return docs;
    }
    return Array.from(memoryStore.values()).reverse();
  }
}

module.exports = { CandidateRepository, memoryStore };
