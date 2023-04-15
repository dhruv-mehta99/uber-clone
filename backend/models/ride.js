const mongoose = require("mongoose");

const uniqueValidator = require('mongoose-unique-validator');

const rideSchema = new mongoose.Schema({

    source_address: { type: String, required: true },

    destination_address: { type: String, required: true },

    fare: { type: Number, required: true },

    driver_id: { type: mongoose.Types.ObjectId, ref: 'driver' },

    rider_id: { type: String, required: true },
    //can have requested,accepted,cancelled,started,completed
    status: { type: String }

});

rideSchema.plugin(uniqueValidator);

module.exports = mongoose.model('ride', rideSchema);