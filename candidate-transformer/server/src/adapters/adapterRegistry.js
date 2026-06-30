const { CSVAdapter } = require("./csvAdapter");
const { ResumeAdapter } = require("./resumeAdapter");
const { ATSAdapter } = require("./atsAdapter");
const { LinkedInAdapter } = require("./linkedInAdapter");
const { GitHubAdapter } = require("./githubAdapter");

class AdapterRegistry {
  constructor(adapters = {}) {
    this.adapters = {
      csvFile: adapters.csvFile || new CSVAdapter(),
      resumeFile: adapters.resumeFile || new ResumeAdapter(),
      atsFile: adapters.atsFile || new ATSAdapter(),
      linkedinFile: adapters.linkedinFile || new LinkedInAdapter(),
      githubFile: adapters.githubFile || new GitHubAdapter()
    };
  }

  async parse(files, body = {}) {
    const results = await Promise.all(
      Object.entries(this.adapters).map(async ([field, adapter]) => adapter.parse(files?.[field]?.[0], body))
    );

    return {
      records: results.flatMap((result) => result.records),
      errors: results.flatMap((result) => result.errors)
    };
  }
}

module.exports = { AdapterRegistry };
