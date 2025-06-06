-- Table for Clinic Staff
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Associate patient with the staff who added them
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Dental Records
CREATE TABLE dental_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE, -- Link dental records to patients
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Associate record with the staff who created it
    tooth_number VARCHAR(10), -- Could be a tooth number (e.g., '18', '32') or a description (e.g., 'upper left')
    treatment_date DATE NOT NULL,
    description TEXT,
    treatment_type VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Indexing for performance on frequently queried columns
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_dental_records_patient_id ON dental_records(patient_id);
CREATE INDEX idx_dental_records_user_id ON dental_records(user_id);