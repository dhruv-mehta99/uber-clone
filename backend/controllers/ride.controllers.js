const { validationResult } = require("express-validator");

const HttpError = require("../Exceptions/http-error");
const ride = require("../models/ride");
const sio = require('../socketio');

//////////////////////////////////////////////////////////// GET /////////////////////////////////////////////////////////////////////////


// To post a new ride
const postNewRide = async (req, res, next) => {

    const error = validationResult(req);
    if (!error.isEmpty()) {
        console.log(error);
        return next(new HttpError('Invalid input.Please Check!', 422));
    }

    const newRide = new ride({
        source_address: req.body.source_address,
        destination_address: req.body.destination_address,
        fare: req.body.fare,
        status: "requested",
        rider_id: "abc12345safsd"
    });

    try {
        await newRide.save();
        
    } catch (err) {
        console.log(err);
        return next(new HttpError('Failed to post ride', 500));
    }

    sio.getIO().emit('new_ride', newRide.toObject());
    
    res.json({
        data: {
            "@entity": "ride",
            id: newRide._id,
            source_address: newRide.source_address,
            destination_address: newRide.destination_address,
            fare: newRide.fare,
            status: newRide.status,
            rider_id: newRide.rider_id
        }
    });
}

exports.postNewRide = postNewRide;