const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        const error = new Error("Authorization failure");
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, Buffer.from('qwerty123456', 'base64'));
    } catch (error) {
        error = new Error("Invalid access token");
        error.statusCode = 403;
        throw error;
    }

    if (!decodedToken) {
        const error = new Error("Authorization failure");
        error.statusCode = 401;
        throw error
    }

    if (decodedToken.iss != "driver-app.uberclone.com") {
        const error = new Error("Invalid access token");
        error.statusCode = 403;
        throw error
    }
    if (decodedToken.aud != "DRIVER") {
        const error = new Error("Insufficient privilege");
        error.statusCode = 403;
        throw error
    }

    // * values which can be obtained from token
    req.authorizer_context = { email: decodedToken.email, driver_id: decodedToken.driver_id };
    next();
}