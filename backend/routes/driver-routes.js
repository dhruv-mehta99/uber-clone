const express = require('express');
const router = express.Router();
const { check } = require("express-validator");
const isAuth = require('../middlewares/DriverAuthorizer');
const driverControllers = require("../controllers/driver.controllers");
const { rideIdValidation } = require("../models/driverValidation");
const OauthAuthorizer = require('../middlewares/OauthAuthorizer');

// // driver Signup 
// router.post("/signup",
//     [
//         check("name").not().isEmpty(),
//         check("email").isEmail(),
//         check("password").not().isEmpty()
//     ], driverControllers.signup);

// // driver login
// router.post("/login",
//     [
//         check("email").isEmail(),
//         check("password").not().isEmpty(),
//         check('accessKey').not().isEmpty()
//     ]
//     , driverControllers.login);

// driver google oauth login
router.post("/oauth/google/authorize",
    OauthAuthorizer
    , driverControllers.authorize);

router.use(isAuth);

router.get("/details", [], driverControllers.getDriverDetails);

// To get the whole list of patients for a specific driver 
router.patch("/ride/:ride_id/accept", [rideIdValidation()], driverControllers.acceptRide);

router.patch("/ride/:ride_id/reject", [rideIdValidation()], driverControllers.rejectRide);

router.patch("/ride/:ride_id/start", [rideIdValidation()], driverControllers.startRide);

router.patch("/ride/:ride_id/complete", [rideIdValidation()], driverControllers.completeRide);


module.exports = router;