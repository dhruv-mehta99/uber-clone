const mongoose = require("mongoose");

const uniqueValidator = require('mongoose-unique-validator');

const activeDriversSchema = new mongoose.Schema({

    timestamp: { type: Number, required: true },

    driver_ids: [{ type: mongoose.Types.ObjectId, ref: 'Driver' }]

});

activeDriversSchema.plugin(uniqueValidator);

module.exports = mongoose.model('active_driver', activeDriversSchema);