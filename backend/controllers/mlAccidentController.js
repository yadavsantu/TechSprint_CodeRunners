const Accident = require("../model/accidentSchema");
const axios = require("axios");

const ML_SERVER_URL = "http://127.0.0.1:8000/predict";

const createAccidentController = async (req, res, next) => {
  console.log("createAccidentController called");
  console.log("User token:", req.cookies?.token);

  try {
    const { phoneNumber, description, location, images } = req.validatedBody;

    // 1️⃣ Create accident in DB first
    const accident = await Accident.create({
      phoneNumber,
      description,
      location,
      images,
      reportedBy: req.user ? req.user._id : null,
    });

    // 2️⃣ Default status before ML
    let status = accident.status || "pending";

    // 3️⃣ Call ML if valid image exists
    if (
      images &&
      Array.isArray(images) &&
      images.length > 0 &&
      images[0]?.url
    ) {
      const imageUrl = images[0].url;

      console.log("Sending to ML server:", { image_url: imageUrl });

      try {
        const mlResponse = await axios.post(
          ML_SERVER_URL,
          { image_url: imageUrl },
          { timeout: 5000 }
        );

        const { prediction, confidence } = mlResponse.data;
        console.log("ML server response:", prediction, confidence);

        // 4️⃣ Automate admin verification logic
        if (prediction === "accident" && confidence > 0.8) {
          status = "verified";

          // Emit socket event immediately like admin would
          if (global.io) {
            const zoneRoom = `zone-${accident.zoneId || "default"}`;
            global.io.to(zoneRoom).emit("new-emergency", {
              accidentId: accident._id,
              title: "New Accident",
              description: accident.description,
              location: accident.location,
              time: accident.createdAt,
            });
            console.log("Emitted new-emergency to", zoneRoom);
          }
        } else {
          status = "rejected";
        }

        // 5️⃣ Update accident status in DB
        await Accident.findByIdAndUpdate(accident._id, { status }, { new: true });
      } catch (mlError) {
        console.error("ML server error:", mlError.message);
        // If ML fails, leave status as pending
      }
    }

    // 6️⃣ Respond immediately
    return res.status(201).json({
      statusCode: 201,
      message:
        status === "verified"
          ? "Accident automatically verified by ML"
          : status === "rejected"
          ? "Accident automatically rejected by ML"
          : "Accident reported (pending ML verification)",
      data: {
        id: accident._id,
        status,
        reportedBy: accident.reportedBy,
        createdAt: accident.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAccidentController };
