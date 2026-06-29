const { SourceAdapter } = require("./sourceAdapter");
const { ResumeParserService } = require("../parsers/resumeParser");

class ResumeAdapter extends SourceAdapter {
  constructor(parser = new ResumeParserService()) {
    super({ sourceType: "Resume", sourceName: "resume.pdf", priority: 2, baseConfidence: 0.8 });
    this.parser = parser;
  }

  async parse(file) {
    if (!file) return { records: [], errors: [{ source: "Resume", message: "Resume file missing" }] };

    try {
      const parsed = await this.parser.parse(file.buffer);
      const sourceName = file.originalname || this.sourceName;
      const record = {
        sourceType: this.sourceType,
        sourceName,
        priority: this.priority,
        baseConfidence: this.baseConfidence,
        fields: {
          full_name: parsed.name ? this.entry("full_name", parsed.name, "regex_extraction", 0.8) : null,
          emails: parsed.email ? [this.entry("emails", parsed.email.toLowerCase(), "regex_extraction", 0.9)] : [],
          phones: parsed.phone ? [this.entry("phones", parsed.phone, "regex_extraction", 0.75)] : [],
          headline: null,
          years_experience: parsed.years !== null ? this.entry("years_experience", parsed.years, "regex_extraction", 0.7) : null,
          skills: parsed.skills.map((skill) => this.entry("skills", skill, "dictionary_match", 0.8)),
          experience: parsed.experience.map((item) => this.entry("experience", item, "regex_extraction", 0.65)),
          education: parsed.education.map((item) => this.entry("education", item, "regex_extraction", 0.65)),
          location: null
        },
        rawText: parsed.text,
        errors: []
      };

      return { records: [record], errors: [] };
    } catch (error) {
      return { records: [], errors: [{ source: "Resume", message: error.message }] };
    }
  }
}

module.exports = { ResumeAdapter };
