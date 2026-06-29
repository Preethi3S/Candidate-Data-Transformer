const { PhoneNormalizer } = require("../normalizers/phoneNormalizer");

class ProjectionEngine {
  constructor() {
    this.phoneNormalizer = new PhoneNormalizer();
  }

  project(profile, config = {}) {
    const output = {};
    const errors = [];
    const fields = config.fields || [];
    const onMissing = config.on_missing || "null";

    fields.forEach((fieldConfig) => {
      const value = this.applyConversion(this.getPath(profile, fieldConfig.from), fieldConfig);
      const missing = value === undefined || value === null || value === "";

      if (missing && onMissing === "error") {
        errors.push({ path: fieldConfig.path, from: fieldConfig.from, message: "Missing required field" });
        return;
      }
      if (missing && onMissing === "omit") return;

      this.setPath(output, fieldConfig.path, missing ? null : value);
    });

    if (config.include_confidence) {
      output._confidence = {
        overall: profile.overall_confidence,
        fields: this.buildConfidenceIndex(profile)
      };
    }

    if (config.include_provenance) {
      output._provenance = profile.provenance;
    }

    return { output, errors };
  }

  getPath(object, path) {
    return path.replace(/\[(\d+)\]/g, ".$1").split(".").reduce((current, key) => {
      if (current === undefined || current === null) return undefined;
      return current[key];
    }, object);
  }

  setPath(object, path, value) {
    const parts = path.split(".");
    let current = object;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  }

  applyConversion(value, fieldConfig) {
    let converted = value;
    if (fieldConfig.normalize === "E164") converted = this.phoneNormalizer.normalize(value);
    if (fieldConfig.type === "string" && converted !== undefined && converted !== null) converted = String(converted);
    if (fieldConfig.type === "number" && converted !== undefined && converted !== null) converted = Number(converted);
    if (fieldConfig.type === "boolean" && converted !== undefined && converted !== null) converted = Boolean(converted);
    if (fieldConfig.type === "array" && converted !== undefined && converted !== null && !Array.isArray(converted)) converted = [converted];
    return converted;
  }

  buildConfidenceIndex(profile) {
    return {
      full_name: this.maxConfidence(profile.provenance, "full_name"),
      emails: this.maxConfidence(profile.provenance, "emails"),
      phones: this.maxConfidence(profile.provenance, "phones"),
      skills: profile.skills.map((skill) => ({ name: skill.name, confidence: skill.confidence })),
      experience: profile.experience.map((item) => ({ company: item.company, title: item.title, confidence: item.confidence }))
    };
  }

  maxConfidence(provenance, field) {
    return Math.max(0, ...provenance.filter((entry) => entry.field === field).map((entry) => entry.confidence));
  }
}

module.exports = { ProjectionEngine };
