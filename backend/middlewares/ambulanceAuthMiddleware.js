// middleware/auth.js
const jwt = require("jsonwebtoken");
const Ambulance = require("../model/ambulanceModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // cookie should have JWT
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use decoded.id instead of decoded.ambulanceId
    const ambulance = await Ambulance.findById(decoded.id);

    if (!ambulance)
      return res.status(404).json({ message: "Ambulance not found" });

    req.user = ambulance;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
