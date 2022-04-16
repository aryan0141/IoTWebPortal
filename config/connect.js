require('dotenv').config();
const mongoose = require("mongoose");

  // "MongoURI": "mongodb://127.0.0.1:27017/IotWebPortal"

const DbConnect = async () => {
  try {
    await mongoose.connect(process.env.MongoURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    console.log("DB Connected");
  } catch (err) {
    console.log(err.message);

    // Exit Process with Failure
    process.exit(1);
  }
};

module.exports = DbConnect;
