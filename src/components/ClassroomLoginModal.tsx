import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Crown,
  KeyRound,
  Video,
  VideoOff,
  Mic,
  MicOff,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { ClassroomUser, TEACHER_MASTER_PIN, UserRole } from './classroomTypes';
import { getOrCreateWindowSessionId } from '../services/classroomSync';

interface ClassroomLoginModalProps {
  onLoginSuccess: (user: ClassroomUser, stream: MediaStream | null) => void;
}

export const ClassroomLoginModal: React.FC<ClassroomLoginModalProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionId, setSessionId] = useState('');

  // Media states
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaStatus, setMediaStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const id = getOrCreateWindowSessionId();
    setSessionId(id);

    // Default friendly usernames
    if (role === 'teacher') {
      setUsername('Prof. Python');
    } else {
      setUsername(`Student ${id.slice(-3)}`);
    }
  }, [role]);

  // Request Camera & Mic
  const requestMediaPermissions = async () => {
    setMediaStatus('requesting');
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      setMediaStatus('granted');
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Media devices access declined or unavailable:', err);
      // Try video-only or audio-only fallback
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  // Toggle Video Track
  const toggleCamera = () => {
    if (mediaStream) {
      const videoTracks = mediaStream.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !cameraEnabled));
    }
    setCameraEnabled((prev) => !prev);
  };

  // Toggle Audio Track
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

  const handleFillMasterPin = () => {
    setPin(TEACHER_MASTER_PIN);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMsg('Please enter a username to join the classroom.');
      return;
    }

    if (role === 'teacher') {
      const cleanPin = pin.trim();
      if (!cleanPin) {
        setErrorMsg('Teacher PIN is required. Enter 2244244452665339 to enter as Teacher.');
        return;
      }
      if (cleanPin !== TEACHER_MASTER_PIN) {
        setErrorMsg('Invalid Teacher PIN! Must be 2244244452665339.');
        return;
      }
    }

    // If media not yet requested and user allowed, attempt auto-request
    let activeStream = mediaStream;
    if (mediaStatus === 'idle' && (cameraEnabled || micEnabled)) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: cameraEnabled,
          audio: micEnabled,
        });
      } catch {
        // Continue gracefully even if permission denied
      }
    }

    const newUser: ClassroomUser = {
      sessionId,
      role,
      username: cleanUsername,
      joinedAt: Date.now(),
      cameraActive: cameraEnabled && (mediaStatus === 'granted' || !!activeStream),
      micActive: micEnabled && (mediaStatus === 'granted' || !!activeStream),
      avatarColor: role === 'teacher' ? '#f59e0b' : '#38bdf8',
      lastPing: Date.now(),
    };

    onLoginSuccess(newUser, activeStream);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500" />

        <div className="p-6 md:p-8">
          {/* Header Title */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Python Classroom Live
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Broadcast
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select your role to connect with all students and teachers live
                </p>
              </div>
            </div>

            {/* Window Session ID Tag */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Window Session
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-400 bg-sky-950/50 border border-sky-800/50 px-2 py-0.5 rounded-md">
                <span>{sessionId}</span>
                <button
                  type="button"
                  onClick={handleGenerateNewSessionId}
                  title="Generate new Session ID for this window"
                  className="hover:text-sky-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#090e17] rounded-xl border border-slate-800 mb-6">
            {/* Student Role Button */}
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                role === 'student'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>Student</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Free
              </span>
            </button>

            {/* Teacher Role Button */}
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                role === 'teacher'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Teacher</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PIN Req.
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
                  placeholder={role === 'teacher' ? 'e.g. Prof. Alan' : 'e.g. Alex / Zaid'}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#090e17] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                  required
                />
              </div>
            </div>

            {/* Teacher PIN Input (ONLY for Teacher role) */}
            {role === 'teacher' && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Teacher Security PIN
                  </label>
                  <button
                    type="button"
                    onClick={handleFillMasterPin}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono font-medium"
                  >
                    Use Master PIN (2244244452665339)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 16-digit PIN (2244244452665339)"
                    className="w-full px-3 py-2 bg-[#090e17] border border-amber-500/40 rounded-lg text-amber-200 placeholder-slate-500 text-sm font-mono tracking-wider focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  Only authorized instructors with PIN <code>2244244452665339</code> can broadcast code live.
                </p>
              </div>
            )}

            {/* Student Free Badge */}
            {role === 'student' && (
              <div className="p-3 bg-sky-950/20 border border-sky-500/20 rounded-xl flex items-center gap-2.5 text-xs text-sky-300">
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>
                  Students join for <b>free without any PIN</b>. You will see teacher code live and can modify it in your own window.
                </span>
              </div>
            )}

            {/* Camera & Mic Permission Box */}
            <div className="p-3.5 bg-[#090e17] border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Camera & Microphone Setup
                  </span>
                  {mediaStatus === 'granted' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Connected
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
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline flex items-center gap-1"
                  >
                    {mediaStatus === 'requesting' ? 'Testing...' : 'Allow & Test'}
                  </button>
                )}
              </div>

              {/* Media Controls & Live Preview */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
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
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
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
                <div className="w-14 h-10 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                  {mediaStatus === 'granted' && cameraEnabled ? (
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      {role === 'teacher' ? '👑' : '🎓'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl text-xs text-red-300 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                role === 'teacher'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-900/30'
                  : 'bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 shadow-sky-900/30'
              }`}
            >
              <span>Enter Classroom as {role === 'teacher' ? 'Teacher' : 'Student'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer window info */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Window ID: <code className="text-slate-300 font-mono">{sessionId}</code></span>
            <span>Open multiple windows to test multi-student sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
