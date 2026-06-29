const { AdapterRegistry } = require("../adapters/adapterRegistry");
const { RecordNormalizer } = require("../normalizers/recordNormalizer");
const { MergeEngine } = require("../mergers/mergeEngine");
const { ConfidenceEngine } = require("../confidence/confidenceEngine");
const { ProjectionEngine } = require("../projection/projectionEngine");
const { candidateProfileSchema, projectionConfigSchema, validateWithSchema } = require("../validators/schemas");

const defaultProjectionConfig = {
  fields: [
    { path: "candidate_name", from: "full_name" },
    { path: "primary_email", from: "emails[0]" },
    { path: "phone", from: "phones[0]", normalize: "E164" },
    { path: "headline", from: "headline" },
    { path: "skills", from: "skills", type: "array" }
  ],
  include_confidence: true,
  include_provenance: true,
  on_missing: "null"
};

class ProcessingPipeline {
  constructor({
    adapterRegistry = new AdapterRegistry(),
    normalizer = new RecordNormalizer(),
    mergeEngine = new MergeEngine(),
    confidenceEngine = new ConfidenceEngine(),
    projectionEngine = new ProjectionEngine()
  } = {}) {
    this.adapterRegistry = adapterRegistry;
    this.normalizer = normalizer;
    this.mergeEngine = mergeEngine;
    this.confidenceEngine = confidenceEngine;
    this.projectionEngine = projectionEngine;
  }

  async process(files, configInput) {
    const configResult = this.parseConfig(configInput);
    const adapterResult = await this.adapterRegistry.parse(files);
    const normalizedRecords = adapterResult.records.map((record) => this.normalizer.normalize(record));
    const merged = this.mergeEngine.merge(normalizedRecords);
    const confidence = this.confidenceEngine.score(merged.profile);
    const canonicalProfile = {
      ...merged.profile,
      overall_confidence: confidence.overall_confidence
    };

    const canonicalValidation = validateWithSchema(candidateProfileSchema, canonicalProfile);
    const projectionValidation = validateWithSchema(projectionConfigSchema, configResult.config);
    const projection = projectionValidation.ok
      ? this.projectionEngine.project(canonicalProfile, projectionValidation.data)
      : { output: {}, errors: projectionValidation.errors };

    return {
      canonicalProfile,
      projectedProfile: projection.output,
      validation: {
        canonical: canonicalValidation.ok,
        projectionConfig: projectionValidation.ok,
        errors: [
          ...adapterResult.errors,
          ...configResult.errors,
          ...canonicalValidation.errors,
          ...projectionValidation.errors,
          ...projection.errors
        ]
      },
      confidence,
      conflicts: merged.conflicts,
      pipeline: ["Uploaded", "Parsed", "Normalized", "Merged", "Validated", "Completed"]
    };
  }

  parseConfig(configFile) {
    if (!configFile) return { config: defaultProjectionConfig, errors: [] };
    try {
      const parsed = JSON.parse(configFile.buffer.toString("utf8"));
      const config = Object.keys(parsed || {}).length ? parsed : defaultProjectionConfig;
      return { config, errors: [] };
    } catch (error) {
      return {
        config: defaultProjectionConfig,
        errors: [{ source: "Config", message: `Invalid config JSON: ${error.message}` }]
      };
    }
  }
}

module.exports = { ProcessingPipeline, defaultProjectionConfig };
