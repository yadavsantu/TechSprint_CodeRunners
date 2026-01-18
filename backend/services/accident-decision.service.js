const axios = require("axios");
const Accident = require("../model/accidentSchema");
const { handleAccidentAccepted } = require("./accident-accept.service");
const { ML_ENABLED } = require("../config/ml.config");

exports.decideAccident = async (accidentId, adminStatus = null) => {
  const accident = await Accident.findById(accidentId);
  if (!accident) throw new Error("Accident not found");

  // 🚫 Prevent double decision
  if (accident.status !== "reported") {
    return;
  }

  // =========================
  // ML MODE (FINAL)
  // =========================
  if (ML_ENABLED) {
    if (!accident.images?.length) return;

    const imageUrl = accident.images[0].url;

    const response = await axios.post(
      "http://localhost:8000/predict",
      { image_url: imageUrl }
    );

    const prediction = response.data.prediction;

    if (prediction === "accident") {
      accident.status = "verified";
      await accident.save();
      await handleAccidentAccepted(accident);
    } else {
      accident.status = "rejected";
      await accident.save();
    }

    return;
  }

  // =========================
  // ADMIN MODE (FINAL)
  // =========================
  if (!["verified", "rejected"].includes(adminStatus)) {
    throw new Error("Invalid admin status");
  }

  accident.status = adminStatus;
  await accident.save();

  if (adminStatus === "verified") {
    await handleAccidentAccepted(accident);
  }
};