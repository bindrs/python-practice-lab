import React, { useState, useEffect } from 'react';
import {
  Clock,
  Crown,
  GraduationCap,
  Users,
  Radio,
  Activity,
  ShieldCheck,
  Eye,
  Video,
  Mic,
  MicOff,
  Database,
  X,
  FileCode,
  Terminal,
  Maximize2,
  Minimize2,
  Signal,
  CheckCircle2,
} from 'lucide-react';
import { ClassroomUser } from './classroomTypes';
import { classroomSync } from '../services/classroomSync';

interface StudentDashboardProps {
  currentUser: ClassroomUser;
  peers: ClassroomUser[];
  activeTab: 'terminal' | 'trace' | 'turtle';
  codeLength?: number;
  latestTeacherActionNotice?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenConversation?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  peers,
  activeTab,
  codeLength = 0,
  latestTeacherActionNotice,
  isOpen,
  onClose,
  onOpenConversation,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Live session timer based on joinedAt timestamp
  useEffect(() => {
    const calcElapsed = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - (currentUser.joinedAt || now)) / 1000));
      setElapsedSeconds(diff);
    };

    calcElapsed();
    const timer = setInterval(calcElapsed, 1000);
    return () => clearInterval(timer);
  }, [currentUser.joinedAt]);

  if (!isOpen) return null;

  // Format seconds into HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Find active teacher in room
  const teacherPeer = peers.find((p) => p.role === 'teacher');
  const teacherName =
    teacherPeer?.username ||
    classroomSync.getActiveTeacherClass()?.teacherName ||
    'Class Instructor';

  const studentsCount = peers.filter((p) => p.role === 'student').length;
  const teachersCount = peers.filter((p) => p.role === 'teacher').length;

  const joinTimeStr = new Date(currentUser.joinedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-x-2 bottom-3 sm:bottom-4 sm:right-4 sm:left-auto sm:w-[480px] max-w-[calc(100vw-24px)] z-45 bg-[#0b1224]/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-200 overflow-hidden transition-all duration-200">
      {/* Dashboard Header */}
      <div className="px-4 py-3 bg-[#0e172e] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-white">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-100 tracking-tight">
                Student Classroom Dashboard
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                READ-ONLY
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Class {currentUser.classCode} · Live Synchronization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-white">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors text-white"
            title={isExpanded ? 'Collapse Dashboard' : 'Expand Dashboard'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-white" /> : <Maximize2 className="w-3.5 h-3.5 text-white" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors text-white"
            title="Close Dashboard"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Top 2 Primary Stats: Active Teacher & Session Duration */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Active Teacher Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Crown className="w-3.5 h-3.5 text-white" />
                  Active Teacher
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-amber-400/40 shadow-sm"
                  style={{ backgroundColor: teacherPeer?.avatarColor || '#f59e0b' }}
                >
                  {teacherName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-100 truncate" title={teacherName}>
                    {teacherName}
                  </div>
                  <div className="text-[10px] text-amber-300/80 font-mono">Instructor</div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  {teacherPeer?.micActive ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Mic className="w-3 h-3 text-white" /> Audio On
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-0.5">
                      <MicOff className="w-3 h-3 text-white" /> Muted
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Video className="w-3 h-3 text-white" />
                  <span>{teacherPeer?.cameraActive ? 'Camera Live' : 'Camera Off'}</span>
                </span>
              </div>
            </div>

            {/* 2. Session Duration Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  Session Duration
                </span>
                <span className="text-[10px] text-sky-400 font-mono">Ticking</span>
              </div>

              <div>
                <div className="text-xl font-bold font-mono tracking-tight text-slate-100">
                  {formatDuration(elapsedSeconds)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Joined at: {joinTimeStr}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Class Code:</span>
                <span className="font-mono font-bold text-sky-300">{currentUser.classCode}</span>
              </div>
            </div>
          </div>

          {/* Secondary Stats Strip: Attendance, Active Tab & Sync Status */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Users className="w-3 h-3 text-white" />
                <span>Attendance</span>
              </div>
              <div className="text-base font-bold text-slate-100 font-mono">
                {peers.length} <span className="text-[10px] font-normal text-slate-400">Total</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                {studentsCount} student{studentsCount === 1 ? '' : 's'} · {teachersCount} teacher
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Terminal className="w-3 h-3 text-white" />
                <span>Active Output</span>
              </div>
              <div className="text-xs font-bold text-slate-200 capitalize truncate mt-0.5">
                {activeTab === 'terminal'
                  ? 'Terminal'
                  : activeTab === 'trace'
                  ? 'Trace Table'
                  : 'Turtle Canvas'}
              </div>
              <div className="text-[9px] text-slate-500 mt-1">Mirrored by teacher</div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Signal className="w-3 h-3 text-white" />
                <span>Sync Latency</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                &lt; 50ms
              </div>
              <div className="text-[9px] text-slate-500 mt-1">Real-time Stream</div>
            </div>
          </div>

          {/* Current Mirror Status & Latest Teacher Action */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-white" />
                Screen Mirror Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Synchronized
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              You are currently connected to <b className="text-slate-200">{teacherName}</b>'s classroom in{' '}
              <b className="text-sky-300">View Screen Only</b> mode. All code edits, run sequences, step debugs, and tab changes executed by the instructor appear automatically on your screen.
            </p>

            {latestTeacherActionNotice && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] text-amber-200">
                <span className="font-semibold">Recent Instructor Action:</span>
                <span className="font-mono text-amber-300 font-bold">{latestTeacherActionNotice}</span>
              </div>
            )}
          </div>

          {/* Connected Classroom Peers Roster */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                Connected Classroom Participants ({peers.length})
              </span>
              <span className="text-[10px] text-slate-400">Class {currentUser.classCode}</span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {peers.map((peer) => {
                const isMe = peer.sessionId === currentUser.sessionId;
                const isTeacher = peer.role === 'teacher';

                return (
                  <div
                    key={peer.sessionId}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isMe
                        ? 'bg-sky-950/40 border border-sky-500/30 text-sky-100'
                        : isTeacher
                        ? 'bg-amber-950/30 border border-amber-500/25 text-amber-100'
                        : 'bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: peer.avatarColor || '#38bdf8' }}
                      />
                      <span className="font-medium truncate">
                        {peer.username}
                        {isMe && ' (You)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 text-[10px]">
                      <span
                        className={`font-mono px-1.5 py-0.2 rounded ${
                          isTeacher
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isTeacher ? 'Teacher' : 'Student'}
                      </span>
                      {peer.micActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Mic active" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* InsForge Backend & Security Verification Footer */}
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3 h-3 text-white" />
              <span>InsForge Postgres Connected</span>
            </div>

            {onOpenConversation && (
              <button
                type="button"
                onClick={onOpenConversation}
                className="text-sky-400 hover:text-sky-300 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Open Audio & Conversation &rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
