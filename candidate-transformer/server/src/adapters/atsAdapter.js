const { SourceAdapter } = require("./sourceAdapter");
const { parseJsonInput } = require("../services/jsonInput");

class ATSAdapter extends SourceAdapter {
  constructor() {
    super({ sourceType: "ATS", sourceName: "ats.json", priority: 3, baseConfidence: 0.85 });
  }

  async parse(file, body = {}) {
    let data = null;
    try {
      data = parseJsonInput(file, body.atsJson);
    } catch (error) {
      return { records: [], errors: [{ source: "ATS", message: `Invalid ATS JSON: ${error.message}` }] };
    }
    if (!data) return { records: [], errors: [] };

    return {
      records: [{
        sourceType: this.sourceType,
        sourceName: file?.originalname || "ats.json",
        priority: this.priority,
        baseConfidence: this.baseConfidence,
        fields: {
          full_name: data.candidateName || data.name ? this.entry("full_name", data.candidateName || data.name, "ats_json") : null,
          emails: data.email ? [this.entry("emails", String(data.email).toLowerCase(), "ats_json")] : [],
          phones: data.phone ? [this.entry("phones", data.phone, "ats_json")] : [],
          headline: data.title || data.currentRole ? this.entry("headline", data.title || data.currentRole, "ats_json") : null,
          years_experience: data.yearsExp ?? data.years_experience ? this.entry("years_experience", Number(data.yearsExp ?? data.years_experience), "ats_json") : null,
          skills: (data.skills || []).map((skill) => this.entry("skills", skill, "ats_json")),
          experience: (data.experience || []).map((item) => this.entry("experience", item, "ats_json")),
          education: (data.education || []).map((item) => this.entry("education", item, "ats_json")),
          links: [],
          location: data.location ? this.entry("location", typeof data.location === "string" ? { city: data.location } : data.location, "ats_json") : null
        },
        errors: []
      }],
      errors: []
    };
  }
}

module.exports = { ATSAdapter };
