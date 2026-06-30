class SourceDetector {
  detect(files = {}, configInput, body = {}) {
    const sources = [];

    if (files.csvFile?.[0]) {
      sources.push({
        field: "csvFile",
        type: "CSV",
        filename: files.csvFile[0].originalname || "recruiter.csv",
        parser: "CSVAdapter",
        expectedConfidence: 0.95
      });
    }

    if (files.resumeFile?.[0]) {
      sources.push({
        field: "resumeFile",
        type: "Resume",
        filename: files.resumeFile[0].originalname || "resume.pdf",
        parser: "ResumeAdapter",
        expectedConfidence: 0.8
      });
    }

    if (files.atsFile?.[0] || body.atsJson) {
      sources.push({
        field: "atsFile",
        type: "ATS",
        filename: files.atsFile?.[0]?.originalname || "ats.json",
        parser: "ATSAdapter",
        expectedConfidence: 0.85
      });
    }

    if (files.linkedinFile?.[0] || body.linkedinJson) {
      sources.push({
        field: "linkedinFile",
        type: "LinkedIn",
        filename: files.linkedinFile?.[0]?.originalname || "linkedin",
        parser: "LinkedInAdapter",
        expectedConfidence: 0.8
      });
    }

    if (files.githubFile?.[0] || body.githubJson) {
      sources.push({
        field: "githubFile",
        type: "GitHub",
        filename: files.githubFile?.[0]?.originalname || "github",
        parser: "GitHubAdapter",
        expectedConfidence: 0.75
      });
    }

    if (configInput) {
      sources.push({
        field: "configFile",
        type: "ProjectionConfig",
        filename: configInput.originalname || "projection-config.json",
        parser: "JSON.parse",
        expectedConfidence: 1
      });
    }

    return {
      sources,
      errors: sources.length ? [] : [{ source: "Detector", message: "No candidate source files were detected" }]
    };
  }
}

module.exports = { SourceDetector };
