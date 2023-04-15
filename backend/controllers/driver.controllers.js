const { validationResult } = require("express-validator");

const HttpError = require("../Exceptions/http-error");
const ride = require("../models/ride");
const driver = require("../models/driver");
const ControllerException = require("../Exceptions/ControllerException");
const DataNotFoundException = require("../Exceptions/DataNotFoundException");
const DriverService = require("../services/driver");

// To get the whole list of rides of a perticular driver
const getRides = async (req, res, next) => {
    const driverId = req.params.driverId;

    let driverFound;
    try {
        driverFound = await driver.findById(driverId).populate('rideIds');
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if (!driverFound) {
        return next(new HttpError('driver not found', 500));
    }

    var rides = [];

    if (driverFound.rides.length > 0) {
        for (let index = 0; index < driverFound.rideIds.length; index++) {
            if (driverFound.rides[index].consulted) {
                if (driverFound.rides[index].active) {
                    let rideReports;
                    try {
                        rideReports = await ride.findById(driverFound.rideIds[index].id).populate('reports').populate('prescribedMedicines');
                    } catch (err) {
                        console.log(err);
                        return next(new HttpError('Something went wrong', 500));
                    }
                    rides.push({
                        id: rideReports.id,
                        name: rideReports.name,
                        email: rideReports.email,
                        phoneNo: rideReports.phoneNo,
                        address: rideReports.address,
                        age: rideReports.age,
                        active: true,
                        currentMedicines: rideReports.currentMedicines,
                        symptoms: rideReports.symptoms,
                        reports: rideReports.reports,
                        prescribedMedicines: rideReports.prescribedMedicines,
                        startDate: driverFound.rides[index].startDate
                    });
                }
                else {
                    rides.push({
                        id: driverFound.rideIds[index].id,
                        name: driverFound.rideIds[index].name,
                        email: driverFound.rideIds[index].email,
                        phoneNo: driverFound.rideIds[index].phoneNo,
                        address: driverFound.rideIds[index].address,
                        active: false,
                        startDate: driverFound.rides[index].startDate
                    });
                }
                if (index === driverFound.rideIds.length - 1) {
                    res.json({ rides });
                }
            }
            else {
                res.json({ rides });
            }
        }
    } else {
        res.json({ rides });
    }
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
// To signup a driver
const authorize = async (req, res, next) => {

    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }

    let driver;
    let email = req.authorizer_context.email
    try {
        driver = await DriverService.getDriverByEmailId(email);
    } catch (err) {
        if (err instanceof DataNotFoundException) {
            // create new driver

            driver = new driver({
                name: req.authorizer_context.name,
                email: req.authorizer_context.email,
                accepted_rides: [],
                rejected_rides: [],
                completed_rides: [],
                ongoing_ride: null
            });
            try {
                driver.save()
            } catch (err) {
                console.log(err)
                next(new HttpError("failed to create new driver", 500))
            }
        }
        console.log(err);
        return next(new ControllerException('Failed to check driver recored', 500));
    }

    let token = await DriverService.authorize(req.query.request_token, driver)

    res.json({ data: { access_token: token } });
}

/////////////////////////////////////////////////////// PATCH Requets ////////////////////////////////////////////////////////////////////

exports.getDriverDetails = getDriverDetails;
exports.authorize = authorize;
exports.getrides = getRides;
exports.acceptRide = acceptRide;
exports.rejectRide = rejectRide;
exports.startRide = startRide;
exports.completeRide = completeRide;