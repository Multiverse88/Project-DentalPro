const dentalModel = require('../models/dentalModel');
const patientModel = require('../models/patientModel'); // Assuming you have this to check patient ownership

const addDentalRecord = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const userId = req.user.id; // Get user ID from authenticated request

    // Optional: Verify that the patient belongs to the authenticated user
    const patient = await patientModel.getPatientById(patientId, userId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or does not belong to the user.' });
    }

    const { tooth_number, treatment_date, description, treatment_type } = req.body;

    if (!tooth_number || !treatment_date || !description || !treatment_type) {
      return res.status(400).json({ message: 'Missing required dental record fields.' });
    }

    const newDentalRecord = await dentalModel.addDentalRecord({
      patient_id: patientId,
      tooth_number,
      treatment_date,
      description,
      treatment_type,
    });

    res.status(201).json({ message: 'Dental record added successfully', dentalRecord: newDentalRecord });

  } catch (error) {
    console.error('Error adding dental record:', error);
    res.status(500).json({ message: 'Failed to add dental record.' });
  }
};

const getDentalRecords = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    // TODO: Add patient ownership check middleware before this

    const dentalRecords = await dentalModel.getDentalRecordsByPatientId(patientId);

    res.status(200).json(dentalRecords);

  } catch (error) {
    console.error('Error fetching dental records:', error);
    res.status(500).json({ message: 'Failed to fetch dental records.' });
  }
};

module.exports = {
  addDentalRecord,
  getDentalRecords,
};