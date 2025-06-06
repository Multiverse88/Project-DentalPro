const express = require('express');
const dentalController = require('../controllers/dentalController');
const authenticateApiKey = require('../middleware/authMiddleware');
// You might need a middleware to check if the patient belongs to the authenticated user

const router = express.Router({ mergeParams: true }); // mergeParams allows access to patientId from parent router

// Protect all dental routes with authentication middleware
router.use(authenticateApiKey);

// POST route to add a new dental record for a specific patient
// You might want to add a middleware here to verify patient ownership for the authenticated user
router.post('/', authenticateApiKey, dentalController.addDentalRecord);

// GET route to get all dental records for a specific patient
// You might want to add a middleware here to verify patient ownership for the authenticated user
router.get('/', dentalController.getDentalRecords);

module.exports = router;