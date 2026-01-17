const express = require("express");
const loginValidation = require("../middlewares/loginValidation");
const { loginController } = require("../controllers/loginController");
const registerValidation = require("../middlewares/registerationValidation");
const { registerController } = require("../controllers/registerController");
const { logout } = require("../controllers/logout");
const router = express.Router();

// Login route
router.post("/login", loginValidation, loginController);
router.post("/register", registerValidation, registerController);
router.post("/logout", logout);

module.exports = router;
