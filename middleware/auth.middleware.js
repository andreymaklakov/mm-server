const tokenService = require("../services/token.service");

module.exports = (req, resp, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return resp
        .status(401)
        .json({ error: { message: "Unauthorized", code: 401 } });
    }

    const data = tokenService.validateAccess(token);
    if (!data) {
      return resp
        .status(401)
        .json({ error: { message: "Unauthorized", code: 401 } });
    }

    req.user = data;

    next();
  } catch (error) {
    resp.status(401).json({ error: { message: "Unauthorized", code: 401 } });
  }
};
