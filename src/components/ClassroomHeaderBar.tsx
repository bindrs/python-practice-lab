import React, { useState } from 'react';
import {
  GraduationCap,
  Crown,
  Radio,
  Users,
  Video,
  VideoOff,
  Mic,
  MicOff,
  LogOut,
  Download,
  Share2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  Power,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { ClassroomUser } from './classroomTypes';

interface ClassroomHeaderBarProps {
  currentUser: ClassroomUser;
  peers: ClassroomUser[];
  cameraActive: boolean;
  micActive: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onBroadcastCode: () => void;
  onLoadTeacherCode: () => void;
  teacherHasNewCode: boolean;
  autoSyncWithTeacher: boolean;
  onToggleAutoSync: () => void;
  onLogout: () => void;
  onToggleVideoTiles: () => void;
  isVideoTilesOpen: boolean;
}

export const ClassroomHeaderBar: React.FC<ClassroomHeaderBarProps> = ({
  currentUser,
  peers,
  cameraActive,
  micActive,
  onToggleCamera,
  onToggleMic,
  onBroadcastCode,
  onLoadTeacherCode,
  teacherHasNewCode,
  autoSyncWithTeacher,
  onToggleAutoSync,
  onLogout,
  onToggleVideoTiles,
  isVideoTilesOpen,
}) => {
  const [showPeersDropdown, setShowPeersDropdown] = useState(false);
  const [broadcastSentAnim, setBroadcastSentAnim] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);

  const isTeacher = currentUser.role === 'teacher';
  const teachersCount = peers.filter((p) => p.role === 'teacher').length;
  const studentsCount = peers.filter((p) => p.role === 'student').length;

  const handleBroadcastClick = () => {
    onBroadcastCode();
    setBroadcastSentAnim(true);
    setTimeout(() => setBroadcastSentAnim(false), 2000);
  };

  const handleCopyClassCode = () => {
    navigator.clipboard?.writeText(currentUser.classCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenNewStudentWindow = () => {
    // Save active class to localStorage so new student tab immediately picks up this class code!
    try {
      localStorage.setItem(
        'python_classroom_last_active_class',
        JSON.stringify({
          classCode: currentUser.classCode,
          teacherName: currentUser.username,
          timestamp: Date.now(),
        })
      );
    } catch {
      // ignore
    }
    window.open(window.location.href, '_blank');
  };

  return (
    <header className="bg-[#0b1120] border-b border-[#1e293b] px-2.5 sm:px-3 py-1.5 flex items-center justify-between gap-1.5 sm:gap-3 text-xs flex-wrap sm:flex-nowrap z-30">
      {/* Left: Role, User Badge, and Class Code */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full font-bold text-[11px] shadow-sm max-w-[170px] sm:max-w-none ${
            isTeacher
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
          }`}
        >
          {isTeacher ? <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> : <GraduationCap className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />}
          <span className="truncate">{currentUser.username}</span>
          <span className="text-[10px] opacity-75 font-mono hidden xs:inline">({isTeacher ? 'Teacher' : 'Student'})</span>
        </div>

        {/* Class Code Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border transition-colors ${
            isTeacher
              ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
              : 'bg-sky-950/40 text-sky-300 border-sky-500/40'
          }`}
          title={isTeacher ? `Teacher's Class Code: Give this code (${currentUser.classCode}) to your students` : `Connected to Class Code: ${currentUser.classCode}`}
        >
          <span className="opacity-70 font-sans text-[10px]">Class:</span>
          <span className="tracking-wider">{currentUser.classCode}</span>
          <button
            type="button"
            onClick={handleCopyClassCode}
            className="hover:text-white transition-colors"
            title="Copy Class Code"
          >
            {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Window Session ID */}
        <div
          className="hidden md:flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-md"
          title="Unique Window Session ID"
        >
          <span className="opacity-60">ID:</span>
          <span className="text-slate-300 font-semibold">{currentUser.sessionId}</span>
        </div>

        {/* Connected Participants Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPeersDropdown((prev) => !prev)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white transition-colors"
            title="View all connected classroom members"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{peers.length} Online</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Peers Dropdown */}
          {showPeersDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-bold text-slate-200">Classroom Peers</span>
                <span className="text-[10px] text-slate-400">
                  {teachersCount} Teacher · {studentsCount} Student{studentsCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {peers.map((peer) => (
                  <div
                    key={peer.sessionId}
                    className={`flex items-center justify-between p-1.5 rounded-lg text-xs ${
                      peer.sessionId === currentUser.sessionId
                        ? 'bg-slate-800/80 border border-slate-700'
                        : 'bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: peer.avatarColor || '#38bdf8' }}
                      />
                      <span className="font-medium text-slate-200 truncate">
                        {peer.username}
                        {peer.sessionId === currentUser.sessionId && ' (You)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[9px] font-mono px-1 rounded ${
                          peer.role === 'teacher'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {peer.role}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">{peer.sessionId}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <button
                  type="button"
                  onClick={handleOpenNewStudentWindow}
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Student in New Tab
                </button>
                <button
                  type="button"
                  onClick={() => setShowPeersDropdown(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Live Broadcast & Content Sync Controls */}
      <div className="flex items-center gap-2">
        {/* TEACHER CONTROLS */}
        {isTeacher ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBroadcastClick}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs transition-all shadow-sm ${
                broadcastSentAnim
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-amber-900/30'
              }`}
              title="Broadcast current code live to all connected student windows"
            >
              {broadcastSentAnim ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span>Code Broadcasted!</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-amber-100 animate-pulse" />
                  <span>Broadcast Code to Students</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* STUDENT CONTROLS: Live content from teacher with local editing capability */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLoadTeacherCode}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-xs transition-all ${
                teacherHasNewCode
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Load the teacher's latest broadcasted code (you can modify it freely!)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{teacherHasNewCode ? 'New Teacher Code Available!' : 'Reload Teacher Code'}</span>
            </button>

            <label
              className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
              title="Automatically sync editor when teacher broadcasts new code"
            >
              <input
                type="checkbox"
                checked={autoSyncWithTeacher}
                onChange={onToggleAutoSync}
                className="rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <span>Live Auto-Sync</span>
            </label>
          </div>
        )}
      </div>

      {/* Right: Camera / Mic and Video Tiles Toggle */}
      <div className="flex items-center gap-2">
        {/* Toggle Classroom Cameras Tile */}
        <button
          type="button"
          onClick={onToggleVideoTiles}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
            isVideoTilesOpen
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-750'
          }`}
          title="Toggle live camera and avatar tiles"
        >
          <Video className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Camera Tiles</span>
        </button>

        {/* Mic Toggle */}
        <button
          type="button"
          onClick={onToggleMic}
          className={`p-1.5 rounded-md border transition-colors ${
            micActive
              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
          title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </button>

        {/* Camera Toggle */}
        <button
          type="button"
          onClick={onToggleCamera}
          className={`p-1.5 rounded-md border transition-colors ${
            cameraActive
              ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
          title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
        </button>

        {/* Session Persistence Badge */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono cursor-default"
          title="Session remains active even after browser refresh. Session only ends when you click 'End Session'."
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <span>Active (Refresh-Safe)</span>
        </div>

        {/* Dedicated Session End Button */}
        <button
          type="button"
          onClick={() => setShowEndSessionConfirm(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all shadow-sm shadow-rose-950/40 min-h-[28px]"
          title="End Session: Click to permanently end this classroom session (refreshing page will not end session)"
        >
          <Power className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>End Session</span>
        </button>
      </div>

      {/* Explicit Session End Confirmation Modal */}
      {showEndSessionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">End Classroom Session?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Jab tak aap yeh button press nahi karenge, session end nahi hoga — chahe aap page refresh bhi kar lein.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-bold text-slate-200 capitalize">{currentUser.role} ({currentUser.username})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Class Code:</span>
                <span className="font-mono font-bold text-sky-400">{currentUser.classCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session ID:</span>
                <span className="font-mono text-slate-300">{currentUser.sessionId}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Page refresh karne par session active rehta hai.</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Are you sure you want to end this session now and return to the login screen?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowEndSessionConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel (Keep Session Active)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndSessionConfirm(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/40 flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Yes, End Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
