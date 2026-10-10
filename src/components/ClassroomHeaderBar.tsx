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
  ExternalLink,
  ChevronDown,
  Sparkles,
  Copy,
  Check,
  Power,
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  Eye,
  EyeOff,
  Activity,
  Code2,
  Square,
  VolumeX,
  Film,
  Monitor,
  Layers,
  RefreshCw,
  Hash,
} from 'lucide-react';
import { ClassroomUser } from './classroomTypes';

interface ClassroomHeaderBarProps {
  currentUser: ClassroomUser;
  peers: ClassroomUser[];
  cameraActive: boolean;
  micActive: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onCloseBothMedia?: () => void;
  onBroadcastCode: () => void;
  onLoadTeacherCode: () => void;
  teacherHasNewCode: boolean;
  autoSyncWithTeacher: boolean;
  onToggleAutoSync: () => void;
  onLogout: () => void;
  onToggleVideoTiles: () => void;
  isVideoTilesOpen: boolean;
  isConversationOpen: boolean;
  onToggleConversation: () => void;
  latestTeacherActionNotice?: string;
  onToggleDashboard?: () => void;
  isDashboardOpen?: boolean;
  onHideHeader?: () => void;
  isStudentPresenting?: boolean;
  onToggleStudentPresenting?: () => void;
  isOpenCodingEnabled?: boolean;
  onToggleOpenCoding?: () => void;
  activePresenterName?: string | null;
  onTeacherMuteAllStudents?: () => void;
  isRecording?: boolean;
  recordingDurationStr?: string;
  onToggleRecording?: () => void;
  recordingMode?: 'lecture_composite' | 'screen_only' | 'camera_only';
  lectureChaptersCount?: number;
  onStartLectureRecording?: (mode: 'lecture_composite' | 'screen_only' | 'camera_only') => void;
}

