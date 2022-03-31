const express = require("express");
const route = express.Router();
const auth = require("../config/auth");
const ImageSchema = require("../models/Image");

// Login Page 
route.get('/login', auth, (req, res) => {
  console
  if (!req.user) {
    return res.render('User/login.ejs')
  }
  return res.redirect('/dashboard');
})

// Register Page 
route.get('/register', auth, (req, res) => {
  if (!req.user) {
    return res.render('User/signup.ejs')
  }
  return res.redirect('/dashboard');
})

// Add Geolocation Page
route.get('/addGeolocation', auth, async (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }
  return res.status(200).render('Geolocation.ejs');
})

// Sensor Verification Page
route.get('/sensorVerification', auth, async (req, res) => {
  if (!req.user || req.user.type != "admin") {
    return res.redirect('/login')
  }
  return res.status(200).render('sensorVerification.ejs');
})


// Dashboard Page
route.get("/dashboard", auth, async (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }
  // return res.status(200).render('dashboard.ejs');
  // return res.redirect('/dashboard');
  try {
    const myDashboardData = await ImageSchema.findOne({ user: req.user._id }).select('-user');
    if (myDashboardData) {
      return res.status(200).render("dashboard.ejs", {
        images: myDashboardData.image
      });
    }
    return res.status(200).render("dashboard.ejs", {
      images: null
    });
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: 'Internal Server Error' });
  }

});

module.exports = route;
