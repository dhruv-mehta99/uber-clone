const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        const error = new Error("Invalid request");
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.decode(token);
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }

    if (!decodedToken) {
        const error = new Error("Invalid access token");
        error.statusCode = 401;
        throw error
    }

    if (decodedToken.iss != 'https://accounts.google.com') {
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        throw error
    }

    req.authorizer_context = { email: decodedToken.email, name: decodedToken.name };
    next();
}