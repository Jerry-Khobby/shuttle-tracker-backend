const jwt = require("jsonwebtoken");
const BlackList = require("../models/BlackList");
const OrdinaryUser = require("../models/OrdinaryUser");

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided " });
  }
  const tokenParts = token.split("");
  if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
    return res.status(401).json({ error: "Unauthorised:Invalid token format" });
  }
  const actualToken = tokenParts[1];

  try {
    const isBlackListed = await BlackList.findOne({ token: actualToken });
    if (isBlackListed) {
      return res
        .status(401)
        .json({ error: "Unauthorised: Token has been invalidated " });
    }
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user; // Attach the user object to request
    req.userId = decoded.id; // Add user ID to request object
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Token verification failed" });
  }
};

module.exports = verifyToken;
