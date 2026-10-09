import { BroadcastMessage, ClassroomUser, UserRole } from '../components/classroomTypes';

const CHANNEL_NAME = 'python_classroom_broadcast_v2';
const STORAGE_PEERS_KEY = 'python_classroom_active_peers';
const STORAGE_TEACHER_CODE_PREFIX = 'python_classroom_teacher_code_';
const STORAGE_LAST_ACTIVE_CLASS_KEY = 'python_classroom_last_active_class';

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

      window.addEventListener('beforeunload', () => {
        this.leave();
      });
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

    // Store in sessionStorage
    try {
      sessionStorage.setItem('classroom_user_profile', JSON.stringify(this.currentUser));
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
      const stored = sessionStorage.getItem('classroom_user_profile');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
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
        // Only consider valid within last 2 hours
        if (Date.now() - (parsed.timestamp || 0) < 2 * 60 * 60 * 1000) {
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
      sessionStorage.setItem('classroom_user_profile', JSON.stringify(this.currentUser));
    } catch {
      // ignore
    }

    this.upsertPeer(this.currentUser);

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

    this.broadcast({
      action: 'code_broadcast',
      sender: this.currentUser,
      classCode: this.currentUser.classCode,
      code,
      notes,
      timestamp: Date.now(),
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
      // Filter out stale peers (no ping in last 12 seconds)
      const fresh = peers.filter((p) => now - (p.lastPing || 0) < 12000);

      // If user is currently in a classCode, filter only peers in that classCode!
      if (this.currentUser && this.currentUser.classCode) {
        return fresh.filter((p) => p.classCode === this.currentUser?.classCode);
      }

      return fresh;
    } catch {
      return this.currentUser ? [this.currentUser] : [];
    }
  }

  public leave() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.currentUser) {
      this.broadcast({
        action: 'peer_leave',
        sender: this.currentUser,
        classCode: this.currentUser.classCode,
        timestamp: Date.now(),
      });
      this.removePeer(this.currentUser.sessionId);
    }

    try {
      sessionStorage.removeItem('classroom_user_profile');
    } catch {
      // ignore
    }

    this.currentUser = null;
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
    this.heartbeatInterval = setInterval(() => {
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
      const fresh = peers.filter((p) => now - (p.lastPing || 0) < 12000);
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
