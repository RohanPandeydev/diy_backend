const jwt = require("jsonwebtoken");

const config = process.env;

exports.createToken = function (payload) {
    const tkn = jwt.sign(payload, config.JWT_SECRET_KEY);
    return tkn;
}
