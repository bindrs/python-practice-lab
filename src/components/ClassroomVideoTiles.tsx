import React, { useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Crown,
  GraduationCap,
  Minimize2,
  Maximize2,
  X,
  Volume2,
} from 'lucide-react';
import { ClassroomUser } from './classroomTypes';

interface ClassroomVideoTilesProps {
  currentUser: ClassroomUser;
  peers: ClassroomUser[];
  mediaStream: MediaStream | null;
  remoteStreams?: Map<string, MediaStream>;
  cameraActive: boolean;
  micActive: boolean;
  speakingMap?: Record<string, boolean>;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onClose: () => void;
}

export const ClassroomVideoTiles: React.FC<ClassroomVideoTilesProps> = ({
  currentUser,
  peers,
  mediaStream,
  remoteStreams = new Map(),
  cameraActive,
  micActive,
  speakingMap = {},
  onToggleCamera,
  onToggleMic,
  onClose,
}) => {
  const selfVideoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = React.useState(false);

  useEffect(() => {
    if (selfVideoRef.current && mediaStream) {
      selfVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, cameraActive]);

  // Combine peers list ensuring current user is included
  const otherPeers = peers.filter((p) => p.sessionId !== currentUser.sessionId);
  const isSelfSpeaking = !!speakingMap[currentUser.sessionId];

  return (
    <div
      className={`fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 bg-[#0f172a]/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-200 ${
        isMinimized
          ? 'w-52 sm:w-64 h-11'
          : 'w-[calc(100vw-20px)] max-w-sm sm:w-80 md:w-96 max-h-[490px]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            Classroom Video & Audio
            <span className="text-[10px] text-slate-400 font-mono font-normal">
              ({peers.length} active)
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isMinimized ? 'Expand Video Tiles' : 'Minimize Video Tiles'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
            title="Close Video Dock"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tiles Body */}
      {!isMinimized && (
        <div className="p-3 space-y-2.5 overflow-y-auto max-h-[420px]">
          {/* 1. Self Video Tile */}
          <div
            className={`relative aspect-video rounded-xl bg-slate-950 border overflow-hidden shadow-inner group transition-all ${
              isSelfSpeaking
                ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                : 'border-slate-800'
            }`}
          >
            {mediaStream && cameraActive ? (
              <video
                ref={selfVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-400">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg transition-transform ${
                    isSelfSpeaking ? 'scale-110 ring-4 ring-emerald-400/50' : ''
                  }`}
                  style={{ backgroundColor: currentUser.avatarColor || '#38bdf8' }}
                >
                  {currentUser.role === 'teacher' ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : (
                    currentUser.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  {isSelfSpeaking ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-white animate-pulse" /> Speaking...
                    </span>
                  ) : (
                    <span>Camera Off</span>
                  )}
                </div>
              </div>
            )}

            {/* User Badge Overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white border border-white/10">
              {currentUser.role === 'teacher' ? (
                <Crown className="w-3 h-3 text-white" />
              ) : (
                <GraduationCap className="w-3 h-3 text-white" />
              )}
              <span className="truncate max-w-[100px]">{currentUser.username} (You)</span>
              {isSelfSpeaking && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>

            {/* Role indicator pill */}
            <div className="absolute top-2 right-2">
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  currentUser.role === 'teacher'
                    ? 'bg-amber-500/80 text-amber-950'
                    : 'bg-sky-500/80 text-sky-950'
                }`}
              >
                {currentUser.role === 'teacher' ? 'Teacher' : 'Student (View Only)'}
              </span>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleMic}
                className={`p-1.5 rounded-md text-xs backdrop-blur-md transition-all ${
                  micActive
                    ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white'
                    : 'bg-red-500/80 hover:bg-red-500 text-white'
                }`}
                title={micActive ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={onToggleCamera}
                className={`p-1.5 rounded-md text-xs backdrop-blur-md transition-all ${
                  cameraActive
                    ? 'bg-sky-500/80 hover:bg-sky-500 text-white'
                    : 'bg-red-500/80 hover:bg-red-500 text-white'
                }`}
                title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 2. Other Peers Tiles (Grid) */}
          {otherPeers.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {otherPeers.map((peer) => {
                const isPeerSpeaking = !!speakingMap[peer.sessionId];
                const remoteStream = remoteStreams.get(peer.sessionId);

                return (
                  <PeerVideoTile
                    key={peer.sessionId}
                    peer={peer}
                    remoteStream={remoteStream}
                    isSpeaking={isPeerSpeaking}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-3 text-[11px] text-slate-400 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
              <span>No other students or teachers in this room yet.</span>
              <br />
              <span className="text-[10px] text-slate-500">
                Open student in another tab to see live audio & screen mirroring.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PeerVideoTileProps {
  peer: ClassroomUser;
  remoteStream?: MediaStream;
  isSpeaking: boolean;
}

const PeerVideoTile: React.FC<PeerVideoTileProps> = ({ peer, remoteStream, isSpeaking }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (remoteStream) {
      if (videoRef.current && peer.cameraActive) {
        videoRef.current.srcObject = remoteStream;
      }
      if (audioRef.current && peer.micActive) {
        audioRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream, peer.cameraActive, peer.micActive]);

  const hasVideoTrack = remoteStream && remoteStream.getVideoTracks().length > 0 && peer.cameraActive;

  return (
    <div
      className={`relative aspect-video rounded-lg bg-slate-950 border overflow-hidden flex flex-col items-center justify-center p-2 text-center transition-all ${
        isSpeaking
          ? 'border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50'
          : 'border-slate-800'
      }`}
    >
      {/* Hidden audio element to play remote audio */}
      {remoteStream && <audio ref={audioRef} autoPlay playsInline />}

      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow transition-transform ${
              isSpeaking ? 'scale-110 ring-2 ring-emerald-400' : ''
            }`}
            style={{ backgroundColor: peer.avatarColor || '#a855f7' }}
          >
            {peer.role === 'teacher' ? (
              <Crown className="w-4 h-4 text-white" />
            ) : (
              peer.username.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-300 mt-1 truncate max-w-[90%]">
            {peer.username}
          </span>
          <span className="text-[8px] font-mono text-slate-500">
            {peer.role === 'teacher' ? 'Teacher' : 'Student (View Only)'}
          </span>
        </>
      )}

      {/* Status Indicators */}
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        {isSpeaking ? (
          <span className="px-1 py-0.5 rounded bg-emerald-500/80 text-white text-[8px] font-bold flex items-center gap-0.5">
            <Volume2 className="w-2.5 h-2.5 text-white animate-pulse" /> Speaking
          </span>
        ) : peer.micActive ? (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Mic active" />
        ) : (
          <span title="Mic muted">
            <MicOff className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>

      {/* Name banner overlay if video is active */}
      {hasVideoTrack && (
        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white backdrop-blur-xs">
          <span className="truncate">{peer.username}</span>
          <span className="text-[8px] opacity-75">{peer.role}</span>
        </div>
      )}
    </div>
  );
};
