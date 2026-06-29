const { ProcessingPipeline } = require("../services/processingPipeline");
const { CandidateRepository } = require("../services/candidateRepository");
const { ProjectionEngine } = require("../projection/projectionEngine");
const { projectionConfigSchema, validateWithSchema } = require("../validators/schemas");

const pipeline = new ProcessingPipeline();
const repository = new CandidateRepository();
const projectionEngine = new ProjectionEngine();

async function uploadAndProcess(req, res, next) {
  try {
    const configFile = req.files?.configFile?.[0];
    const processed = await pipeline.process(req.files || {}, configFile);
    await repository.save(processed);
    res.status(201).json(processed);
  } catch (error) {
    next(error);
  }
}

async function getCandidate(req, res, next) {
  try {
    const candidate = await repository.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    return res.json(candidate);
  } catch (error) {
    return next(error);
  }
}

async function getAllCandidates(req, res, next) {
  try {
    const candidates = await repository.findAll();
    res.json({ candidates });
  } catch (error) {
    next(error);
  }
}

async function rerunProjection(req, res, next) {
  try {
    const candidate = await repository.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const validation = validateWithSchema(projectionConfigSchema, req.body.config || {});
    if (!validation.ok) return res.status(400).json({ validation: { projectionConfig: false, errors: validation.errors } });

    const projection = projectionEngine.project(candidate.canonical_profile, validation.data);
    if (projection.errors.length) return res.status(422).json({ projectedProfile: projection.output, errors: projection.errors });

    await repository.appendProjection(req.params.id, projection.output);
    return res.json({ projectedProfile: projection.output });
  } catch (error) {
    return next(error);
  }
}

module.exports = { uploadAndProcess, getCandidate, getAllCandidates, rerunProjection };
