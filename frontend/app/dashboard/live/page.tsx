'use client';
// app/dashboard/live/page.tsx — NDURANCE AI Live 3-Camera Analysis

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Play, Square, Wifi, WifiOff,
  Activity, Zap, AlertTriangle, Brain,
  ChevronDown, Save, RefreshCw
} from 'lucide-react';
import { CameraWebSocket } from '@/lib/websocket';
import { getApiErrorMessage, sessionsApi } from '@/lib/api';
import { useAuthStore, useDashboardStore } from '@/lib/store';
import {
  CameraId, CameraAnalysisFrame, MotionAlert,
  JointAngles, GaitMetrics, ExerciseData
} from '@/types';
import { ScoreRing } from '@/components/dashboard/ScoreRing';
import { JointAnglesPanel } from '@/components/dashboard/JointAnglesPanel';
import { AlertFeed } from '@/components/dashboard/AlertFeed';
import { LiveCoach } from '@/components/ai/LiveCoach';
import { MetricsPanel } from '@/components/dashboard/MetricsPanel';
import { ActivityBadge } from '@/components/dashboard/ActivityBadge';
import { LiveCharts } from '@/components/charts/LiveCharts';

const CAMERAS: { id: CameraId; label: string }[] = [
  { id: 'left',  label: 'LEFT CAM' },
  { id: 'back',  label: 'BACK CAM' },
  { id: 'right', label: 'RIGHT CAM' },
];

