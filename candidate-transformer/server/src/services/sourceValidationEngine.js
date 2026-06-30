class SourceValidationEngine {
  validate(files = {}, configInput, body = {}) {
    const results = [];

    if (files.resumeFile?.[0]) results.push(this.validateFile("Resume", files.resumeFile[0]));
    if (files.csvFile?.[0]) results.push(this.validateFile("CSV", files.csvFile[0]));
    if (files.atsFile?.[0] || body.atsJson) results.push(this.validateJsonSource("ATS", files.atsFile?.[0], body.atsJson, ["candidateName", "name", "email", "phone"]));
    if (files.linkedinFile?.[0] || body.linkedinJson) results.push(this.validateJsonSource("LinkedIn", files.linkedinFile?.[0], body.linkedinJson, ["name", "headline", "skills", "experience", "linkedin_url", "linkedinUrl", "url"]));
    if (files.githubFile?.[0] || body.githubJson) results.push(this.validateJsonSource("GitHub", files.githubFile?.[0], body.githubJson, ["name", "bio", "languages", "repositories", "repos", "github_url", "githubUrl", "url"]));
    if (configInput) results.push(this.validateJsonSource("ProjectionConfig", configInput, null, ["fields"]));

    return {
      sources: results,
      errors: results.filter((result) => result.status === "invalid_source")
    };
  }

  validateFile(source, file) {
    if (!file?.buffer?.length) {
      return this.invalid(source, `${source} file is empty or unreadable`);
    }
    return { source, status: "valid_source" };
  }

  validateJsonSource(source, file, rawText, acceptedKeys) {
    const payload = file?.buffer ? file.buffer.toString("utf8") : rawText;
    if (!payload || !String(payload).trim()) {
      return this.invalid(source, `${source} JSON is empty`);
    }

    try {
      const parsed = JSON.parse(String(payload));
      if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
        return this.invalid(source, `${source} JSON must be an object`);
      }
      const hasKnownKey = acceptedKeys.some((key) => Object.prototype.hasOwnProperty.call(parsed, key));
      if (!hasKnownKey) {
        return this.invalid(source, `${source} JSON is missing required candidate keys`);
      }
      return { source, status: "valid_source" };
    } catch (error) {
      return this.invalid(source, `Invalid ${source} JSON: ${error.message}`);
    }
  }

  invalid(source, reason) {
    return { source, status: "invalid_source", reason, message: reason };
  }
}

module.exports = { SourceValidationEngine };
