const { PhoneNormalizer } = require("../normalizers/phoneNormalizer");

const rejectedNamePattern = /^(professional\s+summary|summary|skills?|technical\s+skills|work\s+experience|experience|education|certifications?|projects?|achievements?|contact\s+information)$/i;
const strictEmailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

class FieldValidationEngine {
  constructor(phoneNormalizer = new PhoneNormalizer()) {
    this.phoneNormalizer = phoneNormalizer;
  }

  validateRecords(records) {
    const warnings = [];
    const validated = records.map((record) => {
      const fields = { ...record.fields };
      if (fields.full_name && !this.isValidName(fields.full_name.value)) {
        warnings.push({
          source: record.sourceType,
          code: "INVALID_NAME",
          message: `${record.sourceType} name candidate rejected by name validator`
        });
        fields.full_name = {
          ...fields.full_name,
          value: null,
          confidence: 0,
          notes: "Rejected by name validator"
        };
      }
      return { ...record, fields };
    });

    return { records: validated, warnings };
  }

  validateProfile(profile) {
    const warnings = [];

    if (!this.isValidName(profile.full_name)) {
      warnings.push({ source: "OutputVerification", code: "INVALID_NAME", message: "Candidate name is missing or looks like a resume section header" });
      profile.full_name = null;
    }

    profile.emails = [...new Set((profile.emails || []).map((email) => String(email).trim().toLowerCase()).filter((email) => {
      const valid = strictEmailPattern.test(email);
      if (!valid) warnings.push({ source: "OutputVerification", code: "INVALID_EMAIL", message: `Invalid email removed: ${email}` });
      return valid;
    }))];

    profile.phones = [...new Set((profile.phones || []).map((phone) => this.phoneNormalizer.normalize(phone)).filter((phone) => {
      const valid = Boolean(phone);
      if (!valid) warnings.push({ source: "OutputVerification", code: "INVALID_PHONE", message: "Invalid phone removed" });
      return valid;
    }))];

    profile.skills = this.dedupeBy(profile.skills || [], (skill) => String(skill.name || "").trim().toLowerCase()).filter((skill) => {
      const valid = Boolean(skill.name);
      if (!valid) warnings.push({ source: "OutputVerification", code: "INVALID_SKILL", message: "Empty skill removed" });
      return valid;
    });

    profile.education = this.dedupeBy(profile.education || [], (item) => `${item.institution || ""}|${item.degree || ""}`.toLowerCase())
      .filter((item) => item.institution || item.degree);
    profile.experience = this.dedupeBy(profile.experience || [], (item) => `${item.company || ""}|${item.title || ""}`.toLowerCase())
      .filter((item) => item.company || item.title);

    if (!profile.emails.length) warnings.push({ source: "OutputVerification", code: "MISSING_EMAIL", message: "No valid email in final profile" });
    if (!profile.full_name) warnings.push({ source: "OutputVerification", code: "MISSING_NAME", message: "No valid candidate name in final profile" });

    return { profile, warnings };
  }

  isValidName(value) {
    const text = String(value || "").trim();
    if (!text || rejectedNamePattern.test(text)) return false;
    if (/[0-9@:/\\]/.test(text)) return false;
    const words = text.split(/\s+/);
    if (words.length < 2 || words.length > 4) return false;
    return words.every((word) => /^[A-Z][a-zA-Z.'-]*$/.test(word) || /^[A-Z]$/.test(word));
  }

  dedupeBy(items, keyFn) {
    const seen = new Set();
    return items.filter((item) => {
      const key = keyFn(item);
      if (!key || key === "|") return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = { FieldValidationEngine, rejectedNamePattern, strictEmailPattern };
