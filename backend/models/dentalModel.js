const pool = require('../config/db');

const dentalRecordModel = {
  /**
   * Adds a new dental record for a patient to the database.
   * @param {number} patientId - The ID of the patient.
   * @param {object} dentalData - An object containing dental record data (tooth_number, treatment_date, description, treatment_type).
   * @returns {Promise<object|null>} A promise that resolves with the newly created dental record object, or null if an error occurred.
   */
  async addDentalRecord(patientId, { tooth_number, treatment_date, description, treatment_type }) {
    try {
      const result = await pool.query(
        'INSERT INTO dental_records (patient_id, tooth_number, treatment_date, description, treatment_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [patientId, tooth_number, treatment_date, description, treatment_type]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error adding dental record:', error);
      throw error; // Re-throw the error for the controller to handle
    }
  },

  /**
   * Gets all dental records for a specific patient.
   * @param {number} patientId - The ID of the patient.
   * @returns {Promise<Array<object>>} A promise that resolves with an array of dental record objects.
   */
  async getDentalRecordsByPatientId(patientId) {
    try {
      const result = await pool.query(
        'SELECT * FROM dental_records WHERE patient_id = $1 ORDER BY treatment_date DESC',
        [patientId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting dental records:', error);
      throw error;
    }
  },
  // Add more functions here later for getting dental records, etc.
};

module.exports = dentalRecordModel;