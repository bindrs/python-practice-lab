import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Crown,
  Video,
  VideoOff,
  Mic,
  MicOff,
  User,
  ArrowRight,
  Info,
  RefreshCw,
  Smartphone,
  Laptop,
  Copy,
  Check,
  Sparkles,
  Hash,
} from 'lucide-react';
import { ClassroomUser, UserRole } from './classroomTypes';
import {
  generateRandomClassCode,
  getOrCreateWindowSessionId,
  classroomSync,
} from '../services/classroomSync';
import { insforgeService } from '../services/insforgeService';

interface ClassroomLoginModalProps {
  onLoginSuccess: (user: ClassroomUser, stream: MediaStream | null) => void;
}

export const ClassroomLoginModal: React.FC<ClassroomLoginModalProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [classCode, setClassCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [copiedSession, setCopiedSession] = useState(false);
  const [copiedClassCode, setCopiedClassCode] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'laptop'>('laptop');
  const [detectedTeacherClass, setDetectedTeacherClass] = useState<{
    classCode: string;
    teacherName: string;
    timestamp?: number;
  } | null>(null);

  // Media states
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaStatus, setMediaStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Detect mobile vs laptop/desktop
    const checkDevice = () => {
      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setDeviceType(isMobile ? 'mobile' : 'laptop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    const id = getOrCreateWindowSessionId();
    setSessionId(id);

    // Check if an active teacher class exists in memory/storage
    const activeClass = classroomSync.getActiveTeacherClass();
    if (activeClass) {
      setDetectedTeacherClass(activeClass);
      if (role === 'student' && !classCode) {
        setClassCode(activeClass.classCode);
      }
    }

    // Also check InsForge database for any active teacher class across devices
    insforgeService.fetchLatestActiveClass().then((cloudClass) => {
      if (cloudClass) {
        setDetectedTeacherClass((prev) => {
          if (!prev || cloudClass.timestamp > (prev.timestamp || 0)) {
            return cloudClass;
          }
          return prev;
        });
        if (role === 'student') {
          setClassCode((prev) => prev || cloudClass.classCode);
        }
      }
    }).catch(() => {});

    // Role-based defaults
    if (role === 'teacher') {
      setUsername('Prof. Python');
      if (!classCode) {
        setClassCode(generateRandomClassCode());
      }
    } else {
      setUsername(`Student ${id.slice(-3)}`);
      if (activeClass) {
        setClassCode(activeClass.classCode);
      }
    }

    return () => window.removeEventListener('resize', checkDevice);
  }, [role]);

  // Request Camera & Mic (Front-facing on mobile)
  const requestMediaPermissions = async () => {
    setMediaStatus('requesting');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      setMediaStream(stream);
      setMediaStatus('granted');
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Media devices access declined or unavailable:', err);
      // Try video-only fallback
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        });
        setMediaStream(videoStream);
        setMediaStatus('granted');
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = videoStream;
        }
      } catch {
        setMediaStatus('denied');
      }
    }
  };

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !cameraEnabled));
    }
    setCameraEnabled((prev) => !prev);
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !micEnabled));
    }
    setMicEnabled((prev) => !prev);
  };

  const handleGenerateNewSessionId = () => {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newId = `SES-${rand}`;
    sessionStorage.setItem('classroom_window_session_id', newId);
    setSessionId(newId);
    if (role === 'student') {
      setUsername(`Student ${newId.slice(-3)}`);
    }
  };

  const handleCopySessionId = () => {
    navigator.clipboard?.writeText(sessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  const handleCopyClassCode = () => {
    navigator.clipboard?.writeText(classCode);
    setCopiedClassCode(true);
    setTimeout(() => setCopiedClassCode(false), 2000);
  };

  const handleGenerateNewClassCode = () => {
    setClassCode(generateRandomClassCode());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMsg('Please enter your username.');
      return;
    }

    const cleanCode = classCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg(
        role === 'student'
          ? 'Please enter the Class Code given by your teacher (e.g. PY-4821).'
          : 'Please enter or generate a Class Code for your students.'
      );
      return;
    }

    // Auto-request media if user left switches ON and hasn't prompted yet
    let activeStream = mediaStream;
    if (mediaStatus === 'idle' && (cameraEnabled || micEnabled)) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: cameraEnabled ? { facingMode: 'user' } : false,
          audio: micEnabled,
        });
      } catch {
        // Fallback gracefully without throwing
      }
    }

    const newUser: ClassroomUser = {
      sessionId,
      role,
      username: cleanUsername,
      classCode: cleanCode,
      joinedAt: Date.now(),
      cameraActive: cameraEnabled && (mediaStatus === 'granted' || !!activeStream),
      micActive: micEnabled && (mediaStatus === 'granted' || !!activeStream),
      avatarColor: role === 'teacher' ? '#f59e0b' : '#38bdf8',
      lastPing: Date.now(),
    };

    onLoginSuccess(newUser, activeStream);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg md:max-w-xl bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Rainbow Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 flex-shrink-0" />

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Header Title & Device Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                    Python Classroom Live
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Class Code Connect
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Teachers host classes &amp; students connect using the teacher's Class Code
                </p>
              </div>
            </div>

            {/* Device Indicator */}
            <div className="hidden xs:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg flex-shrink-0">
              {deviceType === 'mobile' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mobile</span>
                </>
              ) : (
                <>
                  <Laptop className="w-3.5 h-3.5 text-amber-400" />
                  <span>Laptop</span>
                </>
              )}
            </div>
          </div>

          {/* Window Session ID Box */}
          <div className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">
                Window Session ID:
              </span>
              <span className="font-mono font-bold text-sky-400 truncate">{sessionId}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleCopySessionId}
                className="p-1 sm:px-2 sm:py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                title="Copy Session ID"
              >
                {copiedSession ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="hidden sm:inline">{copiedSession ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleGenerateNewSessionId}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Generate new Session ID for this window"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 p-1.5 bg-[#090e17] rounded-xl border border-slate-800">
            {/* Student Role Button */}
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all min-h-[44px] ${
                role === 'student'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Student</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Join Class
              </span>
            </button>

            {/* Teacher Role Button (No PIN credential needed) */}
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all min-h-[44px] ${
                role === 'teacher'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Teacher</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Host Class
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'teacher' ? 'e.g. Prof. Python / Dr. Alan' : 'e.g. Alex / Mia'}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#090e17] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Class Code Input Area */}
            {role === 'teacher' ? (
              /* TEACHER: Host / Share Class Code */
              <div className="p-3.5 sm:p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    Teacher's Class Code (Give this to students)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewClassCode}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    New Code
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PY-4821"
                    className="w-full pl-3 pr-20 py-2.5 bg-[#090e17] border border-amber-500/40 rounded-lg text-amber-200 placeholder-slate-500 text-base font-mono font-bold tracking-wider focus:outline-none focus:border-amber-400 transition-all min-h-[44px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleCopyClassCode}
                    className="absolute right-2 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono rounded flex items-center gap-1 border border-amber-500/30"
                    title="Copy Class Code"
                  >
                    {copiedClassCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedClassCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-amber-300/80 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  No password needed. Students enter this code <code>{classCode}</code> to connect to your live classroom.
                </p>
              </div>
            ) : (
              /* STUDENT: Enter Class Code Given by Teacher */
              <div className="p-3.5 sm:p-4 bg-sky-950/20 border border-sky-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-sky-400" />
                    Class Code (Given by Teacher)
                  </label>
                  {detectedTeacherClass && (
                    <button
                      type="button"
                      onClick={() => setClassCode(detectedTeacherClass.classCode)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 underline font-mono flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Use {detectedTeacherClass.classCode}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="Enter Class Code (e.g. PY-4821)"
                    className="w-full px-3 py-2.5 bg-[#090e17] border border-sky-500/40 rounded-lg text-sky-200 placeholder-slate-500 text-base font-mono font-bold tracking-wider focus:outline-none focus:border-sky-400 transition-all min-h-[44px]"
                    required
                  />
                </div>

                {detectedTeacherClass ? (
                  <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex items-center justify-between text-[11px] text-emerald-300">
                    <span>
                      Active Teacher: <b>{detectedTeacherClass.teacherName}</b> (Code:{' '}
                      <code>{detectedTeacherClass.classCode}</code>)
                    </span>
                    <button
                      type="button"
                      onClick={() => setClassCode(detectedTeacherClass.classCode)}
                      className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400 transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-sky-300/80 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    Ask your teacher for their <b>Class Code</b> to join their live room.
                  </p>
                )}
              </div>
            )}

            {/* Camera & Mic Permission Box (Touch & Mobile Responsive) */}
            <div className="p-3 sm:p-3.5 bg-[#090e17] border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Camera &amp; Microphone Setup
                  </span>
                  {mediaStatus === 'granted' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                  {mediaStatus === 'denied' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Avatar Mode
                    </span>
                  )}
                </div>

                {mediaStatus !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestMediaPermissions}
                    disabled={mediaStatus === 'requesting'}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline"
                  >
                    {mediaStatus === 'requesting' ? 'Testing...' : 'Allow & Test'}
                  </button>
                )}
              </div>

              {/* Media Controls & Live Preview */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border font-medium transition-all min-h-[38px] ${
                      cameraEnabled
                        ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {cameraEnabled ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5" />}
                    <span>{cameraEnabled ? 'Camera ON' : 'Camera OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border font-medium transition-all min-h-[38px] ${
                      micEnabled
                        ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {micEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
                    <span>{micEnabled ? 'Mic ON' : 'Muted'}</span>
                  </button>
                </div>

                {/* Video Preview Element */}
                <div className="w-14 h-11 sm:w-16 sm:h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center relative shadow-inner flex-shrink-0">
                  {mediaStatus === 'granted' && cameraEnabled ? (
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  ) : (
                    <span className="text-xs font-mono text-slate-400">
                      {role === 'teacher' ? '👑' : '🎓'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all min-h-[48px] ${
                role === 'teacher'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-900/30'
                  : 'bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 shadow-sky-900/30'
              }`}
            >
              <span>
                {role === 'teacher'
                  ? `Start Classroom (Code: ${classCode || '...'})`
                  : `Connect to Class (${classCode || 'Enter Code'})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer window info */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
            <span>Window ID: <code className="text-slate-300 font-mono">{sessionId}</code></span>
            <span>Mobile &amp; Laptop Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
