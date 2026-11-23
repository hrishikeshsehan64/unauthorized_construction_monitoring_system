const express = require("express");
const {
  register,
  login,
  getMe,
  getAllUsers,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.get("/users", authenticate, getAllUsers);

module.exports = router;
