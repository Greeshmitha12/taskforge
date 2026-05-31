const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the headers and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (split "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Verify token authenticity using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from database using the ID inside the token (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      // Move on to the actual controller function
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };