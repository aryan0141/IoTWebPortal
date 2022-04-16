const mongoose = require("mongoose");

const UnusedSensorsSchema = new mongoose.Schema({
  microControllerID: {
    type: String,
    required: true,
  },
  sensorId: {
    type: String,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("unusedSensors", UnusedSensorsSchema);
