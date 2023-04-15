const { check } = require("express-validator");

const rideIdValidation = ()=>{
    return [
        check('ride_id').not().isEmpty()
    ]
}

module.exports = {
    rideIdValidation
}