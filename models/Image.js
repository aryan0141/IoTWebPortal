const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    image: [
        {
            geolocation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'geolocations',
                required: true
            },
            name: {
                type: String,
                required: true
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

const Image = mongoose.model('image', ImageSchema);

module.exports = Image;