const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const secretKey = process.env.JWT_PRIVATE_KEY;

    if (!secretKey) {
      throw new Error("JWT secret key not defined in environment");
    }

    const decoded = jwt.verify(token, secretKey);

    req.user = decoded; // store payload in req.user for access in routes
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
