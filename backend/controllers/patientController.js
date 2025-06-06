const patientModel = require('../models/patientModel');

const createPatient = async (req, res) => {
  try {
    // In a real application, you would get the user ID from
    // an authenticated user, likely stored in req.user after
    // JWT verification middleware. For now, we'll use a placeholder.
    const userId = req.user ? req.user.id : null; // Assuming user ID is in req.user.id

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, date_of_birth, gender } = req.body;

    if (!name || !date_of_birth || !gender) {
      return res.status(400).json({ message: 'Please provide name, date of birth, and gender' });
    }

    const newPatient = await patientModel.createPatient({ name, date_of_birth, gender, userId });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from authenticated user

    const patients = await patientModel.getAllPatientsByUserId(userId);

    res.status(200).json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patientId = req.params.id;
    const userId = req.user.id; // User ID from authenticated user

    const patient = await patientModel.getPatientById(patientId, userId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const userId = req.user.id; // User ID from authenticated user
    const newData = req.body;

    const success = await patientModel.updatePatient(patientId, userId, newData);

    if (!success) {
      return res.status(404).json({ message: 'Patient not found or not authorized' });
    }

    res.status(200).json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const userId = req.user.id; // User ID from authenticated user

    const success = await patientModel.deletePatient(patientId, userId);

    if (!success) {
      return res.status(404).json({ message: 'Patient not found or not authorized' });
    }

    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Error deleting patient', error: error.message });
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};