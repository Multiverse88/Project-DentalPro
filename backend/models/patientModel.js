const pool = require('../config/db');

const patientModel = {
  async createPatient(patientData, userId) {
    const { name, date_of_birth, gender } = patientData;
    try {
      const result = await pool.query(
        'INSERT INTO patients (user_id, name, date_of_birth, gender) VALUES ($1, $2, $3, $4) RETURNING id, name, date_of_birth, gender',
        [userId, name, date_of_birth, gender]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  async getAllPatientsByUserId(userId) {
    try {
      const result = await pool.query('SELECT id, name, date_of_birth, gender FROM patients WHERE user_id = $1 ORDER BY name', [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching patients by user ID:', error);
      throw error;
    }
  },

  async getPatientById(patientId, userId) {
    try {
      const result = await pool.query('SELECT id, user_id, name, date_of_birth, gender FROM patients WHERE id = $1 AND user_id = $2', [patientId, userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching patient with ID ${patientId}:`, error);
      throw error;
    }
  },

  async updatePatient(patientId, userId, newData) {
    const { name, date_of_birth, gender } = newData;
    try {
      const result = await pool.query(
        'UPDATE patients SET name = $1, date_of_birth = $2, gender = $3 WHERE id = $4 AND user_id = $5 RETURNING id',
        [name, date_of_birth, gender, patientId, userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error updating patient with ID ${patientId}:`, error);
      throw error;
    }
  },

  async deletePatient(patientId, userId) {
    try {
      const result = await pool.query(
        'DELETE FROM patients WHERE id = $1 AND user_id = $2 RETURNING id',
        [patientId, userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting patient with ID ${patientId}:`, error);
      throw error;
    }
  },
};

module.exports = patientModel;