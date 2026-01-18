const jwt = require("jsonwebtoken");
const cookie = require("cookie");

module.exports = (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("No cookies sent"));
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token; // ⚠️ must match cookie name

    if (!token) {
      return next(new Error("Auth token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Socket authentication failed"));
  }
};
