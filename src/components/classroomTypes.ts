export type UserRole = 'teacher' | 'student';

export interface ClassroomUser {
  sessionId: string;
  role: UserRole;
  username: string;
  classCode: string;
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
  classCode: string;
  targetSessionId?: string; // optional: unicast to specific student
  code?: string;
  timestamp: number;
  notes?: string;
}
