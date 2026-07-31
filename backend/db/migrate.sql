-- ============================================================================
-- NDURANCE AI -- Incremental Migration (existing ndur_db)
-- Safe to run repeatedly -- every statement is idempotent
-- (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS), so it won't error on tables
-- or columns you already have, and won't touch existing data.
--
--   psql -h localhost -U ndur_user -d ndur_db -f backend/db/migrate.sql
-- ============================================================================

-- ── users: OTP / email-verification columns ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITHOUT TIME ZONE;

-- ── videos / positions: video-upload analysis tables ──
CREATE TABLE IF NOT EXISTS videos (
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

CREATE TABLE IF NOT EXISTS positions (
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

-- ── sessions: live-analysis columns ──
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS video_id INTEGER REFERENCES videos(video_id);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_type VARCHAR(20);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS camera_count INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_seconds FLOAT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS frames_analyzed INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS overall_score FLOAT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS confidence FLOAT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS notes TEXT;

-- ── analysis tables ──
CREATE TABLE IF NOT EXISTS ai_summaries (
	summary_id SERIAL NOT NULL,
	session_id INTEGER NOT NULL,
	summary_text TEXT NOT NULL,
	model_used VARCHAR(100),
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
	PRIMARY KEY (summary_id),
	UNIQUE (session_id),
	FOREIGN KEY(session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
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

CREATE TABLE IF NOT EXISTS joint_angles (
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

CREATE TABLE IF NOT EXISTS metrics (
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

CREATE TABLE IF NOT EXISTS recommendations (
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

CREATE TABLE IF NOT EXISTS reports (
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
