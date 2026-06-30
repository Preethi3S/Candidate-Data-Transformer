const { SourceAdapter } = require("./sourceAdapter");
const { ResumeParserService } = require("../parsers/resumeParser");

const INVALID_NAMES = new Set([
  "professional summary",
  "summary",
  "profile",
  "objective",
  "career objective",
  "skills",
  "technical skills",
  "experience",
  "work experience",
  "education",
  "projects",
  "certifications",
  "achievements",
  "contact",
  "contact information"
]);

class ResumeAdapter extends SourceAdapter {
  constructor(parser = new ResumeParserService()) {
    super({
      sourceType: "Resume",
      sourceName: "resume.pdf",
      priority: 5,
      baseConfidence: 0.95
    });

    this.parser = parser;
  }

  async parse(file) {
    if (!file) {
      return {
        records: [],
        errors: []
      };
    }

    try {
      const parsed = await this.parser.parse(file.buffer);

      const sourceName =
        file.originalname || this.sourceName;

      let fullName = parsed.name;

      if (
        fullName &&
        INVALID_NAMES.has(
          fullName.toLowerCase().trim()
        )
      ) {
        fullName = null;
      }
      
      console.log("Resume Parsed Name:", parsed.name);
      console.log("Resume Rejected Name:", parsed.rejectedName);
      
      const record = {
        sourceType: this.sourceType,
        sourceName,
        priority: this.priority,
        baseConfidence: this.baseConfidence,

        fields: {
          full_name: fullName
            ? this.entry(
                "full_name",
                fullName,
                "email_proximity_name_extraction",
                0.95
              )
            : null,

          emails: parsed.email
            ? [
                this.entry(
                  "emails",
                  parsed.email.toLowerCase(),
                  "regex_extraction",
                  0.95
                )
              ]
            : [],

          phones: parsed.phone
            ? [
                this.entry(
                  "phones",
                  parsed.phone,
                  "regex_extraction",
                  0.90
                )
              ]
            : [],

          headline: null,

          years_experience:
            parsed.years !== null
              ? this.entry(
                  "years_experience",
                  parsed.years,
                  "regex_extraction",
                  0.70
                )
              : null,

          skills: parsed.skills.map((skill) =>
            this.entry(
              "skills",
              skill,
              "dictionary_match",
              0.80
            )
          ),

          experience: parsed.experience.map((item) =>
            this.entry(
              "experience",
              item,
              "regex_extraction",
              0.65
            )
          ),

          education: parsed.education.map((item) =>
            this.entry(
              "education",
              item,
              "regex_extraction",
              0.65
            )
          ),

          location: null,

          links: []
        },

        rawText: parsed.text,

        errors: []
        
      };

      return {
        records: [record],
        errors: []
      };
    } catch (error) {
      return {
        records: [],
        errors: [
          {
            source: "Resume",
            message: error.message
          }
        ]
      };
    }
  }
}

module.exports = { ResumeAdapter };