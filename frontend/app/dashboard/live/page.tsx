'use client';
// app/dashboard/live/page.tsx — Triple Camera Capture Lab
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpiderButton from '@/components/ui/SpiderButton';
import GlassCard from '@/components/ui/GlassCard';

// Body keypoints for overlay (relative %)
const KEYPOINTS = [
  { id: 'head',      label: 'HEAD',      x: 50, y: 8  },
  { id: 'l-shoulder',label: 'L.SHOULDER',x: 35, y: 20 },
  { id: 'r-shoulder',label: 'R.SHOULDER',x: 65, y: 20 },
  { id: 'hip',       label: 'HIP',       x: 50, y: 42 },
  { id: 'l-hip',     label: 'L.HIP',     x: 38, y: 42 },
  { id: 'r-hip',     label: 'R.HIP',     x: 62, y: 42 },
  { id: 'l-knee',    label: 'L.KNEE',    x: 36, y: 62 },
  { id: 'r-knee',    label: 'R.KNEE',    x: 64, y: 62 },
  { id: 'l-hand',    label: 'L.HAND',    x: 25, y: 45 },
  { id: 'r-hand',    label: 'R.HAND',    x: 75, y: 45 },
  { id: 'l-ankle',   label: 'L.ANKLE',   x: 36, y: 80 },
  { id: 'r-ankle',   label: 'R.ANKLE',   x: 64, y: 80 },
];

// Skeleton connections
const SKELETON = [
  ['head','l-shoulder'],['head','r-shoulder'],
  ['l-shoulder','r-shoulder'],
  ['l-shoulder','l-hip'],['r-shoulder','r-hip'],
  ['l-hip','r-hip'],['hip','l-hip'],['hip','r-hip'],
  ['l-hip','l-knee'],['r-hip','r-knee'],
  ['l-knee','l-ankle'],['r-knee','r-ankle'],
  ['l-shoulder','l-hand'],['r-shoulder','r-hand'],
];

const kpMap = Object.fromEntries(KEYPOINTS.map(k => [k.id, k]));

type CamId = 'left' | 'back' | 'right';

function CameraPanel({
  camId, label, active, onRef, recording,
}: {
  camId: CamId; label: string; active: boolean; onRef: (el: HTMLVideoElement | null) => void; recording: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-3">
      {/* Camera label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${recording ? 'bg-spider-scarlet animate-pulse' : 'bg-spider-dim'}`} />
          <span className="font-display text-xs tracking-widest text-spider-scarlet uppercase">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-spider-dim">{camId.toUpperCase()} · CAM</span>
      </div>

      {/* Video frame */}
      <div className="relative aspect-video bg-spider-black rounded-xl overflow-hidden web-border group">
        {/* Scan line */}
        {recording && (
          <div className="scan-overlay">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-spider-scarlet/80 to-transparent animate-scan-line" style={{ animation: 'scanLineAnim 2.5s linear infinite' }} />
          </div>
        )}

        {/* Video element */}
        <video ref={onRef} autoPlay muted playsInline className="w-full h-full object-cover" />

        {/* Placeholder when no camera */}
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-spider-black/90">
            <svg viewBox="0 0 80 60" fill="none" className="w-20 h-16 mb-3 opacity-30">
              <rect x="5" y="10" width="55" height="40" rx="5" stroke="rgba(220,20,60,0.6)" strokeWidth="1.5"/>
              <polygon points="65,20 75,30 65,40" fill="rgba(220,20,60,0.4)"/>
              <circle cx="32" cy="30" r="8" stroke="rgba(220,20,60,0.4)" strokeWidth="1"/>
              <circle cx="32" cy="30" r="3" fill="rgba(220,20,60,0.3)"/>
            </svg>
            <p className="text-[10px] font-mono text-spider-dim tracking-widest">CAMERA STANDBY</p>
            <p className="text-[8px] font-mono text-spider-scarlet/50 mt-1">{label} POSITION</p>
          </div>
        )}

        {/* AI keypoint overlay (SVG) */}
        {active && recording && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            {/* Skeleton lines */}
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
            {/* Keypoints */}
            {KEYPOINTS.map((kp) => (
              <g key={kp.id}>
                <motion.circle
                  cx={`${kp.x}%`} cy={`${kp.y}%`} r="4"
                  fill="rgba(220,20,60,0.85)"
                  stroke="rgba(255,100,120,0.5)" strokeWidth="1"
                  animate={{ r: [4, 5.5, 4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 0.5 }}
                />
              </g>
            ))}
          </svg>
        )}

        {/* Corner web borders */}
        <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-spider-scarlet/60 pointer-events-none" />
        <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-spider-scarlet/60 pointer-events-none" />
        <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-spider-scarlet/60 pointer-events-none" />
        <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-spider-scarlet/60 pointer-events-none" />

        {/* AI status chip */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-spider-black/80 border border-spider-scarlet/20">
          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400 animate-pulse' : 'bg-spider-dim'}`} />
          <span className="text-[8px] font-mono text-spider-dim">{active ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>
    </div>
  );
}

