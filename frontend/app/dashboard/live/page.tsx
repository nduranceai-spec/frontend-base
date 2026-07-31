'use client';
// app/dashboard/live/page.tsx — Triple Camera Capture Lab
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SpiderButton from '@/components/ui/SpiderButton';
import GlassCard from '@/components/ui/GlassCard';
import { authApi } from '@/lib/api';

// Body keypoints for overlay (relative %)
const KEYPOINTS = [
  { id: 'head', x: 50, y: 8 },
  { id: 'l-shoulder', x: 35, y: 20 },
  { id: 'r-shoulder', x: 65, y: 20 },
  { id: 'l-hip', x: 38, y: 42 },
  { id: 'r-hip', x: 62, y: 42 },
  { id: 'l-knee', x: 36, y: 62 },
  { id: 'r-knee', x: 64, y: 62 },
  { id: 'l-hand', x: 25, y: 45 },
  { id: 'r-hand', x: 75, y: 45 },
  { id: 'l-ankle', x: 36, y: 80 },
  { id: 'r-ankle', x: 64, y: 80 },
];

const SKELETON: [string, string][] = [
  ['head', 'l-shoulder'], ['head', 'r-shoulder'],
  ['l-shoulder', 'r-shoulder'],
  ['l-shoulder', 'l-hip'], ['r-shoulder', 'r-hip'],
  ['l-hip', 'r-hip'],
  ['l-hip', 'l-knee'], ['r-hip', 'r-knee'],
  ['l-knee', 'l-ankle'], ['r-knee', 'r-ankle'],
  ['l-shoulder', 'l-hand'], ['r-shoulder', 'r-hand'],
];

const kpMap = Object.fromEntries(KEYPOINTS.map(k => [k.id, k]));

type CamId = 'left' | 'back' | 'right';

const CAM_CONFIG: { camId: CamId; label: string }[] = [
  { camId: 'left', label: 'LEFT CAMERA' },
  { camId: 'back', label: 'BACK CAMERA' },
  { camId: 'right', label: 'RIGHT CAMERA' },
];

/* ─── Camera Panel ─── */
const CameraPanel = memo(function CameraPanel({
  camId, label, active, onRef, recording, fullscreen, testMode, error,
}: {
  camId: CamId; label: string; active: boolean;
  onRef: (el: HTMLVideoElement | null) => void; recording: boolean; fullscreen: boolean;
  testMode: boolean; error?: string;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${recording ? 'bg-spider-scarlet animate-pulse' : 'bg-spider-dim'}`} />
          <span className="font-display text-xs tracking-widest text-spider-scarlet uppercase truncate">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-spider-dim flex-shrink-0 ml-2">{camId.toUpperCase()} · CAM</span>
      </div>

      {/* Video frame */}
      <div
        className={`relative ${fullscreen
            ? 'h-full min-h-[260px]'
      : testMode
  ? 'w-full aspect-[9/16] min-h-[700px] max-h-[80vh]'
      : 'aspect-video'
      } bg-spider-black rounded-xl overflow-hidden web-border`}
        >
      {/* Scan line while recording */}
      {recording && (
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-spider-scarlet/80 to-transparent z-10"
          style={{ animation: 'scanLineAnim 2.5s linear infinite' }} />
      )}

      <video ref={onRef} autoPlay muted playsInline className="w-full h-full object-cover" />

      {/* Standby placeholder */}
      {!active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-spider-black/90">
          <svg viewBox="0 0 80 60" fill="none" className="w-16 h-12 mb-2 opacity-30">
            <rect x="5" y="10" width="55" height="40" rx="5" stroke="rgba(220,20,60,0.6)" strokeWidth="1.5" />
            <polygon points="65,20 75,30 65,40" fill="rgba(220,20,60,0.4)" />
            <circle cx="32" cy="30" r="8" stroke="rgba(220,20,60,0.4)" strokeWidth="1" />
            <circle cx="32" cy="30" r="3" fill="rgba(220,20,60,0.3)" />
          </svg>
          <p className="text-[10px] font-mono text-spider-dim tracking-widest">CAMERA STANDBY</p>
          <p className="text-[8px] font-mono text-spider-scarlet/50 mt-1">{label} POSITION</p>
        </div>
      )}
      {error && (
        <div className="absolute bottom-2 left-2 right-2 rounded-md border border-red-500/30 bg-black/80 px-2 py-1 text-[9px] font-mono text-red-300">
          {error}
        </div>
      )}

      {/* Pose overlay while recording */}
      {active && recording && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          {SKELETON.map(([a, b], i) => {
            const ka = kpMap[a]; const kb = kpMap[b];
            if (!ka || !kb) return null;
            return (
              <motion.line key={i}
                x1={`${ka.x}%`} y1={`${ka.y}%`}
                x2={`${kb.x}%`} y2={`${kb.y}%`}
                stroke="rgba(220,20,60,0.6)" strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
              />
            );
          })}
          {KEYPOINTS.map((kp, idx) => (
            <motion.circle key={kp.id}
              cx={`${kp.x}%`} cy={`${kp.y}%`} r="4"
              fill="rgba(220,20,60,0.85)"
              stroke="rgba(255,100,120,0.5)" strokeWidth="1"
              animate={{ r: [4, 5.5, 4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: (idx * 0.04) % 0.5 }}
            />
          ))}
        </svg>
      )}

      {/* Corner decorators */}
      <span className="absolute top-2 left-2  w-4 h-4 border-t-2 border-l-2 border-spider-scarlet/60 pointer-events-none" />
      <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-spider-scarlet/60 pointer-events-none" />
      <span className="absolute bottom-2 left-2  w-4 h-4 border-b-2 border-l-2 border-spider-scarlet/60 pointer-events-none" />
      <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-spider-scarlet/60 pointer-events-none" />

      {/* Live / Offline chip */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-spider-black/80 border border-spider-scarlet/20 mt-5">
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400 animate-pulse' : 'bg-spider-dim'}`} />
        <span className="text-[8px] font-mono text-spider-dim">{active ? 'LIVE' : 'OFFLINE'}</span>
      </div>
    </div>
    </div >
  );
});

