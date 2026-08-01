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

type VideoOrientation = 'portrait' | 'landscape';

/* ─── Camera Panel ─── */
const CameraPanel = memo(function CameraPanel({
  camId, label, active, onRef, recording, fullscreen, testMode, error, videoOrientation,
}: {
  camId: CamId; label: string; active: boolean;
  onRef: (el: HTMLVideoElement | null) => void; recording: boolean; fullscreen: boolean;
  testMode: boolean; error?: string; videoOrientation: VideoOrientation;
}) {
  return (
    <div className="flex h-full flex-col gap-2 min-w-0">
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
        className={`relative w-full ${fullscreen
          ? 'h-full min-h-[260px]'
          : 'aspect-[9/16] min-h-[320px] sm:min-h-[420px] md:h-[74vh] lg:h-[80vh]'
        } bg-spider-black rounded-xl overflow-hidden web-border`}
      >
      {/* Scan line while recording */}
      {recording && (
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-spider-scarlet/80 to-transparent z-10"
          style={{ animation: 'scanLineAnim 2.5s linear infinite' }} />
      )}

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-spider-black">
        <video
          ref={onRef}
          autoPlay
          muted
          playsInline
          className="block bg-spider-black"
          style={{
            width: '100vh',
            height: '100vw',
            maxWidth: 'none',
            maxHeight: 'none',
            objectFit: 'cover',
            objectPosition: 'center center',
            transform: 'rotate(180deg)',
            transformOrigin: 'center center',
          }}
        />
      </div>

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
  const [videoOrientation, setVideoOrientation] = useState<Record<CamId, VideoOrientation>>({
    left: 'portrait',
    back: 'portrait',
    right: 'portrait',
  });

  const streamsRef = useRef<Partial<Record<CamId, MediaStream>>>({});
  const activeStreamsRef = useRef<Partial<Record<CamId, MediaStream>>>({});
  const videoOrientationRef = useRef<Record<CamId, VideoOrientation>>({
    left: 'portrait',
    back: 'portrait',
    right: 'portrait',
  });
  const autoDetectionStartedRef = useRef(false);
  const initInProgressRef = useRef(false);
  const cameraInitLocksRef = useRef<Record<CamId, boolean>>({ left: false, back: false, right: false });
  const playPromisesRef = useRef<Partial<Record<CamId, Promise<void>>>>({});

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

  const applyCameraOrientation = useCallback((camId: CamId, stream: MediaStream | null, videoEl: HTMLVideoElement | null) => {
    if (!stream || !videoEl) return;

    const videoTrack = stream.getVideoTracks?.()[0];
    const settings = videoTrack?.getSettings?.() || {};
    const width = typeof settings.width === 'number' ? settings.width : undefined;
    const height = typeof settings.height === 'number' ? settings.height : undefined;
    const nextOrientation = width && height && width > height ? 'landscape' : 'portrait';
    const currentOrientation = videoOrientationRef.current[camId] ?? 'portrait';

    if (currentOrientation !== nextOrientation) {
      videoOrientationRef.current[camId] = nextOrientation;
      setVideoOrientation((current) => ({ ...current, [camId]: nextOrientation }));
    }

    videoEl.style.transform = 'rotate(180deg)';
    videoEl.style.transformOrigin = 'center center';
    videoEl.style.objectFit = 'contain';
    videoEl.style.objectPosition = 'center center';
  }, []);

  const stopCameraStream = useCallback((camId: CamId, streamOverride?: MediaStream | null) => {
    const stream = streamOverride ?? streamsRef.current[camId] ?? activeStreamsRef.current[camId];
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log(`[camera] ${camId} cleanup executed`, { kind: track.kind });
      });
    }

    const videoEl = videoRefs.current[camId];
    if (videoEl) {
      videoEl.pause?.();
      if (videoEl.srcObject) {
        console.log(`[camera] ${camId} cleanup executed before replacing srcObject`);
      }
      videoEl.srcObject = null;
    }

    if (streamsRef.current[camId] === stream) {
      delete streamsRef.current[camId];
    }
    if (activeStreamsRef.current[camId] === stream) {
      delete activeStreamsRef.current[camId];
    }
    if (playPromisesRef.current[camId]) {
      playPromisesRef.current[camId] = undefined;
    }
  }, []);

  const attachStreamToVideo = useCallback(async (camId: CamId, stream: MediaStream | null, videoEl: HTMLVideoElement | null) => {
    if (!stream || !videoEl) return;

    const currentStream = videoEl.srcObject instanceof MediaStream ? videoEl.srcObject : null;
    if (currentStream === stream) {
      console.log(`[camera] ${camId} srcObject already attached`);
      return;
    }

    const pendingPlay = playPromisesRef.current[camId];
    if (pendingPlay) {
      console.log(`[camera] ${camId} play() still pending, waiting before replacing srcObject`);
      try {
        await pendingPlay;
      } catch (error) {
        console.warn(`[camera] ${camId} previous play() settled with error`, error);
      }
    }

    const previousStream = activeStreamsRef.current[camId];
    if (previousStream && previousStream !== stream) {
      stopCameraStream(camId, previousStream);
    }

    videoEl.pause?.();
    videoEl.srcObject = null;

    console.log(`[camera] ${camId} srcObject assigned`);
    videoEl.srcObject = stream;
    videoEl.muted = true;
    applyCameraOrientation(camId, stream, videoEl);

    const waitForMetadata = () => new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        videoEl.removeEventListener('loadedmetadata', onLoadedMetadata);
        videoEl.removeEventListener('error', onError);
      };
      const onLoadedMetadata = () => {
        console.log(`[camera] ${camId} loadedmetadata fired`);
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('video metadata failed'));
      };

      if (videoEl.readyState >= 2) {
        cleanup();
        resolve();
        return;
      }

      videoEl.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
      videoEl.addEventListener('error', onError, { once: true });
    });

    try {
      await waitForMetadata();
    } catch (error) {
      console.error(`[camera] ${camId} metadata wait failed`, error);
      return;
    }

    console.log(`[camera] ${camId} play() started`);
    const playPromise = videoEl.play();
    playPromisesRef.current[camId] = playPromise;

    try {
      await playPromise;
      console.log(`[camera] ${camId} play() succeeded`);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.warn(`[camera] ${camId} play() aborted safely`, error);
      } else {
        console.error(`[camera] ${camId} play() failed`, error);
      }
    } finally {
      if (playPromisesRef.current[camId] === playPromise) {
        playPromisesRef.current[camId] = undefined;
      }
    }
  }, [applyCameraOrientation, stopCameraStream]);

  const setVideoRef = useCallback((camId: CamId) => (el: HTMLVideoElement | null) => {
    videoRefs.current[camId] = el;
    if (el) {
      const stream = streamsRef.current[camId] ?? activeStreamsRef.current[camId];
      if (stream) {
        void attachStreamToVideo(camId, stream, el);
      }
    }
  }, [attachStreamToVideo]);

  const stopAllStreams = useCallback(() => {
    console.log('[camera] stopping all previous MediaStream tracks');
    (Object.keys(activeStreamsRef.current) as CamId[]).forEach((camId) => {
      const stream = activeStreamsRef.current[camId];
      if (stream) {
        stopCameraStream(camId, stream);
      }
    });

    Object.values(videoRefs.current).forEach((videoEl) => {
      if (videoEl) {
        videoEl.pause?.();
        videoEl.srcObject = null;
      }
    });

    streamsRef.current = {};
    activeStreamsRef.current = {};
  }, [stopCameraStream]);

  const releaseCameraResources = useCallback(() => {
    stopAllStreams();
    setStreams({});
    setCamActive({ left: false, back: false, right: false });
    setCameraErrors({});
  }, [stopAllStreams]);

  const openCameraWithRetry = useCallback(async (camId: CamId, selectedDeviceId: string, cameraLabel: string) => {
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: { exact: selectedDeviceId },
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 },
      },
      audio: false,
    };

    console.log(`[camera] ${camId} stream creation started`, { selectedDeviceId, cameraLabel, constraints });

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(`[camera] ${camId} stream created successfully`, { selectedDeviceId, cameraLabel, stream });
      return stream;
    } catch (error) {
      console.error(`[camera] ${camId} getUserMedia failed`, { selectedDeviceId, cameraLabel, error });
      if (error instanceof DOMException && error.name === 'NotReadableError') {
        console.warn(`[camera] ${camId} NotReadableError, retrying once`, error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const retryStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(`[camera] ${camId} stream created successfully after retry`, { selectedDeviceId, cameraLabel, retryStream });
        return retryStream;
      }
      throw error;
    }
  }, []);

  /* ── Camera Init ──
     Strategy: request permission once, enumerate ALL video devices,
     then open each by exact deviceId. No label filtering — avoids
     misidentifying cameras connected via USB hub.
  */
  const detectCameras = useCallback(async () => {
    console.log('[camera] detectCameras invoked');
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.warn('[camera] navigator.mediaDevices.enumerateDevices is unavailable');
      setAiStatus('CAMERA DETECTION FAILED');
      return [];
    }

    console.log('[camera] navigator.mediaDevices exists', !!navigator.mediaDevices);

    try {
      console.log('[camera] requesting camera permission before enumeration');
      if (navigator.mediaDevices.getUserMedia) {
        const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        permissionStream.getTracks().forEach((track) => track.stop());
        console.log('[camera] permission granted');
      }
    } catch (permissionError) {
      console.warn('[camera] permission request failed or was denied', permissionError);
      setAiStatus('CAMERA PERMISSION REQUIRED');
      return [];
    }

    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      console.log('[camera] all detected devices', allDevices);

      const videoDevices = allDevices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput');
      const externalBrioDevices = videoDevices.filter((device) => {
        const label = (device.label || '').toLowerCase();
        const isInternal = label.includes('integrated') || label.includes('built-in') || label.includes('builtin') || label.includes('facetime') || label.includes('face time');
        const isLogitechBrio = label.includes('logitech') && label.includes('brio');
        return isLogitechBrio && !isInternal;
      });

      console.log('[camera] filtered video devices', videoDevices);
      console.log('[camera] filtered external BRIO devices', externalBrioDevices);

      videoDevices.forEach((device) => {
        const label = (device.label || '').toLowerCase();
        const isInternal = label.includes('integrated') || label.includes('built-in') || label.includes('builtin') || label.includes('facetime') || label.includes('face time');
        const isLogitechBrio = label.includes('logitech') && label.includes('brio');
        if (!isLogitechBrio || isInternal) {
          console.log('[camera] ignored non-BRIO or internal webcam', device.label || device.deviceId, device.deviceId);
        }
      });

      setDetectedCameras(externalBrioDevices);
      const nextAssignments = { left: '', back: '', right: '' } as Record<CamId, string>;
      const brioIds = externalBrioDevices.map((device) => device.deviceId);

      if (externalBrioDevices.length === 3) {
        nextAssignments.left = brioIds[0];
        nextAssignments.back = brioIds[1];
        nextAssignments.right = brioIds[2];
        console.log('[camera] auto-assigned BRIO devices', nextAssignments);
        setAiStatus('3 BRIO CAMERAS READY');
      } else {
        console.warn('[camera] expected 3 external BRIO cameras, found', externalBrioDevices.length);
        setAiStatus('Please connect 3 Logitech BRIO USB cameras.');
      }

      setCameraAssignments(nextAssignments);
      console.log('[camera] final assignment state', nextAssignments);
      return externalBrioDevices;
    } catch (error) {
      console.error('[camera] enumerateDevices failed', error);
      setAiStatus('CAMERA DETECTION FAILED');
      return [];
    }
  }, []);

  useEffect(() => {
    if (autoDetectionStartedRef.current) return;
    autoDetectionStartedRef.current = true;
    console.log('[camera] mounting live capture page, running initial detection once');
    void detectCameras();
  }, [detectCameras]);

  const initCameras = useCallback(async () => {
    if (initInProgressRef.current) {
      console.log('[camera] initialization already in progress, skipping duplicate call');
      return;
    }

    initInProgressRef.current = true;
    console.log('[camera] initCameras invoked');
    setTestMode(true);
    setAiStatus('INITIALIZING…');
    setCameraErrors({});
    await stopAllStreams();

    try {
      const videoDevices = detectedCameras.length ? detectedCameras : await detectCameras();
      console.log('[camera] using devices for initialization', videoDevices);

      if (videoDevices.length === 0) {
        setAiStatus('NO CAMERAS FOUND');
        return;
      }

      const newStreams: Partial<Record<CamId, MediaStream>> = {};
      const usedDeviceIds = new Set<string>();
      const slots = CAM_CONFIG.slice(0, 3);

      for (let i = 0; i < slots.length; i++) {
        const { camId } = slots[i];
        const desiredDeviceId = cameraAssignments[camId] || videoDevices[i]?.deviceId || '';
        const candidateDevice = videoDevices.find((item) => item.deviceId === desiredDeviceId) || videoDevices[i];
        const device = candidateDevice && !usedDeviceIds.has(candidateDevice.deviceId)
          ? candidateDevice
          : videoDevices.find((item) => !usedDeviceIds.has(item.deviceId));

        if (!device) {
          console.warn(`[camera] no device available for ${camId}`);
          setCameraErrors((current) => ({ ...current, [camId]: 'No detected device assigned' }));
          continue;
        }

        if (usedDeviceIds.has(device.deviceId)) {
          console.warn(`[camera] duplicate device id skipped for ${camId}`, device.deviceId);
          setCameraErrors((current) => ({ ...current, [camId]: 'This device is already assigned to another position' }));
          continue;
        }

        usedDeviceIds.add(device.deviceId);
        console.log(`[camera] ${camId} selected deviceId=${device.deviceId} label=${device.label || 'Unknown camera'}`);

        try {
          if (cameraInitLocksRef.current[camId]) {
            console.warn(`[camera] ${camId} initialization already in progress, skipping duplicate request`);
            continue;
          }

          cameraInitLocksRef.current[camId] = true;
          const stream = await openCameraWithRetry(camId, device.deviceId, device.label || 'Unknown camera');
          newStreams[camId] = stream;
          streamsRef.current[camId] = stream;
          activeStreamsRef.current[camId] = stream;
          const videoEl = videoRefs.current[camId];
          if (videoEl) {
            await attachStreamToVideo(camId, stream, videoEl);
          }
          setCamActive((current) => ({ ...current, [camId]: true }));
          setStreams((current) => ({ ...current, [camId]: stream }));
          cameraInitLocksRef.current[camId] = false;
        } catch (err) {
          console.error(`[camera] ${camId} stream init failed`, err);
          const reason = err instanceof DOMException ? err.name : 'Unable to open camera';
          setCameraErrors((current) => ({ ...current, [camId]: `${reason}: ${device.label || `device ${i + 1}`}` }));
        } finally {
          cameraInitLocksRef.current[camId] = false;
        }
      }

      const count = Object.keys(newStreams).length;
      console.log('[camera] final assignment state', cameraAssignments);
      console.log('[camera] final stream state', newStreams);
      setAiStatus(count === 3 ? 'READY' : count > 0 ? `READY · ${count}/3 CAMS` : 'NO STREAM');
    } catch (err) {
      console.error('initCameras error:', err);
      setAiStatus('CAM ERROR');
    } finally {
      initInProgressRef.current = false;
    }
  }, [attachStreamToVideo, applyCameraOrientation, cameraAssignments, detectedCameras, stopAllStreams, detectCameras, openCameraWithRetry]);

  const startRecording = () => {
    setRecording(true);
    setElapsed(0);
    setAiStatus('ANALYZING…');
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    CAM_CONFIG.forEach(({ camId }) => {
      const stream = streamsRef.current[camId] ?? streams[camId];
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
    console.log('[camera] Detect Cameras button clicked');
    setAiStatus('DETECTING CAMERAS…');
    try {
      const cameras = await detectCameras();
      console.log('[camera] detectCameras returned', cameras);
      setAiStatus(cameras.length ? `${cameras.length} CAM${cameras.length === 1 ? '' : 'S'} DETECTED` : 'NO CAMERAS FOUND');
    } catch (error) {
      console.error('[camera] detectCameras failed', error);
      setAiStatus('CAMERA DETECTION FAILED');
    }
  };

  const handleAssignmentChange = (camId: CamId, nextValue: string) => {
    setCameraAssignments((current) => {
      const isDuplicate = Object.entries(current).some(([position, deviceId]) => position !== camId && deviceId === nextValue && nextValue);
      if (isDuplicate) {
        console.warn('[camera] duplicate assignment prevented', { camId, nextValue });
        return current;
      }
      return { ...current, [camId]: nextValue };
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === cameraGridRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => () => {
    console.log('[camera] component unmounting, cleaning up streams');
    stopAllStreams();
  }, [stopAllStreams]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className={`${testMode ? 'flex min-h-screen flex-col overflow-hidden' : 'min-h-screen'} p-4 md:p-6 max-w-[1600px] mx-auto overflow-x-hidden`}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-wrap items-center justify-between gap-4"
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
                  onChange={(event) => handleAssignmentChange(camId, event.target.value)}
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
        className={`${isFullscreen ? 'fixed inset-0 z-[100] h-screen w-screen overflow-auto p-5 md:p-8' : 'flex flex-col p-2 md:p-3'} bg-spider-void`}
      >
        <div
          className={`${isFullscreen ? 'h-[calc(100vh-76px)]' : 'min-h-[72vh] sm:min-h-[76vh] md:min-h-[78vh] lg:min-h-[84vh]'} grid ${isFullscreen ? 'grid-cols-3 gap-4 items-stretch' : 'grid-cols-1 gap-3 md:grid-cols-3 md:gap-4'}`}
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
              videoOrientation={videoOrientation[camId]}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-center md:justify-start">
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
        className="mt-6 grid gap-4 md:grid-cols-2"
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