export const ClassroomHeaderBar: React.FC<ClassroomHeaderBarProps> = ({
  currentUser,
  peers,
  cameraActive,
  micActive,
  onToggleCamera,
  onToggleMic,
  onCloseBothMedia,
  onBroadcastCode,
  onLoadTeacherCode,
  teacherHasNewCode,
  autoSyncWithTeacher,
  onToggleAutoSync,
  onLogout,
  onToggleVideoTiles,
  isVideoTilesOpen,
  isConversationOpen,
  onToggleConversation,
  latestTeacherActionNotice,
  onToggleDashboard,
  isDashboardOpen,
  onHideHeader,
  isStudentPresenting = false,
  onToggleStudentPresenting,
  isOpenCodingEnabled = true,
  onToggleOpenCoding,
  activePresenterName,
  onTeacherMuteAllStudents,
  isRecording = false,
  recordingDurationStr = '00:00',
  onToggleRecording,
  recordingMode = 'lecture_composite',
  lectureChaptersCount = 0,
  onStartLectureRecording,
}) => {
  const [showPeersDropdown, setShowPeersDropdown] = useState(false);
  const [showRecModeMenu, setShowRecModeMenu] = useState(false);
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
    <header className="bg-[#0b1120] border-b border-[#1e293b] px-2 sm:px-3 py-1 flex items-center justify-between gap-1 sm:gap-2 text-xs flex-nowrap z-30 select-none">
      {/* LEFT: User Profile Icon, Class Code Icon Button & Peers Counter Icon */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* User Role Icon Avatar */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-transform hover:scale-105 cursor-pointer flex-shrink-0 ${
            isTeacher
              ? 'bg-amber-500/20 text-white border border-amber-500/40 ring-1 ring-amber-500/20'
              : 'bg-sky-500/20 text-white border border-sky-500/40 ring-1 ring-sky-500/20'
          }`}
          style={{ backgroundColor: currentUser.avatarColor ? `${currentUser.avatarColor}25` : undefined }}
          title={`${currentUser.username} (${isTeacher ? 'Teacher' : 'Student'}) · Window ID: ${currentUser.sessionId}`}
        >
          {isTeacher ? (
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          ) : (
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          )}
        </div>

        {/* Class Code Icon Button */}
        <button
          type="button"
          onClick={handleCopyClassCode}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-colors flex-shrink-0 text-white ${
            isTeacher
              ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40'
              : 'bg-sky-950/40 hover:bg-sky-900/50 border-sky-500/40'
          }`}
          title={`Class Code: ${currentUser.classCode} (Click to copy)`}
        >
          {copiedCode ? (
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          ) : (
            <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          )}
        </button>

        {/* Peers Count Icon Button with badge */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPeersDropdown((prev) => !prev)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-white transition-colors relative flex items-center justify-center"
            title={`Connected Members: ${peers.length} Online (${teachersCount} Teacher, ${studentsCount} Students)`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-3.5 rounded-full bg-emerald-500 text-[8.5px] font-bold text-white flex items-center justify-center font-mono">
              {peers.length}
            </span>
          </button>

          {/* Peers Dropdown Menu */}
          {showPeersDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-bold text-white text-xs">Classroom Peers</span>
                <span className="text-[10px] text-slate-300">
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
                      <span className="font-medium text-white truncate">
                        {peer.username}
                        {peer.sessionId === currentUser.sessionId && ' (You)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[9px] font-mono px-1 rounded text-white ${
                          peer.role === 'teacher'
                            ? 'bg-amber-500/20'
                            : 'bg-sky-500/20'
                        }`}
                      >
                        {peer.role}
                      </span>
                      <span className="text-[9px] font-mono text-slate-300">{peer.sessionId}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <button
                  type="button"
                  onClick={handleOpenNewStudentWindow}
                  className="text-white hover:text-slate-200 flex items-center gap-1 underline"
                >
                  <ExternalLink className="w-3 h-3 text-white" />
                  Open Student in New Tab
                </button>
                <button
                  type="button"
                  onClick={() => setShowPeersDropdown(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CENTER: Live Broadcast, Presenter Stage, Sync Actions (Icons Only in White) */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {isTeacher ? (
          <>
            {/* If Student Presenting: Take Back Stage Icon Button */}
            {activePresenterName ? (
              <button
                type="button"
                onClick={onToggleStudentPresenting}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-white border border-emerald-500/40 flex items-center justify-center transition-all animate-pulse"
                title={`Student ${activePresenterName} is live presenting! Click to take back stage`}
              >
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
              </button>
            ) : (
              /* Broadcasting Live Screen Status Indicator Icon */
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/20 text-white border border-rose-500/40 flex items-center justify-center"
                title={`Broadcasting Screen Live (${studentsCount} student${studentsCount === 1 ? '' : 's'} connected)`}
              >
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
              </div>
            )}

            {/* Toggle Student Coding Permission Icon Button */}
            {onToggleOpenCoding && (
              <button
                type="button"
                onClick={onToggleOpenCoding}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors text-white ${
                  isOpenCodingEnabled
                    ? 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/40 shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 opacity-60'
                }`}
                title={`Student Live Coding: ${isOpenCodingEnabled ? 'Allowed (Students can present)' : 'Locked (Only teacher can present)'}`}
              >
                <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            )}

            {/* Force Sync Code to Students Icon Button */}
            <button
              type="button"
              onClick={handleBroadcastClick}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all text-white ${
                broadcastSentAnim
                  ? 'bg-emerald-500 border-emerald-400 shadow-sm'
                  : 'bg-amber-600 hover:bg-amber-500 border-amber-500 shadow-sm'
              }`}
              title="Force re-sync code to all student screens"
            >
              {broadcastSentAnim ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              )}
            </button>
          </>
        ) : (
          /* Student Controls (Icons Only in White) */
          <>
            {/* Student Stage Toggle: Code & Visualize to Everyone */}
            {onToggleStudentPresenting && isOpenCodingEnabled && (
              <button
                type="button"
                onClick={onToggleStudentPresenting}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all text-white ${
                  isStudentPresenting
                    ? 'bg-amber-500 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/40 shadow-sm animate-pulse'
                }`}
                title={
                  isStudentPresenting
                    ? 'You are live presenting to class! Click to stop sharing stage'
                    : 'Code & Visualize to Everyone: Take stage to code and mirror live'
                }
              >
                <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            )}

            {/* Student Screen Follow Status Icon */}
            {!isStudentPresenting ? (
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-500/20 text-white border border-sky-500/40 flex items-center justify-center"
                title={`View Screen Only (Following ${activePresenterName || 'Teacher'})`}
              >
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
              </div>
            ) : (
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 text-white border border-emerald-500/40 flex items-center justify-center"
                title="Live Presenter: Class seeing your code and actions live"
              >
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
              </div>
            )}

            {latestTeacherActionNotice && (
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-white flex items-center justify-center animate-in fade-in"
                title={`Latest Action: ${latestTeacherActionNotice}`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
            )}
          </>
        )}
      </div>

      {/* RIGHT: Recording, Dashboard, AV Controls, Hide Navbar, End Session (Icons in White) */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Lecture Recording Studio Icon Button */}
        {onToggleRecording && (
          <div className="relative flex items-center flex-shrink-0">
            {isRecording ? (
              <button
                type="button"
                onClick={onToggleRecording}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center animate-pulse shadow-md border border-rose-400/40"
                title={`REC Active (${recordingDurationStr}) — Click to stop, auto-generate notes & download video`}
              >
                <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
              </button>
            ) : (
              <div className="flex items-center rounded-lg overflow-hidden border border-cyan-500/40 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (onStartLectureRecording) {
                      onStartLectureRecording('lecture_composite');
                    } else {
                      onToggleRecording();
                    }
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white flex items-center justify-center transition-all"
                  title="Record Screen + WebCam PiP Lecture Video"
                >
                  <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowRecModeMenu((prev) => !prev)}
                  className="h-7 sm:h-8 px-1 bg-cyan-700 hover:bg-cyan-600 text-white border-l border-cyan-500/40 flex items-center justify-center transition-colors"
                  title="Select recording format (Screen+Cam, Screen Only, Cam Only)"
                >
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </button>
              </div>
            )}

            {/* Recording Mode Dropdown Menu */}
            {!isRecording && showRecModeMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#0f172a] border border-cyan-500/40 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs text-left">
                <div className="px-2 py-1 font-bold text-white border-b border-slate-800 mb-1 text-[11px] flex items-center justify-between">
                  <span>Select Lecture Format</span>
                  <span className="text-[10px] text-white font-mono">1080p HD</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecModeMenu(false);
                    if (onStartLectureRecording) onStartLectureRecording('lecture_composite');
                    else onToggleRecording();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-cyan-950/60 flex items-start gap-2 text-white transition-colors"
                >
                  <Layers className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white">Screen + WebCam PiP</div>
                    <div className="text-[10px] text-slate-300">Composite canvas with PiP webcam</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecModeMenu(false);
                    if (onStartLectureRecording) onStartLectureRecording('screen_only');
                    else onToggleRecording();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 flex items-start gap-2 text-white transition-colors"
                >
                  <Monitor className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white">Screen Only</div>
                    <div className="text-[10px] text-slate-300">Record visualizer screen only</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRecModeMenu(false);
                    if (onStartLectureRecording) onStartLectureRecording('camera_only');
                    else onToggleRecording();
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800 flex items-start gap-2 text-white transition-colors"
                >
                  <Video className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-white">Camera Only</div>
                    <div className="text-[10px] text-slate-300">Record webcam & microphone only</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Student Classroom Dashboard Icon Button */}
        {!isTeacher && onToggleDashboard && (
          <button
            type="button"
            onClick={onToggleDashboard}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 text-white ${
              isDashboardOpen
                ? 'bg-emerald-500 border-emerald-400 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-emerald-500/30'
            }`}
            title="Classroom Dashboard (Session duration, attendance & statistics)"
          >
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </button>
        )}

        {/* Classroom Conversation Icon Button */}
        <button
          type="button"
          onClick={onToggleConversation}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 text-white ${
            isConversationOpen
              ? 'bg-sky-500 border-sky-400 shadow-sm'
              : 'bg-slate-900 hover:bg-slate-800 border-sky-500/30'
          }`}
          title="Classroom Conversation (Voice Call, Chat, Questions & Hand Raise)"
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>

        {/* Cameras Tiles Toggle Icon Button */}
        <button
          type="button"
          onClick={onToggleVideoTiles}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 text-white ${
            isVideoTilesOpen
              ? 'bg-sky-500/20 border-sky-500/40'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-750'
          }`}
          title="Toggle Classroom Cameras Dock"
        >
          <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>

        {/* Microphone Toggle Icon Button */}
        <button
          type="button"
          onClick={onToggleMic}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 text-white ${
            micActive
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              : 'bg-red-500/20 border-red-500/40'
          }`}
          title={micActive ? 'Microphone: ON (Click to Mute)' : 'Microphone: MUTED (Click to Unmute)'}
        >
          {micActive ? (
            <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          ) : (
            <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          )}
        </button>

        {/* Camera Toggle Icon Button */}
        <button
          type="button"
          onClick={onToggleCamera}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 text-white ${
            cameraActive
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              : 'bg-red-500/20 border-red-500/40'
          }`}
          title={cameraActive ? 'Camera: ON (Click to Turn Off)' : 'Camera: OFF (Click to Turn On)'}
        >
          {cameraActive ? (
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          ) : (
            <VideoOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          )}
        </button>

        {/* Teacher Quick Button: Close Both AV Icon Button */}
        {isTeacher && onCloseBothMedia && (
          <button
            type="button"
            onClick={onCloseBothMedia}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 text-white ${
              cameraActive || micActive
                ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 opacity-60'
            }`}
            title="Turn off both your Camera & Microphone with 1 click"
          >
            <VideoOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </button>
        )}

        {/* Teacher Quick Button: Mute All Students Icon Button */}
        {isTeacher && onTeacherMuteAllStudents && (
          <button
            type="button"
            onClick={onTeacherMuteAllStudents}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-white border border-slate-800 hover:border-rose-500/40 flex items-center justify-center transition-colors flex-shrink-0"
            title="Remotely mute all students' microphones & cameras"
          >
            <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </button>
        )}

        {/* Hide Navbar Icon Button */}
        {onHideHeader && (
          <button
            type="button"
            onClick={onHideHeader}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-750 flex items-center justify-center transition-all flex-shrink-0"
            title="Hide Header Navbar for maximum visual space (Press H to restore)"
          >
            <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </button>
        )}

        {/* End Session Icon Button */}
        <button
          type="button"
          onClick={() => setShowEndSessionConfirm(true)}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-white border border-rose-500/40 flex items-center justify-center transition-all shadow-sm shadow-rose-950/40 flex-shrink-0"
          title="End Classroom Session (Permanent log out)"
        >
          <Power className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>

      {/* Explicit Session End Confirmation Modal */}
      {showEndSessionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-white flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">End Classroom Session?</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Are you sure you want to end this session now? Refreshing the page keeps your session active.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Role:</span>
                <span className="font-bold text-white capitalize">
                  {currentUser.role} ({currentUser.username})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Class Code:</span>
                <span className="font-mono font-bold text-white">{currentUser.classCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session ID:</span>
                <span className="font-mono text-white">{currentUser.sessionId}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span>Page refresh will not end session. Only this button does.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowEndSessionConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndSessionConfirm(false);
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/40 flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5 text-white" />
                <span>Yes, End Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
