-- Drop tables if they exist to avoid conflicts
DROP TABLE IF EXISTS project_stages;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS stages;
DROP TABLE IF EXISTS admin;

-- Create the Projects table
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Ongoing', 'Completed', 'Archived')) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- Create the Stages table
CREATE TABLE stages (
    stage_id SERIAL PRIMARY KEY,
    stage_name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create the Project_Stages table (Many-to-Many relationship between projects and stages)
CREATE TABLE project_stages (
    id SERIAL PRIMARY KEY,
    project_id INT,
    stage_id INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Ongoing', 'Completed')) DEFAULT 'Pending',
    CONSTRAINT project_stages_project_id_fkey FOREIGN KEY (project_id) 
        REFERENCES projects (project_id) ON DELETE CASCADE,
    CONSTRAINT project_stages_stage_id_fkey FOREIGN KEY (stage_id) 
        REFERENCES stages (stage_id) ON DELETE CASCADE
);

-- Create the Admin table
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(1000) NOT NULL,
    status VARCHAR(10) CHECK (status IN ('active', 'inactive')) DEFAULT 'inactive',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update 'updated_at' on admin updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_updated_at
BEFORE UPDATE ON admin
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

SELECT * FROM projects;
SELECT * FROM project_stages;
SELECT * FROM stages;
SELECT * FROM admin;