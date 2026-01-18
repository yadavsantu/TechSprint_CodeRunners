const express = require("express");
const http = require("http"); // ✅ REQUIRED
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const accidentRouter = require("./routes/accidentRouter");
const userRoutes = require("./routes/userRoutes");
const initSocket = require("./sockets/index");
const DataBaseConnection = require("./config/dbConfig");
const ambulanceRoutes = require("./routes/ambulance");


const app = express();
const port = process.env.PORT || 5000;

// DB
DataBaseConnection();

// MIDDLEWARES
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTES
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/accident", accidentRouter);
app.use("/api/v1/user", userRoutes);
app.use("/api/ambulance", ambulanceRoutes);

// CREATE HTTP SERVER
const server = http.createServer(app);

// INIT SOCKET.IO
initSocket(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
