const express = require('express');
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/patients
router.post('/', authMiddleware, patientController.createPatient);

// GET /api/patients
router.get('/', authMiddleware, patientController.getAllPatients);

// GET /api/patients/:id
router.get('/:id', authMiddleware, patientController.getPatientById);

// PUT /api/patients/:id
router.put('/:id', authMiddleware, patientController.updatePatient);

// DELETE /api/patients/:id
router.delete('/:id', authMiddleware, patientController.deletePatient);

module.exports = router;