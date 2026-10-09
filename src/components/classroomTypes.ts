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
  isSpeaking?: boolean;
}

export type BroadcastAction =
  | 'peer_join'
  | 'peer_ping'
  | 'peer_leave'
  | 'code_broadcast'
  | 'code_change'
  | 'teacher_action'
  | 'chat_message'
  | 'webrtc_signal'
  | 'media_toggle'
  | 'raise_hand';

export interface TeacherLiveAction {
  type:
    | 'run'
    | 'step'
    | 'reset'
    | 'select_example'
    | 'switch_tab'
    | 'clear_output'
    | 'speed_change'
    | 'code_edit';
  code?: string;
  exampleIndex?: string;
  tab?: 'terminal' | 'trace' | 'turtle';
  speed?: number;
  timestamp: number;
  teacherName: string;
  cursorLine?: number;
}

export interface ChatMessage {
  id: string;
  senderSessionId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isHandRaise?: boolean;
}

export interface WebRTCSignalData {
  targetSessionId: string;
  fromSessionId: string;
  signal: any;
  type: 'offer' | 'answer' | 'candidate';
}

export interface BroadcastMessage {
  action: BroadcastAction;
  sender: ClassroomUser;
  classCode: string;
  targetSessionId?: string; // optional: unicast to specific student
  code?: string;
  timestamp: number;
  notes?: string;
  teacherAction?: TeacherLiveAction;
  chatMessage?: ChatMessage;
  webrtcSignal?: WebRTCSignalData;
}
