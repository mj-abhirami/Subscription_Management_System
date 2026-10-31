require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./config/db");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  const name = "SUBSIGHT Admin";
  const email = "admin@subsight.com";

  rl.question("Enter a new Admin password: ", async (password) => {
    try {
      if (password.length < 8) {
        throw new Error("Password must have at least 8 characters.");
      }

      const hash = await bcrypt.hash(password, 12);

      await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'admin')`,
        [name, email, hash]
      );

      console.log("Admin account created successfully!");
      console.log("Email:", email);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      rl.close();
      await pool.end();
    }
  });
}

createAdmin();