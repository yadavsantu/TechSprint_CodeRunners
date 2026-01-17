const mongoose = require("mongoose");

const accidentSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String, 
      minlength: 10,
      maxlength: 1000,
    },

    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
      source: {
        type: String,
        enum: ["gps", "manual"],
        default: "gps",
      },
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        format: {
          type: String,
          enum: ["jpg", "jpeg", "png", "webp", "mp4"],
        },
      },
    ],

    status: {
      type: String,
      enum: ["reported", "in-progress", "resolved"],
      default: "reported",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accident", accidentSchema);
