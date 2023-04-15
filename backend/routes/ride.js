const express = require('express');
const router = express.Router();

const rideControllers = require("../controllers/ride");

//  jwt token for Authentication Middleware 
const isAuth = require('../middlewares/DriverAuthorizer');

// Signing up a patient

router.use(isAuth);

// Post new ride in db
router.post("/create", rideControllers.postNewRide);

module.exports = router;