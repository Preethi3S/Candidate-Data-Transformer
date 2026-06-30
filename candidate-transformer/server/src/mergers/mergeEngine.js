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
    const backfills = [];

    singleFields.forEach((field) => {
      const entries = records.map((record) => record.fields[field]).filter(Boolean);
      const resolution = this.conflictResolver.resolve(field, entries);
      resolutions[field] = resolution.winner;
      if (resolution.winner && resolution.winnerSource && this.isBackfilled(records, field, resolution.winnerSource)) {
        backfills.push({ field, source: resolution.winnerSource, reason: "Backfilled from next available source" });
      }
      if (resolution.conflict) conflicts.push(resolution);
    });

    const emails = this.mergePrimitiveList(records, "emails", (value) => String(value).toLowerCase());
    const phones = this.mergePrimitiveList(records, "phones");
    const skills = this.mergeSkills(records);
    const experience = this.mergeObjects(records, "experience", (item) => `${item.company || ""}|${item.title || ""}`.toLowerCase());
    const education = this.mergeObjects(records, "education", (item) => `${item.institution || ""}|${item.degree || ""}`.toLowerCase());
    const links = this.mergeLinks(records);
    const location = this.mergeLocation(records);

    const profile = {
      candidate_id: uuidv4(),
      full_name: resolutions.full_name || null,
      emails: emails.map((entry) => entry.value),
      phones: phones.map((entry) => entry.value),
      location,
      links,
      headline: resolutions.headline || null,
      years_experience: resolutions.years_experience ?? null,
      skills,
      experience: experience.map(({ value, confidence, sources }) => ({ ...value, confidence, sources })),
      education: education.map(({ value, confidence, sources }) => ({ ...value, confidence, sources })),
      provenance: this.provenanceEngine.collect(records),
      backfills,
      overall_confidence: 0
    };

    console.log("===== FINAL PROFILE =====");
console.log("FULL NAME:", profile.full_name);
console.log("HEADLINE:", profile.headline);

    return { profile, conflicts };

    console.log("==== MERGE INPUTS ====");

records.forEach((r) => {
  console.log(
    r.sourceType,
    r.fields.full_name?.value
  );
});

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

  mergeLinks(records) {
    return records.flatMap((record) => record.fields.links || []).reduce((acc, entry) => {
      Object.entries(entry.value || {}).forEach(([key, value]) => {
        if (value && !acc[key]) acc[key] = value;
      });
      
      return acc;
    }, {});
  }

  mergeLocation(records) {
    const entries = records.map((record) => record.fields.location).filter(Boolean);
    if (!entries.length) return {};
    return [...entries].sort((a, b) => b.priority - a.priority || b.confidence - a.confidence)[0].value || {};
  }

  isBackfilled(records, field, winnerSource) {
    const highestPriority = Math.max(...records.map((record) => record.priority || 0));
    const winnerRecord = records.find((record) => record.sourceType === winnerSource);
    if (!winnerRecord || winnerRecord.priority >= highestPriority) return false;
    return records.some((record) => (record.priority || 0) > winnerRecord.priority && this.isMissingField(record.fields[field]));
  }

  isMissingField(entry) {
    if (!entry) return true;
    return entry.value === null || entry.value === undefined || entry.value === "";
  }
}




module.exports = { MergeEngine };
