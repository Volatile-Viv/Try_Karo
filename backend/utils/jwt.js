const jwt = require("jsonwebtoken");

// Generate a JWT token
exports.generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT Secret is not defined in environment variables");
  }

  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Verify and decode a JWT token
exports.verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT Secret is not defined in environment variables");
  }

  return jwt.verify(token, secret);
};
