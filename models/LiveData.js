const mongoose = require("mongoose");

const LiveDataSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
  },
  data: [
    {
      time: {
        type: String,
        required: true,
      },
      data: {
        type: String,
        required: true,
      },
    },
  ],
  lastEmailSent: {
    type: Date,
    default: new Date(2018, 15, 24, 10, 33, 30)
  }
});

module.exports = mongoose.model("livedata", LiveDataSchema);
