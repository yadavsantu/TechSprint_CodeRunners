const axios = require("axios");
const Accident = require("../model/accidentSchema");
const { handleAccidentAccepted } = require("./accident-accept.service");
const mlConfig = require("../config/system.config");

/**
 * Classify an accident image using ML server
 * @param {string} accidentId - MongoDB accident ID
 * @returns {Promise<void>}
 */
exports.classifyAccident = async (accidentId) => {
  // Check if ML is enabled
  if (!mlConfig.ML_ENABLED) {
    console.log("ML classification is disabled");
    return;
  }

  console.log("ML classifyAccident called for ID:", accidentId);
  
  try {
    const accident = await Accident.findById(accidentId);
    if (!accident) {
      console.error(`Accident not found: ${accidentId}`);
      return;
    }

    if (!accident.images || accident.images.length === 0) {
      console.log(`No images found for accident ${accidentId}`);
      return;
    }

    const imageUrl = accident.images[0].url;
    console.log("Accident found, sending image to ML:", imageUrl);

    // Call ML server with timeout
    const response = await axios.post(
      `${mlConfig.ML_SERVER_URL}/predict`,
      { image_url: imageUrl },
      {
        timeout: mlConfig.ML_TIMEOUT,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const prediction = response.data.prediction;
    const confidence = response.data.confidence || 0;
    
    console.log(`ML prediction: ${prediction} (confidence: ${confidence})`);

    // Update accident status based on prediction
    if (prediction === "accident") {
      accident.status = "verified";
      accident.mlConfidence = confidence; // Store confidence score
      await accident.save();
      console.log(`Accident ${accidentId} → VERIFIED (confidence: ${confidence})`);
      await handleAccidentAccepted(accident);
    } else {
      accident.status = "rejected";
      accident.mlConfidence = confidence;
      await accident.save();
      console.log(`Accident ${accidentId} → REJECTED (confidence: ${confidence})`);
    }
  } catch (err) {
    // Handle different types of errors
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      console.error(`ML server connection error: ${err.message}`);
      console.error(`Make sure ML server is running at ${mlConfig.ML_SERVER_URL}`);
    } else if (err.response) {
      console.error(`ML server error: ${err.response.status} - ${err.response.data}`);
    } else {
      console.error("ML classification error:", err.message);
    }
    
    // Optionally: Set accident status to pending if ML fails
    // Uncomment if you want to handle ML failures gracefully
    // try {
    //   const accident = await Accident.findById(accidentId);
    //   if (accident) {
    //     accident.status = "pending";
    //     await accident.save();
    //   }
    // } catch (dbErr) {
    //   console.error("Failed to update accident status:", dbErr.message);
    // }
  }
};