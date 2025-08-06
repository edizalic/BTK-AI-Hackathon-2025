-- PostgreSQL initialization script for Education Management System
-- This script runs automatically when the database container starts for the first time

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS analytics;
-- CREATE SCHEMA IF NOT EXISTS reporting;

-- Set timezone
SET timezone = 'UTC';

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE "AI_Hackathon" TO ediz;

-- Log initialization
INSERT INTO pg_stat_statements_info VALUES ('Database initialized at: ' || NOW())
ON CONFLICT DO NOTHING;