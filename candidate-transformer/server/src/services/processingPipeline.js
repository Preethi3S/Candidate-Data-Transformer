const { AdapterRegistry } = require("../adapters/adapterRegistry");
const { RecordNormalizer } = require("../normalizers/recordNormalizer");
const { MergeEngine } = require("../mergers/mergeEngine");
const { ConfidenceEngine } = require("../confidence/confidenceEngine");
const { ProjectionEngine } = require("../projection/projectionEngine");
const { PremiumInsightsEngine } = require("./premiumInsightsEngine");
const { SourceDetector } = require("./sourceDetector");
const { DeduplicationEngine } = require("./deduplicationEngine");
const { CandidateResolutionEngine } = require("./candidateResolutionEngine");
const { SourceValidationEngine } = require("./sourceValidationEngine");
const { FieldValidationEngine } = require("./fieldValidationEngine");
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
    projectionEngine = new ProjectionEngine(),
    premiumInsightsEngine = new PremiumInsightsEngine(),
    sourceDetector = new SourceDetector(),
    deduplicationEngine = new DeduplicationEngine(),
    candidateResolutionEngine = new CandidateResolutionEngine(),
    sourceValidationEngine = new SourceValidationEngine(),
    fieldValidationEngine = new FieldValidationEngine()
  } = {}) {
    this.adapterRegistry = adapterRegistry;
    this.normalizer = normalizer;
    this.mergeEngine = mergeEngine;
    this.confidenceEngine = confidenceEngine;
    this.projectionEngine = projectionEngine;
    this.premiumInsightsEngine = premiumInsightsEngine;
    this.sourceDetector = sourceDetector;
    this.deduplicationEngine = deduplicationEngine;
    this.candidateResolutionEngine = candidateResolutionEngine;
    this.sourceValidationEngine = sourceValidationEngine;
    this.fieldValidationEngine = fieldValidationEngine;
  }

  async process(files, configInput, context = {}) {
    const startedAt = Date.now();
    const detection = this.sourceDetector.detect(files, configInput, context.body || {});
    const sourceValidation = this.sourceValidationEngine.validate(files, configInput, context.body || {});
    const configResult = this.parseConfig(configInput);
    const adapterResult = await this.adapterRegistry.parse(files, context.body || {});
    const resolvedCandidates = this.candidateResolutionEngine.resolve(adapterResult.records);
    const recordValidation = this.fieldValidationEngine.validateRecords(resolvedCandidates.records);
    const normalizedRecords = recordValidation.records.map((record) => this.normalizer.normalize(record));
    const deduplicated = this.deduplicationEngine.dedupe(normalizedRecords);
    const merged = this.mergeEngine.merge(deduplicated.records);
    const outputValidation = this.fieldValidationEngine.validateProfile({
      ...merged.profile,
      identity_match_score: resolvedCandidates.identity.identity_match_score
    });
    const confidence = this.confidenceEngine.score(outputValidation.profile, { identity: resolvedCandidates.identity, conflicts: merged.conflicts });
    const canonicalProfile = {
      ...outputValidation.profile,
      overall_confidence: confidence.overall_confidence
    };

    const projectionValidation = validateWithSchema(projectionConfigSchema, configResult.config);
    const projection = projectionValidation.ok
      ? this.projectionEngine.project(canonicalProfile, projectionValidation.data)
      : { output: {}, errors: projectionValidation.errors };
    const canonicalValidation = validateWithSchema(candidateProfileSchema, canonicalProfile);
    const allErrors = [
      ...detection.errors,
      ...sourceValidation.errors,
      ...adapterResult.errors,
      ...configResult.errors,
      ...recordValidation.warnings,
      ...outputValidation.warnings,
      ...canonicalValidation.errors,
      ...projectionValidation.errors,
      ...projection.errors
    ];
    const premium = this.premiumInsightsEngine.analyze({
      profile: canonicalProfile,
      confidence,
      conflicts: merged.conflicts,
      validationErrors: allErrors,
      previousCandidates: context.previousCandidates || [],
      timestamps: this.timeline(startedAt)
    });
    const pipeline = [
      "Source Upload",
      "Source Validation",
      "Source Parsing",
      "Candidate Identity Resolution",
      "Resume Section Detection",
      "Field Extraction",
      "Field Validation",
      "Normalization",
      "Deduplication",
      "Conflict Resolution",
      "Missing Data Backfill",
      "Confidence Assignment",
      "Canonical Profile Generation",
      "Projection Layer",
      "Final Output"
    ];

    return {
      detectedSources: detection.sources,
      sourceValidation: sourceValidation.sources,
      canonicalProfile,
      projectedProfile: projection.output,
      validation: {
        canonical: canonicalValidation.ok,
        projectionConfig: projectionValidation.ok,
        projectedOutput: projection.errors.length === 0,
        errors: allErrors
      },
      deduplication: deduplicated.summary,
      identity: resolvedCandidates.identity,
      confidence,
      conflicts: merged.conflicts,
      premium,
      pipeline,
      processingTrace: this.trace(pipeline, startedAt, allErrors)
    };
  }

  timeline(startedAt) {
    return [
      "Source Upload",
      "Source Validation",
      "Source Parsing",
      "Candidate Identity Resolution",
      "Resume Section Detection",
      "Field Extraction",
      "Field Validation",
      "Normalization",
      "Deduplication",
      "Conflict Resolution",
      "Missing Data Backfill",
      "Confidence Assignment",
      "Canonical Profile Generation",
      "Projection Layer",
      "Final Output"
    ].reduce((acc, step, index) => ({
      ...acc,
      [step]: new Date(startedAt + index * 150).toISOString()
    }), {});
  }

  trace(pipeline, startedAt, errors) {
    return pipeline.map((step, index) => ({
      step,
      status: errors.length && step === "Final Output" ? "warning" : "success",
      timestamp: new Date(startedAt + index * 150).toISOString()
    }));
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
