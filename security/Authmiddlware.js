// Import the 'jsonwebtoken' library to handle JSON Web Tokens (JWT).
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Define an authentication middleware function that will be used to protect routes.
const authenticationMiddleware = (req, res, next) => {
  // Get the authorization header from the incoming HTTP request.
  const authHeader = req.headers.authorization;

  // Check if the 'Authorization' header is missing or doesn't start with 'Bearer'.
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    // If it doesn't meet the criteria, return a 401 (Unauthorized) response with an error message.
    return res.status(401).json({ error: "No Bearer token" });
  }

  // Extract the token part from the 'Authorization' header.
  const token = authHeader.split(" ")[1];

  // Check if there is no token
  if (!token) {
    // If there is no token return a 401 (Unauthorized) response with an error message
    return res.status(401).json({ error: "Token not provided" });
  }

  try {
    // Attempt to verify the JWT using the provided 'token' and a secret from the environment variables (process.env.JWT_SECRET).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If verification is successful, extract the 'useremail' and 'pass' from the decoded token.
    const { useremail, pass } = decoded;

    // Log the decoded token (you might want to remove this in a production environment).
    console.log(decoded);

    // Attach the 'useremail' and 'pass' from the decoded token to the 'req' object for later use in the route handler.
    req.user = { useremail, pass };

    // Call 'next()' to allow the request to continue to the next middleware or route handler.
    next();
  } catch (error) {
    // If there's an error during token verification, return a 401 (Unauthorized) response with an error message.
    return res.status(401).json({ error: "Route access not authorized" });
  }
};

// Export the authentication middleware function for use in other parts of your application.
module.exports = authenticationMiddleware;
