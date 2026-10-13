const jwt = require("jsonwebtoken");
const User = require("../models/User");

function extractToken(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

async function attachUser(req, res, next) {
  const token = extractToken(req);
  res.locals.currentUser = null;

  if (!token) {
    return next();
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (req.cookies && req.cookies.token) {
      res.clearCookie("token");
    }
    return next();
  }

  try {
    const user = await User.findById(decoded.id);
    if (user) {
      const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        resume: user.resume,
        createdAt: user.createdAt
      };
      req.user = safeUser;
      res.locals.currentUser = safeUser;
    }
  } catch (error) {
    return next(error);
  }

  next();
}

function isApiRequest(req) {
  return (
    req.path.startsWith("/api/") ||
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes("application/json"))
  );
}

function requireAuth(req, res, next) {
  if (!req.user) {
    if (isApiRequest(req)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    return res.redirect("/auth/login");
  }

  next();
}

function requireAdmin(req, res, next) {
  const isAdmin =
    Boolean(req.session && req.session.adminAuthenticated) ||
    Boolean(req.headers["x-admin-key"] && req.headers["x-admin-key"] === process.env.ADMIN_PASS);

  if (!isAdmin) {
    if (isApiRequest(req)) {
      return res.status(403).json({ error: "Admin authentication required" });
    }
    return res.redirect("/admin/login");
  }

  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
