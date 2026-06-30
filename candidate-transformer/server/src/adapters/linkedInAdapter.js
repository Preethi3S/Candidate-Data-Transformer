const { SourceAdapter } = require("./sourceAdapter");
const { parseJsonInput } = require("../services/jsonInput");

class LinkedInAdapter extends SourceAdapter {
  constructor() {
    super({ sourceType: "LinkedIn", sourceName: "linkedin", priority: 2, baseConfidence: 0.8 });
  }

  async parse(file, body = {}) {
    let data = {};
    try {
      data = parseJsonInput(file, body.linkedinJson) || {};
    } catch (error) {
      return { records: [], errors: [{ source: "LinkedIn", message: `Invalid LinkedIn JSON: ${error.message}` }] };
    }

    const url = data.linkedin_url || data.linkedinUrl || data.url;
    if (!url && !Object.keys(data).length) return { records: [], errors: [] };

    return {
      records: [{
        sourceType: this.sourceType,
        sourceName: file?.originalname || url || this.sourceName,
        priority: this.priority,
        baseConfidence: this.baseConfidence,
        fields: {
          full_name: data.name || data.full_name ? this.entry("full_name", data.name || data.full_name, "linkedin_profile", 0.8) : null,
          emails: data.email ? [this.entry("emails", String(data.email).toLowerCase(), "linkedin_profile", 0.75)] : [],
          phones: data.phone ? [this.entry("phones", data.phone, "linkedin_profile", 0.7)] : [],
          headline: data.headline ? this.entry("headline", data.headline, "linkedin_profile", 0.8) : null,
          years_experience: data.years_experience ?? data.yearsExperience ? this.entry("years_experience", Number(data.years_experience ?? data.yearsExperience), "linkedin_profile", 0.75) : null,
          skills: (data.skills || []).map((skill) => this.entry("skills", skill, "linkedin_profile", 0.8)),
          experience: (data.experience || []).map((item) => this.entry("experience", item, "linkedin_profile", 0.78)),
          education: (data.education || []).map((item) => this.entry("education", item, "linkedin_profile", 0.78)),
          links: url ? [this.entry("links", { linkedin: url }, "linkedin_url", 0.9)] : [],
          location: data.location ? this.entry("location", typeof data.location === "string" ? { city: data.location } : data.location, "linkedin_profile", 0.75) : null
        },
        errors: []
      }],
      errors: []
    };
  }
}

module.exports = { LinkedInAdapter };
