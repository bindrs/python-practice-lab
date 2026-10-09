import { ClassroomUser, WebRTCSignalData } from '../components/classroomTypes';
import { classroomSync } from './classroomSync';
import { insforgeService } from './insforgeService';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class WebRTCService {
  private static instance: WebRTCService | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private localStream: MediaStream | null = null;
  private currentUser: ClassroomUser | null = null;
  private remoteStreamListeners: Array<(remoteStreams: Map<string, MediaStream>) => void> = [];
  private speakingListeners: Array<(speakingMap: Record<string, boolean>) => void> = [];
  private speakingMap: Record<string, boolean> = {};

  // Audio level monitoring
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioMonitorInterval: any = null;
  private signalPollInterval: any = null;
  private lastSignalTimestamp: number = 0;
  private processedSignalIds = new Set<string>();

  public static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  constructor() {
    classroomSync.onWebRTCSignal((signalData) => {
      this.handleIncomingSignal(signalData);
    });
  }

  public init(currentUser: ClassroomUser, localStream: MediaStream | null) {
    this.currentUser = currentUser;
    this.localStream = localStream;
    this.lastSignalTimestamp = Date.now() - 5000;

    if (localStream && localStream.getAudioTracks().length > 0) {
      this.startVoiceActivityDetection(localStream);
    }

    // Start background signal polling from InsForge DB for cross-device & cross-browser connections
    this.startSignalPolling();
  }

  public resumeAudioContext() {
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  public updateLocalStream(stream: MediaStream | null) {
    this.localStream = stream;

    // Update existing peer connections with new tracks
    this.peerConnections.forEach((pc) => {
      const senders = pc.getSenders();
      if (stream) {
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track).catch(() => {});
          } else {
            try {
              pc.addTrack(track, stream);
            } catch {
              // ignore
            }
          }
        });
      }
    });

    if (stream && stream.getAudioTracks().length > 0) {
      this.startVoiceActivityDetection(stream);
    }
  }

  public async connectToPeer(remoteSessionId: string) {
    if (!this.currentUser || remoteSessionId === this.currentUser.sessionId) return;
    if (this.peerConnections.has(remoteSessionId)) return;

    // Polite negotiation: Only one peer initiates offer to avoid offer glare
    const isInitiator =
      this.currentUser.role === 'teacher' ||
      this.currentUser.sessionId > remoteSessionId;

    if (!isInitiator) {
      // Wait for the other peer to initiate the offer
      return;
    }

    try {
      const pc = this.createPeerConnection(remoteSessionId);
      this.peerConnections.set(remoteSessionId, pc);

      // Add local tracks if available
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, this.localStream!);
          } catch {
            // ignore
          }
        });
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      this.emitSignal(remoteSessionId, offer, 'offer');
    } catch (err) {
      console.warn('WebRTC connectToPeer error:', err);
    }
  }

  private emitSignal(targetSessionId: string, signal: any, type: 'offer' | 'answer' | 'candidate') {
    if (!this.currentUser) return;
    const signalData: WebRTCSignalData = {
      targetSessionId,
      fromSessionId: this.currentUser.sessionId,
      signal,
      type,
    };

    // 1. Broadcast locally for fast same-browser connection
    classroomSync.broadcastWebRTCSignal(signalData);

    // 2. Transmit to InsForge database for cross-device & cross-browser connections
    if (this.currentUser.classCode) {
      insforgeService.sendSignal(
        this.currentUser.classCode,
        this.currentUser.sessionId,
        targetSessionId,
        type,
        signal
      ).catch(() => {});
    }
  }

  private createPeerConnection(remoteSessionId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && this.currentUser) {
        this.emitSignal(remoteSessionId, event.candidate, 'candidate');
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.remoteStreams.set(remoteSessionId, remoteStream);
        this.notifyRemoteStreamListeners();
      } else if (event.track) {
        let stream = this.remoteStreams.get(remoteSessionId);
        if (!stream) {
          stream = new MediaStream();
          this.remoteStreams.set(remoteSessionId, stream);
        }
        stream.addTrack(event.track);
        this.notifyRemoteStreamListeners();
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed' ||
        pc.connectionState === 'closed'
      ) {
        this.closePeer(remoteSessionId);
      }
    };

    return pc;
  }

  private async handleIncomingSignal(signalData: WebRTCSignalData) {
    if (!this.currentUser) return;
    if (signalData.targetSessionId !== this.currentUser.sessionId) return;

    const fromId = signalData.fromSessionId;

    try {
      let pc = this.peerConnections.get(fromId);

      if (signalData.type === 'offer') {
        if (!pc) {
          pc = this.createPeerConnection(fromId);
          this.peerConnections.set(fromId, pc);

          if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
              try {
                pc!.addTrack(track, this.localStream!);
              } catch {
                // ignore
              }
            });
          }
        }

        await pc.setRemoteDescription(new RTCSessionDescription(signalData.signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        this.emitSignal(fromId, answer, 'answer');
      } else if (signalData.type === 'answer') {
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData.signal));
        }
      } else if (signalData.type === 'candidate') {
        if (pc && signalData.signal) {
          await pc.addIceCandidate(new RTCIceCandidate(signalData.signal));
        }
      }
    } catch (err) {
      console.warn('WebRTC signal handling warning:', err);
    }
  }

  private startSignalPolling() {
    if (this.signalPollInterval) clearInterval(this.signalPollInterval);
    this.signalPollInterval = setInterval(async () => {
      if (!this.currentUser) return;
      try {
        const pending = await insforgeService.fetchPendingSignals(
          this.currentUser.classCode,
          this.currentUser.sessionId,
          this.lastSignalTimestamp
        );

        if (pending && pending.length > 0) {
          for (const item of pending) {
            if (this.processedSignalIds.has(item.id)) continue;
            this.processedSignalIds.add(item.id);
            if (item.timestamp > this.lastSignalTimestamp) {
              this.lastSignalTimestamp = item.timestamp;
            }

            this.handleIncomingSignal({
              targetSessionId: this.currentUser.sessionId,
              fromSessionId: item.fromSessionId,
              signal: item.payload,
              type: item.signalType as any,
            });
          }
        }
      } catch {
        // ignore
      }
    }, 1400);
  }

  public closePeer(sessionId: string) {
    const pc = this.peerConnections.get(sessionId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(sessionId);
    }
    this.remoteStreams.delete(sessionId);
    delete this.speakingMap[sessionId];
    this.notifyRemoteStreamListeners();
  }

  public cleanup() {
    if (this.signalPollInterval) {
      clearInterval(this.signalPollInterval);
      this.signalPollInterval = null;
    }
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.remoteStreams.clear();
    if (this.audioMonitorInterval) clearInterval(this.audioMonitorInterval);
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
  }

  public getRemoteStream(sessionId: string): MediaStream | undefined {
    return this.remoteStreams.get(sessionId);
  }

  public onRemoteStreamsChange(cb: (remoteStreams: Map<string, MediaStream>) => void): () => void {
    this.remoteStreamListeners.push(cb);
    cb(this.remoteStreams);
    return () => {
      this.remoteStreamListeners = this.remoteStreamListeners.filter((listener) => listener !== cb);
    };
  }

  public onSpeakingChange(cb: (speakingMap: Record<string, boolean>) => void): () => void {
    this.speakingListeners.push(cb);
    cb(this.speakingMap);
    return () => {
      this.speakingListeners = this.speakingListeners.filter((listener) => listener !== cb);
    };
  }

  private notifyRemoteStreamListeners() {
    this.remoteStreamListeners.forEach((cb) => cb(new Map(this.remoteStreams)));
  }

  // Voice Activity Detection (VAD) via AnalyserNode
  private startVoiceActivityDetection(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      if (this.audioMonitorInterval) clearInterval(this.audioMonitorInterval);

      this.audioMonitorInterval = setInterval(() => {
        if (!this.analyser || !this.currentUser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const isSpeaking = avg > 18 && (audioTrack.enabled);

        if (this.speakingMap[this.currentUser.sessionId] !== isSpeaking) {
          this.speakingMap[this.currentUser.sessionId] = isSpeaking;
          this.speakingListeners.forEach((cb) => cb({ ...this.speakingMap }));
        }
      }, 250);
    } catch (err) {
      console.warn('Voice Activity Detection init warning:', err);
    }
  }
}

export const webRTCService = WebRTCService.getInstance();
