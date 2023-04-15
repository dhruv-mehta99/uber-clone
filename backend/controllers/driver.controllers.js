const { validationResult } = require("express-validator");

const HttpError = require("../Exceptions/http-error");
const ride = require("../models/ride");
const driver = require("../models/driver");
const ControllerException = require("../Exceptions/ControllerException");
const DataNotFoundException = require("../Exceptions/DataNotFoundException");
const DriverService = require("../services/driver");

const driverHealthCheck = function (data) {
    console.log("Driver " + data, " is active");
}

// Used to assign a driver to the ride when driver accepts the request
const getDriverDetails = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }
    const driverId = req.authorizer_context.driver_id;

    try {
        let result = await DriverService.getDriver(driverId)
        res.json({ data: result });
    } catch (error) {
        next(error);
    }

}

// Used to assign a driver to the ride when driver accepts the request
const acceptRide = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }

    const rideId = req.params.ride_id;
    const driverId = req.authorizer_context.driver_id;

    try {
        let result = await DriverService.acceptRide(rideId, driverId)
        res.json({ data: result });
    } catch (error) {
        next(error);
    }

}

// Used to assign a driver to the ride when driver accepts the request
const rejectRide = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }

    const rideId = req.params.ride_id;
    const driverId = req.authorizer_context.driver_id;

    try {
        let result = await DriverService.rejectRide(rideId, driverId)
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
}

const startRide = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }

    const rideId = req.params.ride_id;
    const driverId = req.authorizer_context.driver_id;

    try {
        let result = await DriverService.startRide(rideId, driverId)
        res.json({ data: result });
    } catch (error) {
        next(error);
    }

}

const completeRide = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }

    const rideId = req.params.ride_id;
    const driverId = req.authorizer_context.driver_id;

    try {
        let result = await DriverService.completeRide(rideId, driverId)
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
}

// To signup/login a driver
const authorize = async (req, res, next) => {

    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }

    let driverFound;
    let email = req.authorizer_context.email
    try {
        driverFound = await DriverService.getDriverByEmailId(email);
    } catch (err) {
        if (err instanceof DataNotFoundException) {
            // create new driver

            driverFound = new driver({
                name: req.authorizer_context.name,
                email: req.authorizer_context.email,
                accepted_rides: [],
                rejected_rides: [],
                completed_rides: [],
                ongoing_ride: null
            });
            try {
                driverFound.save()
            } catch (err) {
                console.log(err)
                next(new HttpError("failed to create new driver", 500))
            }
        } else {
            console.log(err);
            return next(new ControllerException('Failed to check driver recored', 500));
        }

    }

    let token = await DriverService.authorize(req.query.request_token, driverFound)

    res.json({ data: { access_token: token } });
}

/////////////////////////////////////////////////////// PATCH Requets ////////////////////////////////////////////////////////////////////

exports.getDriverDetails = getDriverDetails;
exports.authorize = authorize;
exports.acceptRide = acceptRide;
exports.rejectRide = rejectRide;
exports.startRide = startRide;
exports.completeRide = completeRide;
exports.driverHealthCheck = driverHealthCheck