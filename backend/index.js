require('dotenv').config();
const express = require('express');
const db = require('./config/db'); // Import the database connection
const cors = require('cors'); // Import the cors middleware
const userRoutes = require('./routes/userRoutes'); // Import user routes
const patientRoutes = require('./routes/patientRoutes'); // Import patient routes
const dentalRoutes = require('./routes/dentalRoutes'); // Import dental routes

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json()); // Middleware to parse JSON request bodies

// Use user routes at /api
app.use('/api', userRoutes);

// Use patient routes
app.use('/api/patients', patientRoutes);

// Use dental routes nested under patient routes
app.use('/api/patients/:patientId/dental', dentalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});