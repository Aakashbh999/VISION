const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");

router.get("/programs", programController.getPrograms);

module.exports = router;
