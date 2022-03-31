const router = require("express").Router();
const Geolocation = require("../models/GeoLocations");
const Image = require("../models/Image");
const auth = require("../config/auth");
const Sensor = require("../models/Sensor");
const fs = require("fs");

// Add new geolocation
router.post('/addGeolocation', auth, async (req, res) => {
    try {
        const { name, location, latitude, longitude } = req.body;
        const NewGeoLocation = new Geolocation({
            user: req.user._id,
            name,
            location,
            latitude,
            longitude
        })

        await NewGeoLocation.save();
        return res.status(201).json({ NewGeoLocation, status: 201 });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

// Get geolocations by user id
router.post('/getGeolocations', auth, async (req, res) => {
    try {
        if (req.user.type == "admin") {
            const allGeoLocations = await Geolocation.find();
            if (allGeoLocations.length == 0) {
                return res.status(200).json({ msg: 'No geolocation found', status: 404 });
            }
            return res.status(200).json({ allGeoLocations, status: 200 });
        }
        else if (req.user.type == "orghead") {
            const allGeoLocations = await Geolocation.find({ user: req.user._id });
            if (allGeoLocations.length == 0) {
                return res.status(200).json({ msg: 'No geolocation found', status: 404 });
            }
            return res.status(200).json({ allGeoLocations, status: 200 });
        }
        else {
            const allGeoLocations = await Geolocation.find({ user: req.body.parent });
            if (allGeoLocations.length == 0) {
                return res.status(200).json({ msg: 'No geolocation found', status: 404 });
            }
            return res.status(200).json({ allGeoLocations, status: 200 });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

// Get Geolocation user by geolocation id
router.post('/getUserIdbyGeoId', auth, async (req, res) => {
    try {
        const user = await Geolocation.findById(req.body.id);
        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

// Get All Geolocations
router.get('/getAllGeolocations', async (req, res) => {
    try {
        const details = await Geolocation.find();
        return res.status(200).json(details);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})

// Delete geolocation and delete image,sensor and Live data
router.delete('/deleteGeolocation', auth, async (req, res) => {
    const { geoId, user } = req.body;
    try {
        // Delete Geolocation
        await Geolocation.deleteOne({ user: user, _id: geoId });
        // Delete Image for that geolocation
        // const findUserFromImage = await Image.findOne({ user });
        // if (findUserFromImage) {
        //     const ImageArray = findUserFromImage.image;
        //     const index = ImageArray.find(data => data.geolocation.toString() === geoId);
        //     // console.log("Index: ", index);
        //     if(index != undefined) {
        //         // fs.unlinkSync((findUserFromImage.image)[index].name);
        //         findUserFromImage.image.splice(index, 1);
        //         await findUserFromImage.save();
        //     }
        // }
        // let sensorIdArr = [];
        // // Delete all Sensors For that Geolocation marked on Image
        // const findUserFromSensor = await Sensor.findOne({ user });
        // if (findUserFromSensor) {
        //     const index1 = findUserFromSensor.sensor.find(data => data.geolocation.toString() === geoId);
        //     if (index1!=undefined) {
        //         let obj = findUserFromSensor.sensor[index1];
        //         obj.data.forEach(a => {
        //             a.sensorDetail.forEach(b => {
        //                 sensorIdArr.push(b["sensorId"]);
        //             })
        //         });
        //     }
        //     findUserFromSensor.sensor.splice(index1, 1);
        //     await findUserFromImage.save();
        // }
        // // Delete data from LiveData
        // sensorIdArr.forEach(async elm => {
        //     await LiveData.deleteOne({ sensorId: elm })
        // })


        return res.status(200).json({ msg: 'Geolocation deleted' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})


module.exports = router;