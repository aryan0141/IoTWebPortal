const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    // const token = req.headers['token'];
    const token = req.cookies.token;

    //Check if token is not avaliable
    if (!token) {
        res.locals = { status: 401, msg: 'Authorization Denied' }
        return next()
    }

    //Verify token
    try {
        const decoded = jwt.verify(token, 'jwtsecret');
        req.user = decoded.user;
        return next();
    } catch (error) {
        res.locals = { status: 403, msg: "Token is not valid" };
        return next()
    }
}

module.exports = auth;