export default function LiveAnalysisPage() {
  const { user } = useAuthStore();
  const {
    isLive, sessionId, cameras, primaryActivity, activityConfidence,
    overallScore, alerts, coachCues, jointAngles, gaitMetrics, exerciseData,
    sessionDuration, frameCount,
    setCameraConnected, setCameraFrame, setCameraHealth,
    startSession, endSession, incrementDuration,
  } = useDashboardStore();

  // WebSocket refs for each camera
  const wsRefs = useRef<Partial<Record<CameraId, CameraWebSocket>>>({});
  // Video element refs for each camera (browser webcam)
  const videoRefs = useRef<Partial<Record<CameraId, HTMLVideoElement>>>({});
  // Canvas ref for frame capture
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Capture interval refs
  const captureIntervals = useRef<Partial<Record<CameraId, ReturnType<typeof setInterval>>>>({});
  // Duration ticker
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [wsStatus, setWsStatus] = useState<Record<CameraId, string>>({
    left: 'idle', back: 'idle', right: 'idle'
  });
  const [activeTab, setActiveTab] = useState<'cameras' | 'metrics' | 'coach'>('cameras');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showCameras = activeTab === 'cameras';
  const showAnalysis = activeTab !== 'cameras';

  // ── Start Live Session ─────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    setErrorMessage(null);

    try {
      const res = await sessionsApi.start({
        activity_type: 'unknown',
        session_type: 'live',
        camera_count: 3,
      });
      startSession(res.data.session_id);

      // Connect WebSocket for each camera
      CAMERAS.forEach(({ id }) => {
        const ws = new CameraWebSocket(
          id,
          (data: CameraAnalysisFrame) => setCameraFrame(id, data),
          (status) => {
            setWsStatus((prev) => ({ ...prev, [id]: status }));
            setCameraConnected(id, status === 'connected');
          },
          parseFloat(user?.height_cm || '175'),
        );
        ws.connect(user?.id, parseFloat(user?.height_cm || '175'));
        wsRefs.current[id] = ws;
      });

      // Wait for hidden video elements to mount before attaching streams
      await new Promise((resolve) => setTimeout(resolve, 0));
      await startWebcams();

      // Start duration ticker
      durationTimer.current = setInterval(incrementDuration, 1000);

    } catch (err) {
      const message = getApiErrorMessage(err);
      console.error('[Live] Failed to start session:', message, err);
      setErrorMessage(message);
    }
  }, [user, startSession, setCameraFrame, setCameraConnected, incrementDuration, setErrorMessage]);

  // ── Start Browser Webcams ──────────────────────────────────────────────
  const startWebcams = async () => {
    const constraints = { width: 640, height: 480, frameRate: 30 };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[Webcam] Browser does not support getUserMedia.');
      CAMERAS.forEach(({ id }) => setCameraHealth(id, 'offline'));
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      const usbDevices = videoDevices.filter((device) => /usb/i.test(device.label));

      if (!usbDevices.length) {
        console.warn('[Webcam] No USB cameras detected. Only USB cameras are supported.');
        CAMERAS.forEach(({ id }) => setCameraHealth(id, 'offline'));
        return;
      }

      for (let i = 0; i < CAMERAS.length; i++) {
        const { id } = CAMERAS[i];
        const device = usbDevices[i];

        if (!device) {
          console.warn(`[Webcam] No USB camera configured for '${id}'.`);
          setCameraHealth(id, 'offline');
          setCameraConnected(id, false);
          continue;
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId }, ...constraints },
          });

          const video = videoRefs.current[id];
          if (!video) {
            stream.getTracks().forEach((t) => t.stop());
            setCameraHealth(id, 'offline');
            setCameraConnected(id, false);
            continue;
          }

          video.srcObject = stream;
          await video.play();
          setCameraHealth(id, 'OK');

          const interval = setInterval(() => {
            const canvas = canvasRef.current;
            const ws = wsRefs.current[id];
            if (!canvas || !video || !ws?.isConnected) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            canvas.width = 640;
            canvas.height = 480;
            ctx.drawImage(video, 0, 0, 640, 480);
            ws.sendCanvasFrame(canvas, 0.7);
          }, 1000 / 30);

          captureIntervals.current[id] = interval;
        } catch (err) {
          console.warn(`[Webcam] Could not open USB camera '${id}':`, err);
          setCameraHealth(id, 'offline');
          setCameraConnected(id, false);
        }
      }
    } catch (err) {
      console.warn('[Webcam] enumerateDevices failed:', err);
      CAMERAS.forEach(({ id }) => setCameraHealth(id, 'offline'));
    }
  };

  // ── Stop Session ──────────────────────────────────────────────────────
  const handleStop = useCallback(async () => {
    // Stop capture loops
    Object.values(captureIntervals.current).forEach(clearInterval);
    captureIntervals.current = {};

    // Stop WebSockets
    Object.values(wsRefs.current).forEach((ws) => ws?.disconnect());
    wsRefs.current = {};

    // Stop webcam streams
    Object.values(videoRefs.current).forEach((video) => {
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
    });

    if (durationTimer.current) clearInterval(durationTimer.current);
    endSession();

    // Save session
    if (sessionId) {
      setIsSaving(true);
      try {
        await sessionsApi.finalize({
          session_id: sessionId,
          duration_seconds: sessionDuration,
          frames_analyzed: frameCount,
          joint_angles_summary: jointAngles as Record<string, number>,
          gait_metrics: gaitMetrics as any,
          exercise_data: exerciseData as any,
          alerts: alerts.map((a) => ({
            severity: a.severity,
            message: a.message,
            category: a.category,
            joint: a.joint,
          })),
          overall_score: overallScore,
          activity_type: primaryActivity,
        });
      } catch (err) {
        console.error('[Live] Finalize session error:', err);
      } finally {
        setIsSaving(false);
      }
    }
  }, [sessionId, sessionDuration, frameCount, jointAngles, gaitMetrics,
      exerciseData, alerts, overallScore, primaryActivity, endSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isLive) handleStop();
    };
  }, [handleStop, isLive]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* ── Top Bar ── */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-surface-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <Camera className="w-5 h-5 text-cyan-neon" />
          <span className="font-semibold text-white text-sm">Live Analysis</span>
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25">
              <span className="live-dot" />
              <span className="text-red-400 text-xs font-medium">LIVE</span>
              <span className="text-red-300/60 text-xs font-mono">{formatDuration(sessionDuration)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Camera status pills */}
          {CAMERAS.map(({ id, label }) => {
            const status = wsStatus[id];
            const color = status === 'connected' ? 'text-emerald-400 border-emerald-500/25'
              : status === 'connecting' ? 'text-amber-400 border-amber-500/25'
              : 'text-slate-600 border-white/10';
            return (
              <span key={id} className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-mono ${color}`}>
                {status === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {label}
              </span>
            );
          })}

          {/* Control buttons */}
          {!isLive ? (
            <button onClick={handleStart} id="live-start" className="btn-primary text-sm px-5 py-2">
              <Play className="w-4 h-4" /> Start Session
            </button>
          ) : (
            <button onClick={handleStop} id="live-stop" disabled={isSaving}
              className="btn-danger text-sm px-5 py-2">
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'End Session'}
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Navigation (mobile) ── */}
      <div className="flex md:hidden border-b border-white/[0.06] shrink-0">
        {(['cameras', 'metrics', 'coach'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
              activeTab === tab ? 'text-cyan-neon border-b-2 border-cyan-neon' : 'text-slate-500'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* ── Left: Camera Grid ── */}
        <div className={`flex-1 min-w-0 p-4 overflow-y-auto ${showCameras ? 'flex' : 'hidden md:flex'}`}>

          {/* Not started state */}
          {!isLive && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-neon/5 border border-cyan-neon/20 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-cyan-neon/40" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ready to Analyze</h2>
                <p className="text-slate-500 text-sm max-w-sm">
                  Connect your cameras and click Start Session. NDURANCE AI will automatically
                  detect your activity and track your motion in real-time.
                </p>
                {errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    <div className="font-semibold text-red-100">Connection issue</div>
                    <div>{errorMessage}</div>
                  </div>
                )}
              </div>
              <button onClick={handleStart} className="btn-primary px-10 py-4 text-base">
                <Play className="w-5 h-5" />
                Start Live Session
              </button>
            </div>
          )}

          {/* Live camera grid */}
          {isLive && (
            <div className="grid grid-cols-3 gap-3 h-full">
              {CAMERAS.map(({ id, label }) => {
                const camData = cameras[id];
                const lastFrame = camData.lastFrame;

                return (
                  <div key={id} className="camera-panel scan-line">
                    {/* Label */}
                    <div className="camera-panel-label">{label}</div>

                    {/* FPS + health */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        camData.health === 'OK' ? 'bg-emerald-400' :
                        camData.health === 'degraded' ? 'bg-amber-400' : 'bg-red-500'
                      }`} />
                      <span className="text-xs font-mono text-white/70">{Number.isFinite(camData.fps) ? camData.fps.toFixed(0) : '--'} FPS</span>
                    </div>

                    {/* Frame / placeholder */}
                    {lastFrame ? (
                      <img
                        src={`data:image/jpeg;base64,${lastFrame}`}
                        alt={`${label} feed`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-900">
                        <Activity className="w-8 h-8 text-cyan-neon/20 animate-pulse" />
                        <span className="text-xs text-slate-700 mt-2 font-mono">
                          {wsStatus[id] === 'connecting' ? 'Connecting...' : 'Waiting for feed'}
                        </span>
                      </div>
                    )}

                    {/* Activity overlay at bottom */}
                    {camData.lastData && (
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="flex items-center justify-between">
                          <ActivityBadge
                            activity={camData.lastData.activity}
                            confidence={camData.lastData.confidence}
                            small
                          />
                          <span className="text-xs font-mono text-cyan-neon/80">
                            {typeof camData.lastData?.form_score === 'number' ? camData.lastData.form_score.toFixed(0) : '--'}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Hidden video element for this camera */}
                    <video
                      ref={(el) => { if (el) videoRefs.current[id] = el; }}
                      className="hidden"
                      muted
                      playsInline
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Live Charts (shown below cameras when live) */}
          {isLive && jointAngles && Object.keys(jointAngles).length > 0 && (
            <div className="mt-4">
              <LiveCharts jointAngles={jointAngles} gaitMetrics={gaitMetrics} />
            </div>
          )}
        </div>

        {/* ── Right: Analysis Panel ── */}
        <div className={`w-80 shrink-0 border-l border-white/[0.06] overflow-y-auto flex flex-col gap-4 p-4 ${showAnalysis ? 'flex' : 'hidden md:flex'}`}>
          {/* Overall Score Ring */}
          <div className="glass-card p-4 text-center">
            <ScoreRing score={overallScore} />
            <p className="text-xs text-slate-500 mt-2">Overall Form Score</p>
          </div>

          {/* Activity */}
          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Detected Activity</div>
            <ActivityBadge activity={primaryActivity} confidence={activityConfidence} />
            {exerciseData && exerciseData.reps > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <div className="text-2xl font-black text-white">{exerciseData.reps}</div>
                <div className="text-xs text-slate-400">reps completed</div>
              </div>
            )}
          </div>

          {/* Joint Angles */}
          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Joint Angles</div>
            <JointAnglesPanel angles={jointAngles} />
          </div>

          {/* Gait Metrics */}
          {gaitMetrics && (primaryActivity === 'walking' || primaryActivity === 'running') && (
            <div className="glass-card p-4">
              <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Gait Metrics</div>
              <MetricsPanel metrics={gaitMetrics} />
            </div>
          )}

          {/* Alerts */}
          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Posture Alerts
              {alerts.length > 0 && (
                <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs px-1.5 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              )}
            </div>
            <AlertFeed alerts={alerts} />
          </div>

          {/* AI Coach */}
          <div className="glass-card p-4">
            <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-3 h-3 text-purple-400" />
              AI Coach
            </div>
            <LiveCoach cues={coachCues} isLive={isLive} />
          </div>
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" width={640} height={480} />
    </div>
  );
}
