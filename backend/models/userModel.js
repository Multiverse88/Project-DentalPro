const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  async createUser(username, email, password_hash) {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
        [username, email, password_hash]
      );
      return result.rows[0]; // Return the user data
    } catch (err) {
      console.error('Error creating user:', err);
      throw err; // Rethrow the error for handling in the controller
    }
  },

  async findUserByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1',
        [email]
      );
      if (result.rows.length > 0) {
        return result.rows[0]; // Return the user object
      } else {
        return null; // User not found
      }
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err; // Rethrow the error for handling in the controller
    }
  },

  // Add other user-related database functions here (e.g., findUserByUsername, findUserById, findUserById)
};

module.exports = UserModel;