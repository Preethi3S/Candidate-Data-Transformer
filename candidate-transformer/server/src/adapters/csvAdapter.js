const { SourceAdapter } = require("./sourceAdapter");
const { CSVParserService } = require("../parsers/csvParser");

class CSVAdapter extends SourceAdapter {
  constructor(parser = new CSVParserService()) {
    super({ sourceType: "CSV", sourceName: "recruiter.csv", priority: 4, baseConfidence: 0.9 });
    this.parser = parser;
  }

  async parse(file) {
    if (!file) return { records: [], errors: [] };
    const parsed = await this.parser.parse(file.buffer);
    const records = parsed.rows.map((row, index) => ({
      sourceType: this.sourceType,
      sourceName: file.originalname || this.sourceName,
      priority: this.priority,
      baseConfidence: this.baseConfidence,
      rowNumber: index + 1,
      fields: {
        full_name: this.entry("full_name", row.name || null, "csv_column"),
        emails: row.email ? [this.entry("emails", row.email.toLowerCase(), "csv_column")] : [],
        phones: row.phone ? [this.entry("phones", row.phone, "csv_column")] : [],
        headline: row.title ? this.entry("headline", row.title, "csv_column") : null,
        experience: row.current_company || row.title ? [
          this.entry("experience", {
            company: row.current_company || null,
            title: row.title || null,
            start_date: null,
            end_date: null
          }, "csv_column")
        ] : [],
        skills: [],
        education: [],
        location: null,
        years_experience: null
      },
      errors: []
    }));

    return {
      records,
      errors: parsed.errors.map((error) => ({ source: "CSV", ...error }))
    };
  }
}

module.exports = { CSVAdapter };
