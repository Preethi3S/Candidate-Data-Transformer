const { SourceAdapter } = require("./sourceAdapter");
const { parseJsonInput } = require("../services/jsonInput");

class GitHubAdapter extends SourceAdapter {
  constructor() {
    super({ sourceType: "GitHub", sourceName: "github", priority: 1, baseConfidence: 0.75 });
  }

  async parse(file, body = {}) {
    let data = {};
    try {
      data = parseJsonInput(file, body.githubJson) || {};
    } catch (error) {
      return { records: [], errors: [{ source: "GitHub", message: `Invalid GitHub JSON: ${error.message}` }] };
    }

    const url = data.github_url || data.githubUrl || data.url;
    if (!url && !Object.keys(data).length) return { records: [], errors: [] };

    const languages = this.extractLanguages(data);
    return {
      records: [{
        sourceType: this.sourceType,
        sourceName: file?.originalname || url || this.sourceName,
        priority: this.priority,
        baseConfidence: this.baseConfidence,
        fields: {
          full_name: data.name ? this.entry("full_name", data.name, "github_profile", 0.65) : null,
          emails: data.email ? [this.entry("emails", String(data.email).toLowerCase(), "github_profile", 0.65)] : [],
          phones: [],
          headline: data.bio ? this.entry("headline", data.bio, "github_profile", 0.7) : null,
          years_experience: null,
          skills: languages.map((skill) => this.entry("skills", skill, "github_language_inference", 0.75)),
          experience: [],
          education: [],
          links: url ? [this.entry("links", { github: url }, "github_url", 0.85)] : [],
          location: data.location ? this.entry("location", { city: data.location }, "github_profile", 0.6) : null
        },
        repositories: data.repositories || data.repos || [],
        contributionData: data.contributionData || data.contributions || null,
        errors: []
      }],
      errors: []
    };
  }

  extractLanguages(data) {
    const languages = new Set(data.languages || []);
    (data.repositories || data.repos || []).forEach((repo) => {
      if (repo.language) languages.add(repo.language);
      (repo.languages || []).forEach((language) => languages.add(language));
    });
    return Array.from(languages);
  }
}

module.exports = { GitHubAdapter };
