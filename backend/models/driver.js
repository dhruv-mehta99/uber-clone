const mongoose = require("mongoose");

const uniqueValidator = require('mongoose-unique-validator');

const driverSchema = new mongoose.Schema({

    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: false },

    accepted_rides :[{type: mongoose.Types.ObjectId, ref: 'ride'}],

    rejected_rides :[{type: mongoose.Types.ObjectId, ref: 'ride'}],

    completed_rides :[{type: mongoose.Types.ObjectId, ref: 'ride'}],

    ongoing_ride :{type: mongoose.Types.ObjectId, ref: 'ride'}

});

driverSchema.plugin(uniqueValidator);

module.exports = mongoose.model('driver', driverSchema);