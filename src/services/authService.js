const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/prisma");

const JWT_SECRET = process.env.JWT_SECRET || "usms-super-secret-jwt-key-2026";
const JWT_EXPIRES_IN = "7d";

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const registerUser = async ({ name, email, password, role }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!email || !validateEmail(email)) {
    const error = new Error("A valid email address is required");
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    const error = new Error("Password must be at least 6 characters long");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("User already exists with this email address");
    error.statusCode = 400;
    throw error;
  }

  const validRoles = ["ADMIN", "OFFICER", "SURVEYOR", "VIEWER"];
  const userRole = role && validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : "OFFICER";

  // Use bcrypt to hash the password with a salt factor of 10
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: userRole,
    },
    select: {
      user_id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });

  const token = jwt.sign(
    {
      user_id: newUser.user_id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user: newUser, token };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Compare submitted password against stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const userProfile = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };

  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user: userProfile, token };
};

const getUserById = async (userId) => {
  const id = Number(userId);
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid user ID");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { user_id: id },
    select: {
      user_id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      user_id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
    orderBy: { created_at: "asc" },
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
};
