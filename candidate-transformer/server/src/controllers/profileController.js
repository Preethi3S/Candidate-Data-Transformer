const fs = require("fs");
const path = require("path");
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
    const previousCandidates = await repository.findAll();
    const processed = await pipeline.process(req.files || {}, configFile, { previousCandidates, body: req.body || {} });
    await repository.save(processed);
    res.status(201).json(processed);
  } catch (error) {
    next(error);
  }
}

async function processDemoDataset(req, res, next) {
  try {
    const sampleRoot = path.resolve(__dirname, "../../../sample-data");
    const files = {
      csvFile: [{ originalname: "recruiter-export.csv", buffer: fs.readFileSync(path.join(sampleRoot, "recruiter-export.csv")) }],
      resumeFile: [{ originalname: "resume-sample.txt", buffer: fs.readFileSync(path.join(sampleRoot, "resume-sample.txt")) }]
    };
    const configFile = { originalname: "projection-config.json", buffer: fs.readFileSync(path.join(sampleRoot, "projection-config.json")) };
    const previousCandidates = await repository.findAll();
    const processed = await pipeline.process(files, configFile, { previousCandidates });
    await repository.save(processed);
    return res.status(201).json(processed);
  } catch (error) {
    return next(error);
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

module.exports = { uploadAndProcess, processDemoDataset, getCandidate, getAllCandidates, rerunProjection };