export default function LiveCapturePage() {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [camActive, setCamActive] = useState({ left: false, back: false, right: false });
  const [aiStatus, setAiStatus] = useState('STANDBY');
  const [streams, setStreams] = useState<{ left?: MediaStream; back?: MediaStream; right?: MediaStream }>({});

  const videoRefs = useRef<{ left?: HTMLVideoElement | null; back?: HTMLVideoElement | null; right?: HTMLVideoElement | null }>({});
  const mediaRecorders = useRef<{ left?: MediaRecorder; back?: MediaRecorder; right?: MediaRecorder }>({});
  const chunks = useRef<{ left: Blob[]; back: Blob[]; right: Blob[] }>({ left: [], back: [], right: [] });
  const timerRef = useRef<NodeJS.Timeout>();

  const setVideoRef = useCallback((camId: CamId) => (el: HTMLVideoElement | null) => {
    videoRefs.current[camId] = el;
    if (el && streams[camId]) el.srcObject = streams[camId] ?? null;
  }, [streams]);

  const initCameras = async () => {
    setAiStatus('INITIALIZING…');
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      const getStream = async (deviceId?: string) =>
        navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        });

      const cams: CamId[] = ['left', 'back', 'right'];
      const newStreams: typeof streams = {};

      for (let i = 0; i < cams.length; i++) {
        const camId = cams[i];
        try {
          const stream = await getStream(videoDevices[i]?.deviceId);
          newStreams[camId] = stream;
          if (videoRefs.current[camId]) videoRefs.current[camId]!.srcObject = stream;
          setCamActive(p => ({ ...p, [camId]: true }));
        } catch {
          // Camera not available — show placeholder
        }
      }
      setStreams(newStreams);
      setAiStatus('READY');
    } catch {
      setAiStatus('CAM ERROR');
    }
  };

  const startRecording = () => {
    setRecording(true);
    setElapsed(0);
    setAiStatus('ANALYZING…');

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    (['left', 'back', 'right'] as CamId[]).forEach(camId => {
      const stream = streams[camId];
      if (!stream) return;
      chunks.current[camId] = [];
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.current[camId].push(e.data); };
      mr.start(100);
      mediaRecorders.current[camId] = mr;
    });
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    setAiStatus('PROCESSING…');
    (['left', 'back', 'right'] as CamId[]).forEach(camId => {
      mediaRecorders.current[camId]?.stop();
    });
    setTimeout(() => setAiStatus('COMPLETE'), 1500);
  };

  const downloadFootage = (camId: CamId) => {
    const blob = new Blob(chunks.current[camId], { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spider-track-${camId}-cam-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="p-4 md:p-6 max-w-[1400px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-mono text-spider-scarlet tracking-[0.3em] mb-1">PERFORMANCE LAB</p>
          <h1 className="font-display text-2xl md:text-3xl font-black text-spider-white">TRIPLE CAMERA <span className="text-gradient-crimson">CAPTURE</span></h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="px-4 py-2 rounded-xl bg-spider-graphite/60 border border-spider-scarlet/20 font-display text-xl font-bold text-spider-white tabular-nums">
            {fmt(elapsed)}
          </div>
          {/* AI Status */}
          <div className="px-3 py-2 rounded-xl bg-spider-void border border-spider-scarlet/20 flex items-center gap-2">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-spider-scarlet" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-[10px] font-mono text-spider-scarlet tracking-widest">{aiStatus}</span>
          </div>
        </div>
      </motion.div>

      {/* Camera Grid + Body Silhouette */}
      <div className="grid xl:grid-cols-7 gap-4 mb-6">
        {/* Left Camera */}
        <div className="xl:col-span-3">
          <CameraPanel camId="left" label="LEFT CAMERA" active={camActive.left} onRef={setVideoRef('left')} recording={recording} />
        </div>

        {/* Center — 3D Body Silhouette */}
        <div className="xl:col-span-1 flex flex-col items-center justify-center">
          <GlassCard className="p-3 w-full">
            <p className="text-[8px] font-mono text-spider-scarlet tracking-widest text-center mb-2">CAPTURE ANGLES</p>
            <div className="relative aspect-[1/2] flex items-center justify-center">
              <svg viewBox="0 0 120 240" fill="none" className="w-full h-full">
                {/* Body */}
                <ellipse cx="60" cy="20" rx="12" ry="14" fill="rgba(220,20,60,0.12)" stroke="rgba(220,20,60,0.4)" strokeWidth="1.2"/>
                <rect x="46" y="36" width="28" height="55" rx="4" fill="rgba(220,20,60,0.08)" stroke="rgba(220,20,60,0.35)" strokeWidth="1"/>
                <rect x="28" y="40" width="16" height="44" rx="4" fill="rgba(220,20,60,0.06)" stroke="rgba(220,20,60,0.25)" strokeWidth="0.8"/>
                <rect x="76" y="40" width="16" height="44" rx="4" fill="rgba(220,20,60,0.06)" stroke="rgba(220,20,60,0.25)" strokeWidth="0.8"/>
                <rect x="48" y="93" width="11" height="62" rx="4" fill="rgba(220,20,60,0.08)" stroke="rgba(220,20,60,0.35)" strokeWidth="1"/>
                <rect x="61" y="93" width="11" height="62" rx="4" fill="rgba(220,20,60,0.08)" stroke="rgba(220,20,60,0.35)" strokeWidth="1"/>
                {/* Keypoint dots */}
                {[[60,20],[46,43],[74,43],[60,93],[48,125],[70,125],[48,156],[70,156]].map(([x,y],i)=>(
                  <motion.circle key={i} cx={x} cy={y} r="3" fill="rgba(220,20,60,0.85)"
                    animate={{r:[3,4,3]}} transition={{duration:1.5,repeat:Infinity,delay:i*0.2}}/>
                ))}
                {/* Camera indicators */}
                <text x="2" y="130" fill="rgba(79,195,247,0.8)" fontSize="6" fontFamily="monospace">◀L</text>
                <text x="106" y="130" fill="rgba(79,195,247,0.8)" fontSize="6" fontFamily="monospace">R▶</text>
                <text x="45" y="238" fill="rgba(79,195,247,0.8)" fontSize="6" fontFamily="monospace">▼BACK</text>
                {/* Angle arcs */}
                <path d="M10,130 Q 60,100 110,130" stroke="rgba(79,195,247,0.2)" strokeWidth="0.8" strokeDasharray="3 4" fill="none"/>
              </svg>
            </div>
          </GlassCard>
        </div>

        {/* Right Camera */}
        <div className="xl:col-span-3">
          <CameraPanel camId="right" label="RIGHT CAMERA" active={camActive.right} onRef={setVideoRef('right')} recording={recording} />
        </div>
      </div>

      {/* Back Camera (full width) */}
      <div className="mb-6">
        <CameraPanel camId="back" label="BACK CAMERA" active={camActive.back} onRef={setVideoRef('back')} recording={recording} />
      </div>

      {/* Athlete Info + Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard className="p-6">
          <p className="text-[10px] font-mono text-spider-scarlet tracking-widest mb-4 uppercase">Athlete Info</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Name', value: 'John Athlete' },
              { label: 'Session', value: `#${String(Date.now()).slice(-4)}` },
              { label: 'Speed', value: '8.5 km/h' },
              { label: 'Protocol', value: '5-min Run' },
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
            <SpiderButton id="init-cameras" variant="electric" size="md" fullWidth onClick={initCameras}>
              ◉ Initialize Cameras
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
              {(['left', 'back', 'right'] as CamId[]).map(cam => (
                <SpiderButton key={cam} variant="ghost" size="sm" onClick={() => downloadFootage(cam)}>
                  ↓ {cam}
                </SpiderButton>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
