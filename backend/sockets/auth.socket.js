const jwt = require("jsonwebtoken");
const cookie = require("cookie"); // ⚠️ Ensure you have: npm install cookie

module.exports = (socket, next) => {
  console.log("Handshake auth:", socket.handshake.auth);
  console.log("Handshake headers:", socket.handshake.headers.cookie);

  let token = socket.handshake.auth?.token;

  if (!token && socket.handshake.headers.cookie) {
    const cookie = require("cookie");
    const parsed = cookie.parse(socket.handshake.headers.cookie);
    token = parsed.token;
  }

  if (!token) {
    console.log("❌ No token sent with socket handshake");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.log("❌ JWT verification failed:", err.message);
    next(new Error("Authentication error"));
  }
};
