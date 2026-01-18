const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Ambulance = require("../model/ambulanceModel");

exports.ambulanceLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email and password are required",
        data: null,
      });
    }

    const ambulance = await Ambulance.findOne({ email });

    if (!ambulance) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid credentials",
        data: null,
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      ambulance.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid credentials",
        data: null,
      });
    }

    const token = jwt.sign(
      { id: ambulance._id, role: "driver" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ INCLUDE STATUS & ID
    return res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      data: {
        _id: ambulance._id,
        ambulanceName: ambulance.name,
        phoneNumber: ambulance.phone,
        location: {
          latitude: ambulance.location?.coordinates[1],
          longitude: ambulance.location?.coordinates[0],
        },
        status: ambulance.status, // 🔥 REQUIRED
        role: "driver",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

