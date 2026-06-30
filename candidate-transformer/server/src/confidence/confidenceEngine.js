class ConfidenceEngine {
  score(profile, context = {}) {
    const identityFactor = this.identityFactor(context.identity);
    const fieldConfidence = {
      full_name: this.adjustedFieldScore(profile.provenance, "full_name", profile.full_name, identityFactor),
      emails: this.adjustedCollectionScore(profile.provenance, "emails", profile.emails.length, identityFactor),
      phones: this.adjustedCollectionScore(profile.provenance, "phones", profile.phones.length, identityFactor),
      skills: this.adjustedAverage(profile.skills.map((skill) => skill.confidence), this.agreementFactor(profile.provenance, "skills")),
      experience: this.adjustedAverage(profile.experience.map((item) => item.confidence), this.agreementFactor(profile.provenance, "experience"))
    };

    const weights = { full_name: 0.2, emails: 0.25, phones: 0.2, skills: 0.2, experience: 0.15 };
    const overall = Object.entries(weights).reduce((sum, [field, weight]) => sum + fieldConfidence[field] * weight, 0);

    return {
      fieldConfidence,
      overall_confidence: Number(overall.toFixed(2))
    };
  }

  adjustedFieldScore(provenance, field, value, identityFactor) {
    const base = this.fieldScore(provenance, field, value);
    if (!base) return 0;
    return this.clamp(base * 0.7 + identityFactor * 0.2 + this.agreementFactor(provenance, field) * 0.1);
  }

  adjustedCollectionScore(provenance, field, count, identityFactor) {
    const base = this.collectionScore(provenance, field, count);
    if (!base) return 0;
    return this.clamp(base * 0.75 + identityFactor * 0.15 + this.agreementFactor(provenance, field) * 0.1);
  }

  adjustedAverage(values, agreementFactor) {
    const base = this.average(values);
    if (!base) return 0;
    return this.clamp(base * 0.85 + agreementFactor * 0.15);
  }

  fieldScore(provenance, field, value) {
    if (!value) return 0;
    return this.average(provenance.filter((entry) => entry.field === field).map((entry) => entry.confidence));
  }

  collectionScore(provenance, field, count) {
    if (!count) return 0;
    return Math.min(1, this.average(provenance.filter((entry) => entry.field === field).map((entry) => entry.confidence)) + Math.min(count - 1, 2) * 0.02);
  }

  average(values) {
    const valid = values.filter((value) => Number.isFinite(value));
    if (!valid.length) return 0;
    return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(2));
  }

  agreementFactor(provenance, field) {
    const values = provenance
      .filter((entry) => entry.field === field && entry.value !== null && entry.value !== undefined && entry.value !== "")
      .map((entry) => (typeof entry.value === "string" ? entry.value.trim().toLowerCase() : JSON.stringify(entry.value)));
    if (!values.length) return 0;
    const counts = values.reduce((acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }), {});
    return Math.min(1, Math.max(...Object.values(counts)) / Math.max(values.length, 1) + Math.min(values.length - 1, 2) * 0.05);
  }

  identityFactor(identity) {
    if (!identity?.identity_match_score) return 0.75;
    return Math.max(0.6, Math.min(1, identity.identity_match_score / 100));
  }

  clamp(value) {
    return Number(Math.max(0, Math.min(1, value)).toFixed(2));
  }
}

module.exports = { ConfidenceEngine };
