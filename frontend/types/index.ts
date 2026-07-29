// types/index.ts
// NDURANCE AI — Centralized TypeScript Types

export type ActivityType =
  | 'standing' | 'walking' | 'running'
  | 'squat' | 'pushup' | 'lunge' | 'jump' | 'unknown' | 'no_person';

export type AlertSeverity = 'info' | 'warning' | 'danger';
export type MetricStatus = 'optimal' | 'warning' | 'danger' | 'normal';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type SessionType = 'live' | 'upload';
export type UserRole = 'athlete' | 'coach' | 'admin';
export type CameraId = 'left' | 'back' | 'right';

// ── User ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  height_cm?: string;
  weight_kg?: string;
  experience_level?: ExperienceLevel;
  sport?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ── Joint Angles ──────────────────────────────────────────────────────────
export interface JointAngles {
  left_elbow?: number;
  right_elbow?: number;
  left_shoulder?: number;
  right_shoulder?: number;
  left_hip?: number;
  right_hip?: number;
  left_knee?: number;
  right_knee?: number;
  left_ankle?: number;
  right_ankle?: number;
  spine_inclination?: number;
  shoulder_alignment?: number;
  hip_alignment?: number;
  neck_angle?: number;
  left_knee_valgus?: number;
  right_knee_valgus?: number;
  knee_asymmetry?: number;
  hip_asymmetry?: number;
  [key: string]: number | undefined;
}

// ── Gait Metrics ──────────────────────────────────────────────────────────
export interface GaitMetrics {
  cadence: number;                  // steps per minute
  vertical_oscillation_cm: number;  // cm
  ground_contact_time_ms: number;   // milliseconds
  stride_length_m: number;          // meters
  foot_strike_type: string;         // Heel | Midfoot | Forefoot Strike
  knee_flexion_impact: number;      // degrees
  hip_extension_deg: number;        // degrees
  step_symmetry_pct: number;        // percentage
  step_count: number;
  form_score: number;               // 0-100
}

// ── Exercise Data ─────────────────────────────────────────────────────────
export interface ExerciseData {
  activity: string;
  reps: number;
  form_score: number;
  avg_form_score: number;
  cues: string[];
  angle_display?: string;
}

// ── Alert ─────────────────────────────────────────────────────────────────
export interface MotionAlert {
  severity: AlertSeverity;
  category: string;
  joint: string;
  message: string;
}

// ── Landmark ──────────────────────────────────────────────────────────────
export interface Landmark {
  x: number;
  y: number;
  z: number;
  v: number;  // visibility
}

// ── Live Camera Analysis Frame ────────────────────────────────────────────
export interface CameraAnalysisFrame {
  type: string;
  camera: CameraId;
  fps: number;
  frame_number: number;
  frame: string;        // base64 JPEG
  landmarks: Landmark[] | null;
  activity: ActivityType;
  confidence: number;
  joint_angles: JointAngles;
  form_score: number;
  alerts: MotionAlert[];
  gait_metrics: GaitMetrics | null;
  exercise_data: ExerciseData | null;
  coach_cue: string | null;
  error?: string;
}

// ── Camera State ──────────────────────────────────────────────────────────
export interface CameraState {
  id: CameraId;
  label: string;
  isConnected: boolean;
  isStreaming: boolean;
  fps: number;
  health: 'OK' | 'degraded' | 'offline';
  lastFrame: string | null;
  lastData: CameraAnalysisFrame | null;
}

// ── Session ───────────────────────────────────────────────────────────────
export interface Session {
  id: string;
  activity_type: ActivityType;
  session_type: SessionType;
  duration_seconds: number;
  overall_score: number;
  frames_analyzed: number;
  created_at: string;
}

export interface SessionDetail extends Session {
  metrics: SessionMetric[];
  alerts: MotionAlert[];
  ai_summary: string | null;
  recommendations: Recommendation[];
}

export interface SessionMetric {
  name: string;
  value: number;
  unit: string;
  status: MetricStatus;
}

// ── Recommendation ────────────────────────────────────────────────────────
export interface Recommendation {
  title: string;
  category: string;
  description: string;
  sets_reps?: string;
  priority: number;
  target_issue?: string;
}

// ── Aggregate Dashboard State ─────────────────────────────────────────────
export interface DashboardState {
  isLive: boolean;
  sessionId: string | null;
  cameras: Record<CameraId, CameraState>;
  primaryActivity: ActivityType;
  activityConfidence: number;
  overallScore: number;
  alerts: MotionAlert[];
  coachCues: string[];
  jointAngles: JointAngles;
  gaitMetrics: GaitMetrics | null;
  exerciseData: ExerciseData | null;
  sessionDuration: number;
  frameCount: number;
}

// ── Chart Data ────────────────────────────────────────────────────────────
export interface TimeSeriesPoint {
  time: number;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: TimeSeriesPoint[];
  color: string;
}
