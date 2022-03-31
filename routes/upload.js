const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const ImageSchema = require("../models/Image");
const mongoose = require("mongoose");
const auth = require("../config/auth");
const GeoLocationSchema = require("../models/GeoLocations");

const storage = multer.diskStorage({
    destination: 'public/uploads',
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },  // 5mb
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).fields([{
    name: "img",
    maxCount: 1
}
]);



// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|png|jpg/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only jpeg/png/jpg images applicable');
    }
}


//Post an image
router.post('/uploadSensorImage', auth, async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.json({
                msg: err
            });
        } else {
            if (req.files === undefined) {
                return res.json({
                    msg: 'Error: No File Selected!'
                });
            } else {
                let all_files = [];
                for (const key in req.files) {
                    all_files.push({ name: req.files[key][0].path.slice(7) });
                }

                try {
                    const findUserFromGeolocation = await GeoLocationSchema.findById(req.body.geolocation);
                    let mainUser;
                    if (findUserFromGeolocation.user.toString() === req.user._id.toString()) {
                        mainUser = req.user._id;
                    }
                    else {
                        mainUser = findUserFromGeolocation.user.toString();
                    }

                    const findUser = await ImageSchema.findOne({ user: mainUser });

                    if (findUser && findUser.image) {
                        const newData = {
                            name: all_files[0].name,
                            geolocation: req.body.geolocation
                        }
                        findUser.image.unshift(newData);
                        await findUser.save();
                        return res.status(200).redirect('/dashboard');
                    }
                    const data = new ImageSchema({
                        user: req.user._id,
                        image: {
                            name: all_files[0].name,
                            geolocation: req.body.geolocation
                        }
                    })
                    await data.save();
                    return res.status(200).redirect('/dashboard');

                } catch (err) {
                    console.log(err)
                    return res.status(500).json({ msg: 'Internal Server Error' });
                }
            }
        }
    });
});

// Get the image using geolocation
router.post('/getImageUsingGeolocation', auth, async (req, res) => {
    try {
        const findUser = await ImageSchema.findOne({ user: req.body.user });
        if (!findUser) {
            return res.status(400).json({ msg: 'User not found...', status: 400 });
        }
        if (findUser.image.length == 0) {
            return res.status(400).json({ msg: 'Image not found...', status: 400 })
        }
        const geolocation = findUser.image.filter(elm => elm.geolocation.toString() === req.body.geolocation);
        // console.log(geolocation);
        return res.status(200).json(geolocation);

    } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})


module.exports = router;