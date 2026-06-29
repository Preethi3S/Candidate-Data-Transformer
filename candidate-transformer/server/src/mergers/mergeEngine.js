const { v4: uuidv4 } = require("uuid");
const { ConflictResolver } = require("./conflictResolver");
const { ProvenanceEngine } = require("../provenance/provenanceEngine");

class MergeEngine {
  constructor(conflictResolver = new ConflictResolver(), provenanceEngine = new ProvenanceEngine()) {
    this.conflictResolver = conflictResolver;
    this.provenanceEngine = provenanceEngine;
  }

  merge(records) {
    const singleFields = ["full_name", "headline", "years_experience"];
    const resolutions = {};
    const conflicts = [];

    singleFields.forEach((field) => {
      const entries = records.map((record) => record.fields[field]).filter(Boolean);
      const resolution = this.conflictResolver.resolve(field, entries);
      resolutions[field] = resolution.winner;
      if (resolution.conflict) conflicts.push(resolution);
    });

    const emails = this.mergePrimitiveList(records, "emails", (value) => String(value).toLowerCase());
    const phones = this.mergePrimitiveList(records, "phones");
    const skills = this.mergeSkills(records);
    const experience = this.mergeObjects(records, "experience", (item) => `${item.company || ""}|${item.title || ""}`.toLowerCase());
    const education = this.mergeObjects(records, "education", (item) => `${item.institution || ""}|${item.degree || ""}`.toLowerCase());

    const profile = {
      candidate_id: uuidv4(),
      full_name: resolutions.full_name || null,
      emails: emails.map((entry) => entry.value),
      phones: phones.map((entry) => entry.value),
      location: {},
      links: {},
      headline: resolutions.headline || null,
      years_experience: resolutions.years_experience ?? null,
      skills,
      experience: experience.map(({ value, confidence, sources }) => ({ ...value, confidence, sources })),
      education: education.map(({ value, confidence, sources }) => ({ ...value, confidence, sources })),
      provenance: this.provenanceEngine.collect(records),
      overall_confidence: 0
    };

    return { profile, conflicts };
  }

  mergePrimitiveList(records, field, transform = (value) => value) {
    const byValue = new Map();
    records.flatMap((record) => record.fields[field] || []).forEach((entry) => {
      const value = transform(entry.value);
      if (!value) return;
      const existing = byValue.get(value);
      if (!existing || entry.confidence > existing.confidence) {
        byValue.set(value, { value, confidence: entry.confidence, sources: [entry.sourceType] });
      } else if (existing && !existing.sources.includes(entry.sourceType)) {
        existing.sources.push(entry.sourceType);
      }
    });
    return Array.from(byValue.values());
  }

  mergeSkills(records) {
    return this.mergePrimitiveList(records, "skills").map((entry) => ({
      name: entry.value,
      confidence: entry.confidence,
      sources: entry.sources
    }));
  }

  mergeObjects(records, field, keyFn) {
    const byKey = new Map();
    records.flatMap((record) => record.fields[field] || []).forEach((entry) => {
      const key = keyFn(entry.value);
      if (!key.trim() || key === "|") return;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { value: entry.value, confidence: entry.confidence, sources: [entry.sourceType] });
        return;
      }
      existing.value = { ...existing.value, ...Object.fromEntries(Object.entries(entry.value).filter(([, value]) => value)) };
      existing.confidence = Math.max(existing.confidence, entry.confidence);
      if (!existing.sources.includes(entry.sourceType)) existing.sources.push(entry.sourceType);
    });
    return Array.from(byKey.values());
  }
}

module.exports = { MergeEngine };
