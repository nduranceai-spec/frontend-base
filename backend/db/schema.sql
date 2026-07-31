-- ============================================================================
-- NDURANCE AI -- PostgreSQL Schema (fresh install)
-- Generated from backend/app/models/ (user.py, video.py, session.py)
--
-- Use this ONLY on a brand-new, empty database. If ndur_db already has
-- these tables, use migrate.sql instead (adds only what is missing).
--
--   sudo -u postgres psql -c "DROP DATABASE IF EXISTS ndur_db;"
--   sudo -u postgres psql -c "CREATE DATABASE ndur_db OWNER ndur_user;"
--   psql -h localhost -U ndur_user -d ndur_db -f backend/db/schema.sql
-- ============================================================================


-- -- users --
CREATE TABLE users (
	user_id SERIAL NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	password VARCHAR(255) NOT NULL, 
	age INTEGER, 
	height NUMERIC(5, 2), 
	weight NUMERIC(5, 2), 
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	is_verified BOOLEAN DEFAULT false NOT NULL, 
	otp_code VARCHAR(6), 
	otp_expires_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (user_id)
);

-- -- videos --
CREATE TABLE videos (
	video_id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	video_name VARCHAR(255) NOT NULL, 
	file_path TEXT NOT NULL, 
	file_type VARCHAR(20), 
	file_size BIGINT, 
	duration FLOAT, 
	uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	PRIMARY KEY (video_id), 
	FOREIGN KEY(user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- -- positions --
CREATE TABLE positions (
	frame_id SERIAL NOT NULL, 
	video_id INTEGER NOT NULL, 
	frame_number INTEGER NOT NULL, 
	body_part VARCHAR(30), 
	side VARCHAR(10), 
	x FLOAT, 
	y FLOAT, 
	z FLOAT, 
	visibility FLOAT, 
	PRIMARY KEY (frame_id), 
	FOREIGN KEY(video_id) REFERENCES videos (video_id) ON DELETE CASCADE
);

-- -- sessions --
CREATE TABLE sessions (
	session_id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	activity VARCHAR(100), 
	started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	video_id INTEGER, 
	session_type VARCHAR(20), 
	camera_count INTEGER, 
	duration_seconds FLOAT, 
	frames_analyzed INTEGER, 
	overall_score FLOAT, 
	confidence FLOAT, 
	notes TEXT, 
	PRIMARY KEY (session_id), 
	FOREIGN KEY(user_id) REFERENCES users (user_id) ON DELETE CASCADE, 
	FOREIGN KEY(video_id) REFERENCES videos (video_id)
);

-- -- ai_summaries --
CREATE TABLE ai_summaries (
	summary_id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	summary_text TEXT NOT NULL, 
	model_used VARCHAR(100), 
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	PRIMARY KEY (summary_id), 
	UNIQUE (session_id), 
	FOREIGN KEY(session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
);

-- -- alerts --
CREATE TABLE alerts (
	alert_id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	severity VARCHAR(20), 
	category VARCHAR(50), 
	message TEXT NOT NULL, 
	joint VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	PRIMARY KEY (alert_id), 
	FOREIGN KEY(session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
);

-- -- joint_angles --
CREATE TABLE joint_angles (
	angle_id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	frame_number INTEGER NOT NULL, 
	joint_name VARCHAR(50) NOT NULL, 
	angle_degrees FLOAT, 
	camera VARCHAR(20), 
	timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	PRIMARY KEY (angle_id), 
	FOREIGN KEY(session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
);

-- -- metrics --
CREATE TABLE metrics (
	metric_id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	metric_name VARCHAR(100) NOT NULL, 
	value FLOAT, 
	unit VARCHAR(30), 
	status VARCHAR(20), 
	optimal_range VARCHAR(50), 
	timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	PRIMARY KEY (metric_id), 
	FOREIGN KEY(session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
);

-- -- recommendations --
CREATE TABLE recommendations (
	recommendation_id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	category VARCHAR(50), 
	title VARCHAR(200) NOT NULL, 
	description TEXT NOT NULL, 
	sets_reps VARCHAR(100), 
	priority INTEGER, 
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	PRIMARY KEY (recommendation_id), 
	FOREIGN KEY(session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
);

-- -- reports --
CREATE TABLE reports (
	report_id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	pdf_path VARCHAR(500), 
	csv_path VARCHAR(500), 
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	PRIMARY KEY (report_id), 
	UNIQUE (session_id), 
	FOREIGN KEY(session_id) REFERENCES sessions (session_id) ON DELETE CASCADE, 
	FOREIGN KEY(user_id) REFERENCES users (user_id) ON DELETE CASCADE
);
