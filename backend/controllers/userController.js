const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  registerUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Check if user already exists (optional but recommended)
      const existingUser = await userModel.findUserByEmail(email); // Assuming you add this model function later
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Create the user in the database
      const newUser = await userModel.createUser(username, email, password_hash);

      res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
      console.error('Error registering user:', error);
      // Check for specific database errors, e.g., unique constraint violation
      if (error.code === '23505') { // PostgreSQL unique violation error code
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await userModel.findUserByEmail(email);

      // If user not found, send 401
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare provided password with hashed password
      const isMatch = await bcrypt.compare(password, user.password_hash);

      // If passwords match, generate JWT
      if (isMatch) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' }); // Use environment variable for secret
        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
  }
};

module.exports = userController;