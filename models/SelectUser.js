const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const selectUserSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('selectuser', selectUserSchema);