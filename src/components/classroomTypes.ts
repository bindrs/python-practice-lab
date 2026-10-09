export type UserRole = 'teacher' | 'student';

export interface ClassroomUser {
  sessionId: string;
  role: UserRole;
  username: string;
  joinedAt: number;
  cameraActive: boolean;
  micActive: boolean;
  avatarColor: string;
  lastPing: number;
}

export type BroadcastAction =
  | 'peer_join'
  | 'peer_ping'
  | 'peer_leave'
  | 'code_broadcast'
  | 'media_toggle';

export interface BroadcastMessage {
  action: BroadcastAction;
  sender: ClassroomUser;
  targetSessionId?: string; // optional: unicast to specific student
  code?: string;
  timestamp: number;
  notes?: string;
}

export const TEACHER_MASTER_PIN = '2244244452665339';