/* ─── Main Page ─── */
export default function LiveCapturePage() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [camActive, setCamActive] = useState<Record<CamId, boolean>>({ left: false, back: false, right: false });
  const [aiStatus, setAiStatus] = useState('STANDBY');
  const [streams, setStreams] = useState<Partial<Record<CamId, MediaStream>>>({});
  const [sessionId, setSessionId] = useState('----');
  const [athleteName, setAthleteName] = useState('—');
  const [detectedCameras, setDetectedCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraAssignments, setCameraAssignments] = useState<Record<CamId, string>>({ left: '', back: '', right: '' });
  const [cameraErrors, setCameraErrors] = useState<Partial<Record<CamId, string>>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Generate session ID client-side only to avoid SSR hydration mismatch
  useEffect(() => { setSessionId(`#${String(Date.now()).slice(-4)}`); }, []);
  useEffect(() => {
    authApi.getMe().then(({ data }) => setAthleteName(data.name || '—')).catch(() => setAthleteName('—'));
  }, []);

  const videoRefs = useRef<Partial<Record<CamId, HTMLVideoElement | null>>>({});
  const mediaRecorders = useRef<Partial<Record<CamId, MediaRecorder>>>({});
  const chunks = useRef<Record<CamId, Blob[]>>({ left: [], back: [], right: [] });
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const cameraGridRef = useRef<HTMLDivElement | null>(null);

  const setVideoRef = useCallback((camId: CamId) => (el: HTMLVideoElement | null) => {
    videoRefs.current[camId] = el;
    if (el && streams[camId]) el.srcObject = streams[camId] ?? null;
  }, [streams]);

  /* ── Camera Init ──
     Strategy: request permission once, enumerate ALL video devices,
     then open each by exact deviceId. No label filtering — avoids
     misidentifying cameras connected via USB hub.
  */
  const detectCameras = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
    setDetectedCameras(videoDevices);
    const detectedIds = new Set(videoDevices.map((device) => device.deviceId));
    setCameraAssignments((current) => videoDevices.length === 3
      ? { left: videoDevices[0].deviceId, back: videoDevices[1].deviceId, right: videoDevices[2].deviceId }
      : {
        left: detectedIds.has(current.left) ? current.left : '',
        back: detectedIds.has(current.back) ? current.back : '',
        right: detectedIds.has(current.right) ? current.right : '',
      });
    return videoDevices;
  }, []);

  useEffect(() => {
    void detectCameras();
  }, [detectCameras]);

  const initCameras = useCallback(async () => {
    setTestMode(true);
    setAiStatus('INITIALIZING…');
    setCamActive({ left: false, back: false, right: false });
    setCameraErrors({});

    // Release previous browser camera locks before opening the selected USB devices.
    Object.values(streams).forEach((stream) => stream?.getTracks().forEach((track) => track.stop()));
    setStreams({});

    try {
      // Detect devices first when the user has not used the detector yet.
      const videoDevices = detectedCameras.length ? detectedCameras : await detectCameras();

      if (videoDevices.length === 0) {
        setAiStatus('NO CAMERAS FOUND');
        return;
      }

      // Open each selected camera independently so every preview owns its stream.
      const slots = CAM_CONFIG.slice(0, 3);
      const newStreams: Partial<Record<CamId, MediaStream>> = {};
      const usedDeviceIds = new Set<string>();

      for (let i = 0; i < slots.length; i++) {
        const { camId } = slots[i];
        const assignedDeviceId = cameraAssignments[camId] || videoDevices[i]?.deviceId;
        const device = videoDevices.find(item => item.deviceId === assignedDeviceId) || videoDevices[i];
        if (!device) {
          setCameraErrors((current) => ({ ...current, [camId]: 'No detected device assigned' }));
          continue;
        }
        if (usedDeviceIds.has(device.deviceId)) {
          setCameraErrors((current) => ({ ...current, [camId]: 'This device is already assigned to another position' }));
          continue;
        }
        usedDeviceIds.add(device.deviceId);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: device.deviceId },
              width: { ideal: 1080 },
              height: { ideal: 1920 },
              frameRate: { ideal: 30 },
            },
            audio: false,
          });
          newStreams[camId] = stream;
          if (videoRefs.current[camId]) videoRefs.current[camId]!.srcObject = stream;
          setCamActive(p => ({ ...p, [camId]: true }));
        } catch (err) {
          console.warn(`Camera slot ${i} (${device.label || device.deviceId}) failed:`, err);
          const reason = err instanceof DOMException ? err.name : 'Unable to open camera';
          setCameraErrors((current) => ({ ...current, [camId]: `${reason}: ${device.label || `device ${i + 1}`}` }));
        }
      }

      setStreams(newStreams);
      const count = Object.keys(newStreams).length;
      setAiStatus(count === 3 ? 'READY' : count > 0 ? `READY · ${count}/3 CAMS` : 'NO STREAM');
    } catch (err) {
      console.error('initCameras error:', err);
      setAiStatus('CAM ERROR');
    }
  }, [cameraAssignments, detectedCameras, streams, detectCameras]);

  const startRecording = () => {
    setRecording(true);
    setElapsed(0);
    setAiStatus('ANALYZING…');
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    CAM_CONFIG.forEach(({ camId }) => {
      const stream = streams[camId];
      if (!stream) return;
      chunks.current[camId] = [];
      try {
        const mimeType = MediaRecorder.isTypeSupported('video/mp4')
          ? 'video/mp4'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : '';
        const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mr.ondataavailable = e => { if (e.data.size > 0) chunks.current[camId].push(e.data); };
        mr.onstop = () => downloadFootage(camId, mimeType.startsWith('video/mp4') ? 'mp4' : 'webm');
        mr.start(100);
        mediaRecorders.current[camId] = mr;
      } catch {
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = e => { if (e.data.size > 0) chunks.current[camId].push(e.data); };
        mr.onstop = () => downloadFootage(camId, 'webm');
        mr.start(100);
        mediaRecorders.current[camId] = mr;
      }
    });
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    setAiStatus('PROCESSING…');
    CAM_CONFIG.forEach(({ camId }) => mediaRecorders.current[camId]?.stop());
    setTimeout(() => setAiStatus('COMPLETE'), 1500);
  };

  const downloadFootage = (camId: CamId, extension = 'webm') => {
    const blob = new Blob(chunks.current[camId], { type: extension === 'mp4' ? 'video/mp4' : 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${camId}. ${extension}`.replace('. ', '.');
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleCameraFullscreen = async () => {
    if (!cameraGridRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await cameraGridRef.current.requestFullscreen();
    }
  };

  const handleDetectCameras = async () => {
    setAiStatus('DETECTING CAMERAS…');
    try {
      const cameras = await detectCameras();
      setAiStatus(cameras.length ? `${cameras.length} CAM${cameras.length === 1 ? '' : 'S'} DETECTED` : 'NO CAMERAS FOUND');
    } catch {
      setAiStatus('CAMERA DETECTION FAILED');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === cameraGridRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={`${testMode ? 'flex h-screen min-h-0 flex-col overflow-hidden' : ''} p-4 md:p-6 max-w-[1600px]`}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 flex-wrap gap-4"
      >
        <div>
          <p className="text-[10px] font-mono text-spider-scarlet tracking-[0.3em] mb-1">PERFORMANCE LAB</p>
          <h1 className="font-display text-2xl md:text-3xl font-black text-spider-white">
            TRIPLE CAMERA <span className="text-gradient-crimson">CAPTURE</span>
          </h1>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CAM_CONFIG.map(({ camId, label }) => (
              <label key={camId} className="flex items-center gap-2 text-[9px] font-mono text-spider-dim tracking-widest uppercase">
                <span className="shrink-0">{label.replace(' CAMERA', '')}</span>
                <select
                  value={cameraAssignments[camId]}
                  onChange={(event) => setCameraAssignments((current) => ({ ...current, [camId]: event.target.value }))}
                  className="spider-input min-w-0 w-full rounded-lg px-2 py-2 text-[9px] tracking-normal bg-spider-black/70"
                  aria-label={`Select device for ${label}`}
                >
                  <option value="">Detect cameras first</option>
                  {detectedCameras.map((camera, index) => (
                    <option
                      key={camera.deviceId}
                      value={camera.deviceId}
                      disabled={Object.entries(cameraAssignments).some(([position, deviceId]) => position !== camId && deviceId === camera.deviceId)}
                    >
                      {camera.label || `Camera ${index + 1}`} ({index + 1})
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="px-4 py-2 rounded-xl bg-spider-graphite/60 border border-spider-scarlet/20 font-display text-xl font-bold text-spider-white tabular-nums">
            {fmt(elapsed)}
          </div>
          {/* AI Status */}
          <div className="px-3 py-2 rounded-xl bg-spider-void border border-spider-scarlet/20 flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-spider-scarlet"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono text-spider-scarlet tracking-widest">{aiStatus}</span>
          </div>
        </div>
      </motion.div>

      {/* ── 3 Cameras — Horizontal Row ── */}
      <motion.div
        ref={cameraGridRef}
        layout
        className={`${isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen overflow-auto p-5 md:p-8' : testMode ? 'flex min-h-0 flex-1 flex-col p-2 md:p-3' : 'p-2 md:p-3'} bg-spider-void`}
      >
        <div
          className={`${isFullscreen
              ? 'h-[calc(100vh-76px)]'
              : testMode
                ? 'min-h-0 flex-1'
                : ''
            } grid ${testMode
              ? 'grid-cols-3 gap-6 items-start'
              : 'grid-cols-1 md:grid-cols-3'
            }`}
        >
          {CAM_CONFIG.map(({ camId, label }) => (
            <CameraPanel
              key={camId}
              camId={camId}
              label={label}
              active={camActive[camId]}
              onRef={setVideoRef(camId)}
              recording={recording}
              fullscreen={isFullscreen}
              testMode={testMode}
              error={cameraErrors[camId]}
            />
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <SpiderButton
            id="camera-fullscreen"
            variant="secondary"
            size="sm"
            onClick={toggleCameraFullscreen}
          >
            ⛶ Fullscreen cameras
          </SpiderButton>
        </div>
      </motion.div>

      {/* ── Athlete Info + Controls ── */}
      <motion.div
        layout
        animate={testMode ? { y: '110vh', opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`${testMode ? 'pointer-events-none absolute top-full left-0 right-0' : ''} grid md:grid-cols-2 gap-4`}
      >
        <GlassCard className="p-6">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-4 uppercase">Athlete Info</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Name', value: athleteName },
              { label: 'Session', value: sessionId },
              { label: 'Speed', value: '—' },
              { label: 'Protocol', value: 'Camera capture' },
            ].map(f => (
              <div key={f.label} className="px-3 py-2.5 rounded-lg bg-spider-void/60 border border-spider-scarlet/10">
                <p className="text-[9px] font-mono text-spider-dim mb-1">{f.label}</p>
                <p className="text-sm font-semibold text-spider-white">{f.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col gap-4">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest uppercase">Controls</p>
          <div className="flex flex-col gap-3">
            <SpiderButton id="detect-cameras" variant="ghost" size="md" fullWidth onClick={handleDetectCameras}>
              ◉ Detect Cameras
            </SpiderButton>
            <SpiderButton id="init-cameras" variant="electric" size="md" fullWidth onClick={initCameras}>
              ◉ Initialize Selected Cameras
            </SpiderButton>
            {!recording ? (
              <SpiderButton id="start-recording" variant="primary" size="md" fullWidth onClick={startRecording}>
                ▶ Start Recording
              </SpiderButton>
            ) : (
              <SpiderButton id="stop-recording" variant="danger" size="md" fullWidth onClick={stopRecording}>
                ■ Stop Recording
              </SpiderButton>
            )}
            <div className="grid grid-cols-3 gap-2">
              {CAM_CONFIG.map(({ camId }) => (
                <SpiderButton key={camId} variant="ghost" size="sm" onClick={() => downloadFootage(camId)}>
                  ↓ {camId}
                </SpiderButton>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
