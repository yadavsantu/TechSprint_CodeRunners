const { Server } = require("socket.io");
const socketAuth = require("./auth.socket"); // middleware to authenticate socket
const ambulanceSocket = require("./ambulance.socket");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  global.io = io; // make io global

  io.use(socketAuth); // attach user to socket.user

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Initialize ambulance socket events
    ambulanceSocket(socket, io);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
