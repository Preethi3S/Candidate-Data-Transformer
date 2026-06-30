const express = require("express");
const { signup, signin, me, logout } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

module.exports = router;
