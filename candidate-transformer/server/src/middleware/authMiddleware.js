const { TokenService } = require("../services/tokenService");

const tokens = new TokenService();

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const payload = tokens.verify(token);

  if (!payload) return res.status(401).json({ error: "Authentication required" });

  req.user = {
    user_id: payload.sub,
    name: payload.name,
    email: payload.email
  };
  return next();
}

module.exports = { requireAuth };
