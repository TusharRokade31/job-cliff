/**
 * auth.js  — middleware
 * Extracts Bearer token from incoming request and forwards it
 * when proxying calls to the Job Cliff API.
 */

function extractToken(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  req.authToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  next();
}

function requireAuth(req, res, next) {
  if (!req.authToken) {
    return res.status(401).json({ success: false, message: "Authorization token required." });
  }
  next();
}

module.exports = { extractToken, requireAuth };
