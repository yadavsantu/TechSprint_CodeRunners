const express = require("express");
const accidentValidation = require("../middlewares/accidentValidation");
const { createAccidentController } = require("../controllers/accidentController");
const adminAccidentController = require("../controllers/adminAccidentController");
const updateAccidentStatusController = require("../controllers/updateAccidentController");
const accidentRouter = express.Router();

accidentRouter.post("/report", accidentValidation, createAccidentController);
accidentRouter.get("/accidents", adminAccidentController);
accidentRouter.patch("/accidents/:id/status", updateAccidentStatusController);

module.exports = accidentRouter;