const jwt = require("jsonwebtoken");
const BlackList = require("../models/BlackList");
const OrdinaryUser = require("../models/OrdinaryUser");

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided " });
  }

  const tokenParts = token.split(" ");
  if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid token format" });
  }
  const actualToken = tokenParts[1];

  try {
    // Check if the token is in the blacklist
    const isBlackListed = await BlackList.findOne({ token: actualToken });
    if (isBlackListed) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Token has been invalidated " });
    }

    // Verify the token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    const user = await OrdinaryUser.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Attach user data to request
    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    // If the token has expired, add it to the blacklist
    if (error.name === "TokenExpiredError") {
      await BlackList.create({ token: actualToken });
      return res.status(401).json({ error: "Unauthorized: Token has expired" });
    }

    // Handle other errors
    console.error(error);
    res.status(500).json({ error: "Token verification failed" });
  }
};

module.exports = verifyToken;
