const express = require("express");
const multer = require("multer");
const {
  uploadAndProcess,
  getCandidate,
  getAllCandidates,
  rerunProjection
} = require("../controllers/profileController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

router.post(
  "/upload",
  upload.fields([
    { name: "csvFile", maxCount: 1 },
    { name: "resumeFile", maxCount: 1 },
    { name: "configFile", maxCount: 1 }
  ]),
  uploadAndProcess
);

router.get("/profiles", getAllCandidates);
router.get("/profile/:id", getCandidate);
router.post("/profile/:id/project", rerunProjection);

module.exports = router;
