const express = require("express");
const accidentValidation = require("../middlewares/accidentValidation");
const { createAccidentController } = require("../controllers/accidentController");
const adminAccidentController = require("../controllers/adminAccidentController");
const updateAccidentStatusController = require("../controllers/updateAccidentController");
const authOptional = require("../middlewares/authOptional");
const { getMyAccidentReports } = require("../controllers/fetchReportByUsers");
const { ML_ENABLED } = require("../config/system.config");
const mlAccidentController = require("../controllers/mlAccidentController");

const accidentRouter = express.Router();

/* ======================
   ALWAYS ENABLED ROUTES
====================== */
accidentRouter.get("/accidents", adminAccidentController);
accidentRouter.get("/my-reports", authOptional, getMyAccidentReports);

/* ======================
   CONDITIONAL ROUTES
   ML_ENABLED = true  -> DISABLED
   ML_ENABLED = false -> ENABLED
====================== */
if (!ML_ENABLED) {
  accidentRouter.post(
    "/report",
    authOptional,
    accidentValidation,
    createAccidentController
  );

  accidentRouter.patch(
    "/accidents/:id/status",
    updateAccidentStatusController
  );

  console.log("✅ Accident routes ENABLED (ML OFF)");
} else {

    accidentRouter.post(
    "/report",
    authOptional,
    accidentValidation,
    mlAccidentController.createAccidentController
  );
  console.log("⛔ Accident routes DISABLED (ML ON)");
}


module.exports = accidentRouter;