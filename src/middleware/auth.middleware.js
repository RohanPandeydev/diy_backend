const jwt = require("jsonwebtoken");
const { unauthorizedResponse } = require("../utils/response.js");

const config = process.env;

const verifyToken = (req, res, next) => {
  let token =
    req.body.token || req.query.token || req.headers["authorization"];

  if (!token) {
    return unauthorizedResponse(res, {
      message: "A token is required for authentication",
    });
  }
  console.log(token)
 
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
    req.user = decoded;
  } catch (error) {
    return unauthorizedResponse(res, { message: "Invalid Token" });
  }
  return next();
};

module.exports = verifyToken;