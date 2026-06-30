class PremiumInsightsEngine {
  analyze({ profile, confidence, conflicts = [], validationErrors = [], previousCandidates = [], timestamps = {} }) {
    const completeness = this.completeness(profile);
    const consistency = this.consistency(conflicts, validationErrors);
    const quality = this.quality(completeness.completeness_score, confidence.overall_confidence, consistency);
    const sourceReliability = this.sourceReliability(profile.provenance);
    const skillIntelligence = this.skillIntelligence(profile);
    const warnings = this.warnings(profile, conflicts, validationErrors);
    const duplicates = this.duplicates(profile, previousCandidates);
    const auditTrail = this.auditTrail({ validationErrors, conflicts, timestamps });
    const insights = this.insights(profile, quality);

    return {
      completeness,
      quality,
      sourceReliability,
      skillIntelligence,
      warnings,
      duplicates,
      auditTrail,
      timeline: auditTrail.map((entry) => ({ step: entry.step, timestamp: entry.timestamp })),
      insights
    };
  }

  completeness(profile) {
    const expected = [
      Boolean(profile.full_name),
      profile.emails.length > 0,
      profile.phones.length > 0,
      Boolean(profile.headline),
      profile.skills.length > 0,
      profile.experience.length > 0,
      profile.education.length > 0,
      profile.years_experience !== null
    ];
    const completed = expected.filter(Boolean).length;
    return {
      completed_fields: completed,
      total_expected_fields: expected.length,
      completeness_score: Math.round((completed / expected.length) * 100)
    };
  }

  consistency(conflicts, validationErrors) {
    const penalty = conflicts.length * 0.12 + validationErrors.length * 0.06;
    return Math.max(0, Number((1 - penalty).toFixed(2)));
  }

  quality(completenessScore, overallConfidence, consistency) {
    const score = Math.round(completenessScore * 0.4 + overallConfidence * 100 * 0.4 + consistency * 100 * 0.2);
    return {
      quality_score: score,
      label: score >= 90 ? "Excellent" : score >= 75 ? "Good" : score >= 50 ? "Average" : "Poor",
      factors: {
        completeness: completenessScore,
        confidence: Math.round(overallConfidence * 100),
        consistency: Math.round(consistency * 100)
      }
    };
  }

  sourceReliability(provenance) {
    const grouped = provenance.reduce((acc, entry) => {
      const key = this.sourceLabel(entry.source);
      acc[key] = acc[key] || [];
      acc[key].push(entry.confidence);
      return acc;
    }, {});

    return Object.fromEntries(Object.entries(grouped).map(([source, scores]) => [
      source,
      Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2))
    ]));
  }

  skillIntelligence(profile) {
    return profile.skills.map((skill) => {
      const entries = profile.provenance.filter((entry) => entry.field === "skills" && entry.value === skill.name);
      const aliases = [...new Set(entries.map((entry) => entry.original_value || entry.value).filter(Boolean))];
      const sources = [...new Set(entries.map((entry) => this.sourceLabel(entry.source)))];
      return {
        canonical_skill: skill.name,
        aliases: aliases.length ? aliases : [skill.name],
        frequency: entries.length || 1,
        confidence: skill.confidence,
        sources
      };
    });
  }

  warnings(profile, conflicts, validationErrors) {
    const warnings = [];
    if (!profile.full_name) warnings.push({ code: "MISSING_NAME", message: "Missing candidate name", severity: "high" });
    if (!profile.emails.length) warnings.push({ code: "MISSING_EMAIL", message: "Missing email address", severity: "high" });
    if (!profile.phones.length) warnings.push({ code: "MISSING_PHONE", message: "Missing phone number", severity: "medium" });
    if (!profile.skills.length) warnings.push({ code: "MISSING_SKILLS", message: "No skills detected", severity: "medium" });
    conflicts.forEach((conflict) => warnings.push({
      code: "FIELD_CONFLICT",
      message: `Conflicting values found for ${conflict.field}`,
      severity: "medium"
    }));
    validationErrors.forEach((error) => warnings.push({
      code: "VALIDATION_WARNING",
      message: error.message || error.code || "Validation warning",
      severity: "low"
    }));
    return warnings;
  }

  duplicates(profile, previousCandidates) {
    return previousCandidates
      .map((candidate) => {
        const other = candidate.canonical_profile || candidate.canonicalProfile || candidate;
        if (!other || other.candidate_id === profile.candidate_id) return null;
        const emailMatch = profile.emails.some((email) => other.emails?.includes(email));
        const phoneMatch = profile.phones.some((phone) => other.phones?.includes(phone));
        const nameScore = this.nameSimilarity(profile.full_name, other.full_name);
        const score = Math.min(1, (emailMatch ? 0.5 : 0) + (phoneMatch ? 0.35 : 0) + nameScore * 0.15);
        return score >= 0.65
          ? { candidate_id: other.candidate_id, name: other.full_name, match_score: Number(score.toFixed(2)), factors: { emailMatch, phoneMatch, nameScore: Number(nameScore.toFixed(2)) } }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.match_score - a.match_score);
  }

  auditTrail({ validationErrors, conflicts, timestamps }) {
    const now = new Date().toISOString();
    const stepNames = Object.keys(timestamps || {}).length
      ? Object.keys(timestamps)
      : ["Source Upload", "Source Validation", "Source Parsing", "Normalization", "Conflict Resolution", "Confidence Assignment", "Projection Layer", "Final Output"];
    const steps = stepNames.map((step) => [step, step === "Final Output" && (validationErrors.length || conflicts.length) ? "warning" : "success"]);
    return steps.map(([step, status], index) => ({
      step,
      status,
      timestamp: timestamps[step] || new Date(Date.parse(now) + index * 250).toISOString(),
      notes: status === "warning" ? "Review warnings for details" : undefined
    }));
  }

  insights(profile, quality) {
    const topSkill = [...profile.skills].sort((a, b) => b.confidence - a.confidence)[0]?.name || null;
    return {
      top_skill: topSkill,
      experience_years: profile.years_experience,
      profile_strength: quality.label,
      recommended_action: quality.quality_score >= 75 ? "Ready for recruiter review" : "Request missing candidate details"
    };
  }

  sourceLabel(source) {
    if (/csv/i.test(source)) return "CSV";
    if (/resume|pdf/i.test(source)) return "Resume";
    return source || "Unknown";
  }

  nameSimilarity(a, b) {
    if (!a || !b) return 0;
    const left = new Set(a.toLowerCase().split(/\s+/));
    const right = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...left].filter((part) => right.has(part)).length;
    const union = new Set([...left, ...right]).size;
    return union ? intersection / union : 0;
  }
}

module.exports = { PremiumInsightsEngine };

