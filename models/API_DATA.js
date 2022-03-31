const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const data = new Schema({
  id: {
    type: String,
    required: true
  },
  location: {
    type: Array,
    required: true
  },
  time_of_reading: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("API_DATA", data);
