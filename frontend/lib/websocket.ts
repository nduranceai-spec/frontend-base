// lib/websocket.ts
// NDURANCE AI — WebSocket Camera Stream Manager

import { CameraId, CameraAnalysisFrame } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export type WsMessageHandler = (data: CameraAnalysisFrame) => void;
export type WsStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

export class CameraWebSocket {
  private ws: WebSocket | null = null;
  private cameraId: CameraId;
  private onMessage: WsMessageHandler;
  private onStatus: WsStatusHandler;
  private reconnectAttempts = 0;
  private maxReconnects = 3;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isClosed = false;

  constructor(
    cameraId: CameraId,
    onMessage: WsMessageHandler,
    onStatus: WsStatusHandler,
    heightCm = 175,
  ) {
    this.cameraId = cameraId;
    this.onMessage = onMessage;
    this.onStatus = onStatus;
  }

  connect(userId?: string, heightCm = 175): void {
    this.isClosed = false;
    const params = new URLSearchParams({
      height_cm: heightCm.toString(),
      fps: '30',
      ...(userId ? { user_id: userId } : {}),
    });

    const url = `${WS_URL}/ws/camera/${this.cameraId}?${params}`;
    this.onStatus('connecting');

    try {
      this.ws = new WebSocket(url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onStatus('connected');
        console.log(`[WS] Camera '${this.cameraId}' connected`);
      };

      this.ws.onmessage = (event) => {
        try {
          if (typeof event.data !== 'string') return;
          const data = JSON.parse(event.data);

          const msgType = data?.type;
          if (msgType === 'analysis') {
            this.onMessage(data as CameraAnalysisFrame);
          } else if (msgType === 'connected') {
            console.log(`[WS] Camera '${this.cameraId}' ready:`, data.message);
          } else if (msgType === 'pong' || msgType === 'config_ack') {
            // ignore control messages
          } else {
            console.debug('[WS] Ignored message type:', msgType, data);
          }
        } catch (e) {
          console.warn('[WS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.onStatus('disconnected');
        if (!this.isClosed && this.reconnectAttempts < this.maxReconnects) {
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => this.connect(userId, heightCm), 2000);
        }
      };

      this.ws.onerror = (event) => {
        console.error(`[WS] Camera '${this.cameraId}' websocket error:`, event);
        this.onStatus('error');
      };

      this.ws.onerror = () => {
        this.onStatus('error');
      };
    } catch (e) {
      console.error('[WS] Connection error:', e);
      this.onStatus('error');
    }
  }

  /** Send a raw JPEG frame as binary data */
  sendFrame(jpegBlob: Blob): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      jpegBlob.arrayBuffer().then((buf) => this.ws?.send(buf));
    }
  }

  /** Send a JPEG from a canvas element */
  sendCanvasFrame(canvas: HTMLCanvasElement, quality = 0.7): void {
    canvas.toBlob(
      (blob) => { if (blob) this.sendFrame(blob); },
      'image/jpeg',
      quality
    );
  }

  ping(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }

  disconnect(): void {
    this.isClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
