require('dotenv').config();
const express = require('express');
const db = require('./config/db'); // Import the database connection
const cors = require('cors'); // Import the cors middleware
const userRoutes = require('./routes/userRoutes'); // Import user routes
const patientRoutes = require('./routes/patientRoutes'); // Import patient routes
const dentalRoutes = require('./routes/dentalRoutes'); // Import dental routes

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

// Use CORS middleware - allowing all origins for development
app.use(cors()); 

// Use user routes
app.use('/api/users', userRoutes);

// Use patient routes
app.use('/api/patients', patientRoutes);

// Use dental routes nested under patient routes
app.use('/api/patients/:patientId/dental', dentalRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});