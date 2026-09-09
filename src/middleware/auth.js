const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { errorResponse } = require("../config/response");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "Unauthorized. Token required.", 401);
  }

  const token = authHeader.split(" ")[1];

  if (db.blacklistedTokens.has(token)) {
    return errorResponse(res, "Token has been invalidated. Please login again.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = db.users.find((u) => u.id === decoded.id);

    if (!user) return errorResponse(res, "User not found.", 401);

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return errorResponse(res, "Invalid or expired token.", 401);
  }
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.auth = authenticate;

