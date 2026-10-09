import { ClassroomUser, WebRTCSignalData } from '../components/classroomTypes';
import { classroomSync } from './classroomSync';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
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

    if (localStream && localStream.getAudioTracks().length > 0) {
      this.startVoiceActivityDetection(localStream);
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
            pc.addTrack(track, stream);
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

    try {
      const pc = this.createPeerConnection(remoteSessionId);
      this.peerConnections.set(remoteSessionId, pc);

      // Add local tracks if available
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          pc.addTrack(track, this.localStream!);
        });
      }

      // Teacher or initiator creates offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      classroomSync.broadcastWebRTCSignal({
        targetSessionId: remoteSessionId,
        fromSessionId: this.currentUser.sessionId,
        signal: offer,
        type: 'offer',
      });
    } catch (err) {
      console.warn('WebRTC connectToPeer error:', err);
    }
  }

  private createPeerConnection(remoteSessionId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && this.currentUser) {
        classroomSync.broadcastWebRTCSignal({
          targetSessionId: remoteSessionId,
          fromSessionId: this.currentUser.sessionId,
          signal: event.candidate,
          type: 'candidate',
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.remoteStreams.set(remoteSessionId, remoteStream);
        this.notifyRemoteStreamListeners();
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
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
              pc!.addTrack(track, this.localStream!);
            });
          }
        }

        await pc.setRemoteDescription(new RTCSessionDescription(signalData.signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        classroomSync.broadcastWebRTCSignal({
          targetSessionId: fromId,
          fromSessionId: this.currentUser.sessionId,
          signal: answer,
          type: 'answer',
        });
      } else if (signalData.type === 'answer') {
        if (pc) {
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
