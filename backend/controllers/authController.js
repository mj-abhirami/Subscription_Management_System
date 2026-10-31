const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ok, fail } = require("../utils/responses");

exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || password.length < 8) {
    return fail(res, "Name, valid email and password (minimum 8 characters) are required");
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const exists = await pool.query("SELECT id FROM users WHERE email=$1", [normalizedEmail]);
  if (exists.rowCount) return fail(res, "Email is already registered", 409);

  // Public registration always creates a customer. Admin/staff accounts must be provisioned securely.
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (name,email,password_hash,phone,role)
     VALUES ($1,$2,$3,$4,'customer')
     RETURNING id,name,email,role,phone,created_at`,
    [name.trim(), normalizedEmail, passwordHash, phone || null]
  );
  return ok(res, "Account created successfully", result.rows[0], 201);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, "Email and password are required");
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [String(email).trim().toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return fail(res, "Invalid email or password", 401);
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
  return ok(res, "Login successful", {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

exports.me = async (req, res) => {
  const result = await pool.query(
    "SELECT id,name,email,role,phone,created_at FROM users WHERE id=$1",
    [req.user.id]
  );
  if (!result.rowCount) return fail(res, "User not found", 404);
  return ok(res, "User profile retrieved", result.rows[0]);
};
