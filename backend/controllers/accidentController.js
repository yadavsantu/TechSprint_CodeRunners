const Accident = require("../model/accidentSchema");
const { classifyAccident } = require("../services/mlServices");

const createAccidentController = async (req, res, next) => {
  const token = req.cookies.token;
  console.log(token)
  try {
    const { phoneNumber, description, location, images } = req.validatedBody;

    const accident = await Accident.create({
      phoneNumber,
      description,
      location,
      images, // already defaulted by Joi
      reportedBy: req.user ? req.user._id : null, // ✅ cookie-based auth
    });

    // Trigger ML classification asynchronously (non-blocking)
    // This runs in the background and doesn't delay the response
    if (images && images.length > 0) {
      classifyAccident(accident._id.toString()).catch((err) => {
        console.error("Background ML classification failed:", err.message);
      });
    }

    return res.status(201).json({
      statusCode: 201,
      message: "Accident reported successfully",
      data: {
        id: accident._id,
        status: accident.status,
        reportedBy: accident.reportedBy,
        createdAt: accident.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccidentController,
};
