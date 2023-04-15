const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const HttpError = require("../Exceptions/http-error");
const RideService = require("./ride");
const driver = require("../models/driver");

const ControllerException = require("../Exceptions/ControllerException");
const LifecycleException = require("../Exceptions/LifecycleException");
const DataNotFoundException = require("../Exceptions/DataNotFoundException");
const ServiceException = require("../Exceptions/ServiceException");
const { RIDE_STATUS } = require("../utils/constants");


// To get the whole list of rides of a perticular driver
const getRides = async (req, res, next) => {
    const driverId = req.params.driverId;

    let driver;
    try {
        driver = await driver.findById(driverId).populate('rideIds');
    } catch (err) {
        console.log(err);
        return next(new HttpError('Something went wrong', 500));
    }
    if (!driver) {
        return next(new HttpError('driver not found', 500));
    }

    var rides = [];

    if (driver.rides.length > 0) {
        for (let index = 0; index < driver.rideIds.length; index++) {
            if (driver.rides[index].consulted) {
                if (driver.rides[index].active) {
                    let rideReports;
                    try {
                        rideReports = await ride.findById(driver.rideIds[index].id).populate('reports').populate('prescribedMedicines');
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
                        startDate: driver.rides[index].startDate
                    });
                }
                else {
                    rides.push({
                        id: driver.rideIds[index].id,
                        name: driver.rideIds[index].name,
                        email: driver.rideIds[index].email,
                        phoneNo: driver.rideIds[index].phoneNo,
                        address: driver.rideIds[index].address,
                        active: false,
                        startDate: driver.rides[index].startDate
                    });
                }
                if (index === driver.rideIds.length - 1) {
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
const acceptRide = async (rideId, driverId) => {

    let ride;
    let driver;
    //validate ride before accepting
    try {
        rideId = mongoose.Types.ObjectId(rideId)
        ride = await RideService.getride(rideId);

        if (ride.status != RIDE_STATUS.requested) {
            throw new LifecycleException('cannot accept an already accepted ride', 500);
        }

    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch ride details', 500);
    }

    //validate driver details
    try {
        driverId = mongoose.Types.ObjectId(driverId)
        driver = await this.getDriver(driverId);

        if (driver.rejected_rides.includes(rideId)) {
            throw new LifecycleException('Cannot accept an already rejected ride', 500);
        }
    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch driver details', 500);
    }

    driver.accepted_rides.push(rideId)
    ride.driver_id = driverId
    ride.status = RIDE_STATUS.accepted
    try {
        await ride.save();
        await driver.save();
    } catch (err) {
        console.log(err);
        throw new ServiceException('Unable to accept ride', 500);
    }

    return ride.toObject();
}

// Used to assign a driver to the ride when driver accepts the request
const rejectRide = async (rideId, driverId) => {

    let ride;
    let driver;
    try {
        rideId = mongoose.Types.ObjectId(rideId)
        ride = await RideService.getride(rideId);

        if (ride.status == RIDE_STATUS.accepted || ride.status == RIDE_STATUS.completed || ride.status == RIDE_STATUS.started) {
            throw new LifecycleException('cannot reject an already accepted or ongoing ride', 500);
        }
        

    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch ride details', 500);
    }

    //validate driver details
    try {
        driverId = mongoose.Types.ObjectId(driverId)
        driver = await this.getDriver(driverId);

        if (driver.accepted_rides.includes(rideId) || driver.completed_rides.includes(rideId) || (driver.ongoing_ride && driver.ongoing_ride.equals(rideId))) {
            throw new LifecycleException('Cannot reject an already accepted or ongoing ride', 500);
        }

        if (driver.rejected_rides.includes(rideId)) {
            throw new LifecycleException('Cannot reject an already rejected ride', 500);
        }

    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch driver details', 500);
    }

    driver.rejected_rides.push(rideId)
    try {
        await driver.save();
    } catch (err) {
        console.log(err);
        throw new ServiceException('Unable to rejcet ride', 500);
    }

    return { message: "Ride rejected successfully" };
}

const startRide = async (rideId, driverId) => {
    let ride;
    let driver;

    //validate ride before starting
    try {
        rideId = mongoose.Types.ObjectId(rideId)
        ride = await RideService.getride(rideId);

        if (ride.status != RIDE_STATUS.accepted) {
            throw new LifecycleException('cannot start an already completed or rejected ride', 500);
        }

        // to prevent a brut force attact do not confrim if one of ride or drive exist or not exist
        if (ride.driver_id != driverId) {
            throw new DataNotFoundException('ride or driver not found', 500);
        }

    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch ride details', 500);
    }

    //validate driver details
    try {
        driverId = mongoose.Types.ObjectId(driverId)
        driver = await this.getDriver(driverId);

        if (driver.rejected_rides.includes(rideId) || driver.completed_rides.includes(rideId) || (driver.ongoing_ride && driver.ongoing_ride.equals(rideId))) {
            throw new LifecycleException('Cannot start an start rejected or ongoing ride', 500);
        }

    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch driver details', 500);
    }

    driver.ongoing_ride = rideId
    ride.status = RIDE_STATUS.started
    try {
        await ride.save();
        await driver.save();
    } catch (err) {
        console.log(err);
        throw new ControllerException('Unable to start ride', 500);
    }

    return ride.toObject();
}

const completeRide = async (rideId, driverId) => {

    let ride;
    let driver;
    //validate ride before starting
    try {
        rideId = mongoose.Types.ObjectId(rideId)
        ride = await RideService.getride(rideId);

        if (ride.status != RIDE_STATUS.started) {
            throw new LifecycleException('cannot complete a not started or completed ride', 500);
        }

        // to prevent a brut force attact do not confrim if one of ride or drive exist or not exist
        if (ride.driver_id != driverId) {
            return next(new DataNotFoundException('ride or driver not found', 500));
        }

    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch ride details', 500);
    }

    //validate driver details
    try {
        driverId = mongoose.Types.ObjectId(driverId)
        driver = await this.getDriver(driverId);

        if (driver.rejected_rides.includes(rideId) || driver.completed_rides.includes(rideId) || !(driver.ongoing_ride && driver.ongoing_ride.equals(rideId))) {
            throw new LifecycleException('cannot complete an already completed or rejected ride', 500);
        }

    } catch (err) {
        if (err instanceof DataNotFoundException || err instanceof LifecycleException) {
            throw err
        }
        console.error("Exception: " + err);
        throw new ServiceException('failed to fetch driver details', 500);
    }

    driver.ongoing_ride = null;
    driver.completed_rides.push(rideId);

    let deletionIndex = driver.accepted_rides.indexOf(rideId);
    if (deletionIndex !== -1) {
        driver.accepted_rides.splice(deletionIndex, 1);
    }
    ride.status = RIDE_STATUS.completed
    try {
        await ride.save();
        await driver.save();
    } catch (err) {
        console.log(err);
        throw new ServiceException('Unable to complete ride', 500);
    }

    return ride.toObject();
}

// To authorize a driver
const authorize = (oauthToken, driver) => {

    let decodedToken = jwt.decode(oauthToken);
    let email = decodedToken.email

    let claims = {
        oauth_token: oauthToken,
        intent: "ACCESS_TOKEN",
        oauth_user_id: decodedToken.sub,
        driver_id: driver._id
    }

    let authToken = jwt.sign(claims, Buffer.from("qwerty123456", 'base64'), { subject: email, issuer: "driver-app.uberclone.com", audience: "DRIVER", algorithm: 'HS512', expiresIn: '24h' });

    return authToken
}

const postDriver = async (driver) => {

    let password = driver.password;
    const salt = await bcrypt.genSalt();
    driver.password = await bcrypt.hash(password, salt);

    try {
        await newdriver.save();
    } catch (err) {
        console.log(err);
        throw new ServiceException('Failed to post driver', 500);
    }

    return driver;
}

const getDriver = async (driverId) => {
    try {
        driverId = mongoose.Types.ObjectId(driverId)
        let driverFound = await driver.findById(driverId);

        if (!driverFound) {
            throw new DataNotFoundException("Driver not found: " + driverId, 500)
        }
        return driverFound
    } catch (err) {
        if (error instanceof DataNotFoundException) {
            throw error
        }
        console.log(err);
        throw new HttpError('Something went wrong', 500);
    }
}

const getDriverByEmailId = async (email) => {
    try {
        let driverFound = await driver.findOne({ email: email });

        if (!driverFound) {
            throw new DataNotFoundException("Driver not found: " + email, 500)
        }
        return driverFound
    } catch (err) {
        if (err instanceof DataNotFoundException) {
            throw err
        }
        console.log(err);
        throw new HttpError('Something went wrong', 500);
    }
}


exports.postDriver = postDriver;
exports.authorize = authorize;
exports.getDriver = getDriver;
exports.getDriverByEmailId = getDriverByEmailId;
exports.getrides = getRides;
exports.acceptRide = acceptRide;
exports.rejectRide = rejectRide;
exports.startRide = startRide;
exports.completeRide = completeRide;