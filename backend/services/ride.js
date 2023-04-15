const mongoose = require("mongoose");

const DataNotFoundException = require("../Exceptions/DataNotFoundException");
const ServiceException = require("../Exceptions/ServiceException");
const ride = require("../models/ride");

const getRide = async (rideId) => {
    try {
        rideId = mongoose.Types.ObjectId(rideId)
        let rideFound = await ride.findById(rideId);

        if (!rideFound) {
            throw new DataNotFoundException("Ride not found: " + rideId, 500)
        }
        return rideFound
    } catch (err) {
        if(err instanceof DataNotFoundException){
            throw err
        }
        console.log(err);
        throw new ServiceException('Failed to fetch ride', 500);
    }
}

exports.getride = getRide;