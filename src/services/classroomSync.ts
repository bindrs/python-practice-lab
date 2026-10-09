import {
  BroadcastMessage,
  ClassroomUser,
  UserRole,
  ChatMessage,
  TeacherLiveAction,
  WebRTCSignalData,
} from '../components/classroomTypes';
import { insforgeService } from './insforgeService';

const CHANNEL_NAME = 'python_classroom_broadcast_v2';
const STORAGE_PEERS_KEY = 'python_classroom_active_peers';
const STORAGE_TEACHER_CODE_PREFIX = 'python_classroom_teacher_code_';
const STORAGE_LAST_ACTIVE_CLASS_KEY = 'python_classroom_last_active_class';
const STORAGE_PERSISTENT_SESSION_PREFIX = 'python_classroom_persistent_session_';
const STORAGE_ACTIVE_SESSION_GLOBAL = 'python_classroom_active_persistent_session';

export function getOrCreateWindowSessionId(): string {
  try {
    let id = sessionStorage.getItem('classroom_window_session_id');
    if (!id) {
      const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
      id = `SES-${rand}`;
      sessionStorage.setItem('classroom_window_session_id', id);
    }
    return id;
  } catch {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SES-${rand}`;
  }
}

export function generateRandomClassCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PY-${num}`;
}

export function getRandomAvatarColor(): string {
  const colors = [
    '#f59e0b', // amber
    '#38bdf8', // sky
    '#10b981', // emerald
    '#a855f7', // purple
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export class ClassroomSyncService {
  private channel: BroadcastChannel | null = null;
  private currentUser: ClassroomUser | null = null;
  private messageListeners: ((msg: BroadcastMessage) => void)[] = [];
  private peersListeners: ((peers: ClassroomUser[]) => void)[] = [];
  private heartbeatInterval: any = null;
  private heartbeatTick = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not available, falling back to storage events', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_PEERS_KEY) {
          this.notifyPeersListeners();
        }
      });
      // NOTE: We intentionally DO NOT call endSession on beforeunload
      // so the session stays active even when the user refreshes the page!
    }
  }

  public initUser(
    role: UserRole,
    username: string,
    classCode: string,
    cameraActive = false,
    micActive = false
  ): ClassroomUser {
    const sessionId = getOrCreateWindowSessionId();
    const cleanClassCode = classCode.trim().toUpperCase() || 'PY-1001';

    this.currentUser = {
      sessionId,
      role,
      username,
      classCode: cleanClassCode,
      joinedAt: Date.now(),
      cameraActive,
      micActive,
      avatarColor: role === 'teacher' ? '#f59e0b' : getRandomAvatarColor(),
      lastPing: Date.now(),
    };

    // Store in both sessionStorage and persistent localStorage so it survives refresh!
    try {
      const dataStr = JSON.stringify(this.currentUser);
      sessionStorage.setItem('classroom_user_profile', dataStr);
      localStorage.setItem(`${STORAGE_PERSISTENT_SESSION_PREFIX}${sessionId}`, dataStr);
      localStorage.setItem(STORAGE_ACTIVE_SESSION_GLOBAL, dataStr);

      if (role === 'teacher') {
        localStorage.setItem(
          STORAGE_LAST_ACTIVE_CLASS_KEY,
          JSON.stringify({
            classCode: cleanClassCode,
            teacherName: username,
            timestamp: Date.now(),
          })
        );
      }
    } catch {
      // ignore
    }

    // Register into active peers
    this.upsertPeer(this.currentUser);

    // Save user to InsForge cloud database
    insforgeService.saveUser(this.currentUser).catch((err) => {
      console.warn('InsForge save user background exception:', err);
    });

    // Broadcast join event
    this.broadcast({
      action: 'peer_join',
      sender: this.currentUser,
      classCode: cleanClassCode,
      timestamp: Date.now(),
    });

    // Start heartbeat
    this.startHeartbeat();

    return this.currentUser;
  }

  public getCurrentUser(): ClassroomUser | null {
    if (this.currentUser) return this.currentUser;
    try {
      // 1. Check window-specific sessionStorage
      let stored = sessionStorage.getItem('classroom_user_profile');

      // 2. If refreshed, check persistent session for this window's session ID
      if (!stored) {
        const sid = getOrCreateWindowSessionId();
        stored = localStorage.getItem(`${STORAGE_PERSISTENT_SESSION_PREFIX}${sid}`);
      }

      // 3. Fallback to active persistent session
      if (!stored) {
        stored = localStorage.getItem(STORAGE_ACTIVE_SESSION_GLOBAL);
      }

      if (stored) {
        this.currentUser = JSON.parse(stored);
        if (this.currentUser) {
          this.currentUser.lastPing = Date.now();
          this.upsertPeer(this.currentUser);

          // Refresh status in InsForge database
          insforgeService.saveUser(this.currentUser).catch(() => {});
          insforgeService.pingUser(this.currentUser.sessionId).catch(() => {});

          this.startHeartbeat();
          // Broadcast to other tabs that this peer is still active after refresh
          this.broadcast({
            action: 'peer_join',
            sender: this.currentUser,
            classCode: this.currentUser.classCode,
            timestamp: Date.now(),
          });
          return this.currentUser;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  public getActiveTeacherClass(): { classCode: string; teacherName: string; timestamp: number } | null {
    try {
      const stored = localStorage.getItem(STORAGE_LAST_ACTIVE_CLASS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - (parsed.timestamp || 0) < 4 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  public updateMediaStatus(cameraActive: boolean, micActive: boolean) {
    if (!this.currentUser) return;
    this.currentUser.cameraActive = cameraActive;
    this.currentUser.micActive = micActive;
    this.currentUser.lastPing = Date.now();

    try {
      const dataStr = JSON.stringify(this.currentUser);
      sessionStorage.setItem('classroom_user_profile', dataStr);
      localStorage.setItem(`${STORAGE_PERSISTENT_SESSION_PREFIX}${this.currentUser.sessionId}`, dataStr);
      localStorage.setItem(STORAGE_ACTIVE_SESSION_GLOBAL, dataStr);
    } catch {
      // ignore
    }

    this.upsertPeer(this.currentUser);

    // Sync media state to InsForge
    insforgeService.updateMedia(this.currentUser.sessionId, cameraActive, micActive).catch(() => {});

    this.broadcast({
      action: 'media_toggle',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      timestamp: Date.now(),
    });
  }

  public broadcastCode(code: string, notes?: string) {
    if (!this.currentUser) return;

    // Persist latest teacher code for this classCode
    try {
      const key = `${STORAGE_TEACHER_CODE_PREFIX}${this.currentUser.classCode}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          code,
          teacherName: this.currentUser.username,
          classCode: this.currentUser.classCode,
          timestamp: Date.now(),
        })
      );
    } catch {
      // ignore
    }

    // Persist teacher code to InsForge cloud database
    insforgeService.saveClassCode(this.currentUser.classCode, this.currentUser.username, code).catch(() => {});

    this.broadcast({
      action: 'code_broadcast',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      code,
      notes,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast real-time teacher action (Run, Step, Reset, Switch Tab, Select Example)
   */
  public broadcastTeacherAction(action: TeacherLiveAction) {
    if (!this.currentUser) return;
    // Also persist in InsForge DB
    insforgeService.saveLiveAction(action, this.currentUser.classCode).catch(() => {});

    this.broadcast({
      action: 'teacher_action',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      teacherAction: action,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast real-time code typing/editing by teacher
   */
  public broadcastCodeChange(code: string) {
    if (!this.currentUser || this.currentUser.role !== 'teacher') return;
    this.broadcast({
      action: 'code_change',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      code,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast a chat message to classroom
   */
  public broadcastChatMessage(msg: ChatMessage) {
    if (!this.currentUser) return;
    insforgeService.saveMessage(msg, this.currentUser.classCode).catch(() => {});

    this.broadcast({
      action: 'chat_message',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      chatMessage: msg,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast WebRTC signaling (offer, answer, ice-candidate)
   */
  public broadcastWebRTCSignal(signalData: WebRTCSignalData) {
    if (!this.currentUser) return;
    this.broadcast({
      action: 'webrtc_signal',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      targetSessionId: signalData.targetSessionId,
      webrtcSignal: signalData,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast student raise hand
   */
  public broadcastRaiseHand() {
    if (!this.currentUser) return;
    this.broadcast({
      action: 'raise_hand',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      timestamp: Date.now(),
    });
  }

  public onTeacherAction(callback: (action: TeacherLiveAction) => void): () => void {
    return this.onMessage((msg) => {
      if (msg.action === 'teacher_action' && msg.teacherAction) {
        callback(msg.teacherAction);
      }
    });
  }

  public onCodeChange(callback: (code: string) => void): () => void {
    return this.onMessage((msg) => {
      if (msg.action === 'code_change' && msg.code !== undefined) {
        callback(msg.code);
      }
    });
  }

  public onChatMessage(callback: (msg: ChatMessage) => void): () => void {
    return this.onMessage((msg) => {
      if (msg.action === 'chat_message' && msg.chatMessage) {
        callback(msg.chatMessage);
      }
    });
  }

  public onWebRTCSignal(callback: (signal: WebRTCSignalData) => void): () => void {
    return this.onMessage((msg) => {
      if (msg.action === 'webrtc_signal' && msg.webrtcSignal) {
        callback(msg.webrtcSignal);
      }
    });
  }

  public getLatestTeacherCode(
    classCode?: string
  ): { code: string; teacherName: string; timestamp: number } | null {
    const codeKey = classCode || (this.currentUser ? this.currentUser.classCode : '');
    if (!codeKey) return null;
    try {
      const val = localStorage.getItem(`${STORAGE_TEACHER_CODE_PREFIX}${codeKey.toUpperCase()}`);
      if (val) return JSON.parse(val);
    } catch {
      // ignore
    }
    return null;
  }

  public onMessage(callback: (msg: BroadcastMessage) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter((cb) => cb !== callback);
    };
  }

  public onPeersChange(callback: (peers: ClassroomUser[]) => void): () => void {
    this.peersListeners.push(callback);
    callback(this.getActivePeers());
    return () => {
      this.peersListeners = this.peersListeners.filter((cb) => cb !== callback);
    };
  }

  public getActivePeers(): ClassroomUser[] {
    try {
      const stored = localStorage.getItem(STORAGE_PEERS_KEY);
      if (!stored) return this.currentUser ? [this.currentUser] : [];
      const peers: ClassroomUser[] = JSON.parse(stored);
      const now = Date.now();
      // 30 seconds threshold so page reloads do not prematurely drop peers
      const fresh = peers.filter((p) => now - (p.lastPing || 0) < 30000);

      // Filter only peers in the same classCode
      if (this.currentUser && this.currentUser.classCode) {
        return fresh.filter((p) => p.classCode === this.currentUser?.classCode);
      }

      return fresh;
    } catch {
      return this.currentUser ? [this.currentUser] : [];
    }
  }

  /**
   * ONLY called when the user explicitly clicks the "End Session" button!
   * Until this button is pressed, the session never ends, even after page refresh.
   */
  public endSession() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.currentUser) {
      const sid = this.currentUser.sessionId;
      this.broadcast({
        action: 'peer_leave',
        sender: this.currentUser,
        classCode: this.currentUser.classCode,
        timestamp: Date.now(),
      });
      this.removePeer(sid);

      // Deactivate user in InsForge database
      insforgeService.deactivateUser(sid).catch(() => {});

      try {
        localStorage.removeItem(`${STORAGE_PERSISTENT_SESSION_PREFIX}${sid}`);
        localStorage.removeItem(STORAGE_ACTIVE_SESSION_GLOBAL);
        localStorage.removeItem(`classroom_saved_code_${sid}`);
      } catch {
        // ignore
      }
    }

    try {
      sessionStorage.removeItem('classroom_user_profile');
    } catch {
      // ignore
    }

    this.currentUser = null;
  }

  /**
   * Alias for endSession() to guarantee safe termination
   */
  public leave() {
    this.endSession();
  }

  private broadcast(msg: BroadcastMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('Error posting to BroadcastChannel', err);
      }
    }
  }

  private handleIncomingMessage(msg: BroadcastMessage) {
    if (!msg || !msg.sender) return;

    // Only process messages for the same classCode if both have classCode
    if (
      this.currentUser &&
      this.currentUser.classCode &&
      msg.classCode &&
      msg.classCode !== this.currentUser.classCode
    ) {
      return;
    }

    if (msg.action === 'peer_join' || msg.action === 'peer_ping' || msg.action === 'media_toggle') {
      this.upsertPeer(msg.sender);
    } else if (msg.action === 'peer_leave') {
      this.removePeer(msg.sender.sessionId);
    }

    this.messageListeners.forEach((cb) => cb(msg));
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatTick = 0;
    this.heartbeatInterval = setInterval(async () => {
      if (!this.currentUser) return;
      this.currentUser.lastPing = Date.now();
      this.upsertPeer(this.currentUser);

      this.broadcast({
        action: 'peer_ping',
        sender: this.currentUser,
        classCode: this.currentUser.classCode,
        timestamp: Date.now(),
      });

      this.cleanStalePeers();

      this.heartbeatTick++;
      // Every 2 ticks (approx 8 seconds), ping InsForge and sync remote peers from database
      if (this.heartbeatTick % 2 === 0) {
        insforgeService.pingUser(this.currentUser.sessionId).catch(() => {});
        try {
          const remoteUsers = await insforgeService.fetchClassUsers(this.currentUser.classCode);
          if (remoteUsers && remoteUsers.length > 0) {
            remoteUsers.forEach((remoteUser) => {
              if (remoteUser.sessionId !== this.currentUser?.sessionId) {
                this.upsertPeer(remoteUser);
              }
            });
          }
        } catch {
          // ignore
        }
      }
    }, 4000);
  }

  private upsertPeer(user: ClassroomUser) {
    try {
      const stored = localStorage.getItem(STORAGE_PEERS_KEY);
      const peers: ClassroomUser[] = stored ? JSON.parse(stored) : [];
      const existingIdx = peers.findIndex((p) => p.sessionId === user.sessionId);
      if (existingIdx >= 0) {
        peers[existingIdx] = { ...peers[existingIdx], ...user, lastPing: Date.now() };
      } else {
        peers.push({ ...user, lastPing: Date.now() });
      }
      localStorage.setItem(STORAGE_PEERS_KEY, JSON.stringify(peers));
      this.notifyPeersListeners();
    } catch {
      // ignore
    }
  }

  private removePeer(sessionId: string) {
    try {
      const stored = localStorage.getItem(STORAGE_PEERS_KEY);
      if (!stored) return;
      const peers: ClassroomUser[] = JSON.parse(stored);
      const filtered = peers.filter((p) => p.sessionId !== sessionId);
      localStorage.setItem(STORAGE_PEERS_KEY, JSON.stringify(filtered));
      this.notifyPeersListeners();
    } catch {
      // ignore
    }
  }

  private cleanStalePeers() {
    try {
      const stored = localStorage.getItem(STORAGE_PEERS_KEY);
      if (!stored) return;
      const peers: ClassroomUser[] = JSON.parse(stored);
      const now = Date.now();
      const fresh = peers.filter((p) => now - (p.lastPing || 0) < 30000);
      localStorage.setItem(STORAGE_PEERS_KEY, JSON.stringify(fresh));
      this.notifyPeersListeners();
    } catch {
      // ignore
    }
  }

  private notifyPeersListeners() {
    const peers = this.getActivePeers();
    this.peersListeners.forEach((cb) => cb(peers));
  }
}

export const classroomSync = new ClassroomSyncService();
