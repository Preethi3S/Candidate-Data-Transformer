const { CSVAdapter } = require("./csvAdapter");
const { ResumeAdapter } = require("./resumeAdapter");

class AdapterRegistry {
  constructor(adapters = {}) {
    this.adapters = {
      csvFile: adapters.csvFile || new CSVAdapter(),
      resumeFile: adapters.resumeFile || new ResumeAdapter()
    };
  }

  async parse(files) {
    const results = await Promise.all(
      Object.entries(this.adapters).map(async ([field, adapter]) => adapter.parse(files?.[field]?.[0]))
    );

    return {
      records: results.flatMap((result) => result.records),
      errors: results.flatMap((result) => result.errors)
    };
  }
}

module.exports = { AdapterRegistry };
