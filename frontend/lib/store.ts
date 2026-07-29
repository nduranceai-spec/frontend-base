// lib/store.ts
// NDURANCE AI — Zustand Global State Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User, DashboardState, CameraState, CameraId,
  ActivityType, JointAngles, GaitMetrics, ExerciseData,
  MotionAlert, CameraAnalysisFrame
} from '@/types';

// ── Auth Store ────────────────────────────────────────────────────────────
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (partial) => set((s) => ({
        user: s.user ? { ...s.user, ...partial } : null
      })),
    }),
    { name: 'ndurance_auth' }
  )
);

// ── Camera Initial State ──────────────────────────────────────────────────
const makeCameraState = (id: CameraId, label: string): CameraState => ({
  id, label, isConnected: false, isStreaming: false,
  fps: 0, health: 'offline', lastFrame: null, lastData: null,
});

// ── Dashboard Store ───────────────────────────────────────────────────────
interface DashboardStore extends DashboardState {
  // Camera actions
  setCameraConnected: (id: CameraId, connected: boolean) => void;
  setCameraFrame: (id: CameraId, frame: CameraAnalysisFrame) => void;
  setCameraHealth: (id: CameraId, health: CameraState['health']) => void;
  
  // Session actions
  startSession: (sessionId: string) => void;
  endSession: () => void;
  
  // Aggregated metrics (computed from all cameras)
  updateAggregateMetrics: () => void;
  
  addCoachCue: (cue: string) => void;
  clearAlerts: () => void;
  incrementDuration: () => void;
}

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  isLive: false,
  sessionId: null,
  cameras: {
    left:  makeCameraState('left',  'LEFT CAM'),
    back:  makeCameraState('back',  'BACK CAM'),
    right: makeCameraState('right', 'RIGHT CAM'),
  },
  primaryActivity: 'unknown',
  activityConfidence: 0,
  overallScore: 0,
  alerts: [],
  coachCues: [],
  jointAngles: {},
  gaitMetrics: null,
  exerciseData: null,
  sessionDuration: 0,
  frameCount: 0,

  setCameraConnected: (id, connected) =>
    set((s) => ({
      cameras: {
        ...s.cameras,
        [id]: {
          ...s.cameras[id],
          isConnected: connected,
          isStreaming: connected,
          health: connected ? 'OK' : 'offline',
        },
      },
    })),

  setCameraFrame: (id, frame) => {
    set((s) => ({
      cameras: {
        ...s.cameras,
        [id]: {
          ...s.cameras[id],
          fps: frame.fps,
          lastFrame: frame.frame,
          lastData: frame,
          health: 'OK',
        },
      },
      frameCount: s.frameCount + 1,
    }));
    get().updateAggregateMetrics();
  },

  setCameraHealth: (id, health) =>
    set((s) => ({
      cameras: { ...s.cameras, [id]: { ...s.cameras[id], health } },
    })),

  startSession: (sessionId) =>
    set({ isLive: true, sessionId, sessionDuration: 0, frameCount: 0, coachCues: [] }),

  endSession: () =>
    set({ isLive: false }),

  updateAggregateMetrics: () => {
    const { cameras } = get();
    const activeCams = Object.values(cameras).filter((c) => c.lastData);
    if (!activeCams.length) return;

    // Aggregate form scores
    const scores = activeCams.map((c) => c.lastData!.form_score).filter(Boolean);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Primary activity from back camera (most reliable) or majority
    const backData = cameras.back.lastData;
    const primaryActivity = (backData?.activity || 'unknown') as ActivityType;
    const confidence = backData?.confidence || 0;

    // Merge joint angles (prefer back camera)
    const jointAngles = backData?.joint_angles || {};

    // Gait metrics from back camera
    const gaitMetrics = backData?.gait_metrics || null;
    const exerciseData = backData?.exercise_data || null;

    // Collect all alerts from all cameras (deduplicated by message)
    const allAlerts: MotionAlert[] = [];
    const seen = new Set<string>();
    activeCams.forEach((c) => {
      c.lastData!.alerts.forEach((a) => {
        if (!seen.has(a.message)) {
          seen.add(a.message);
          allAlerts.push(a);
        }
      });
    });

    // Collect coach cues
    const newCues: string[] = [];
    activeCams.forEach((c) => {
      if (c.lastData?.coach_cue) newCues.push(c.lastData.coach_cue);
    });

    set((s) => ({
      overallScore: Math.round(avgScore * 10) / 10,
      primaryActivity,
      activityConfidence: confidence,
      jointAngles,
      gaitMetrics,
      exerciseData,
      alerts: allAlerts,
      coachCues: newCues.length
        ? [...s.coachCues.slice(-9), ...newCues]
        : s.coachCues,
    }));
  },

  addCoachCue: (cue) =>
    set((s) => ({ coachCues: [...s.coachCues.slice(-9), cue] })),

  clearAlerts: () => set({ alerts: [] }),

  incrementDuration: () =>
    set((s) => ({ sessionDuration: s.sessionDuration + 1 })),
}));
