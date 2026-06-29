class ConfidenceEngine {
  score(profile) {
    const fieldConfidence = {
      full_name: this.fieldScore(profile.provenance, "full_name", profile.full_name),
      emails: this.collectionScore(profile.provenance, "emails", profile.emails.length),
      phones: this.collectionScore(profile.provenance, "phones", profile.phones.length),
      skills: this.average(profile.skills.map((skill) => skill.confidence)),
      experience: this.average(profile.experience.map((item) => item.confidence))
    };

    const weights = { full_name: 0.2, emails: 0.25, phones: 0.2, skills: 0.2, experience: 0.15 };
    const overall = Object.entries(weights).reduce((sum, [field, weight]) => sum + fieldConfidence[field] * weight, 0);

    return {
      fieldConfidence,
      overall_confidence: Number(overall.toFixed(2))
    };
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
}

module.exports = { ConfidenceEngine };
