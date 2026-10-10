import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Volume2,
  Crown,
  GraduationCap,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { ClassroomUser, ChatMessage } from './classroomTypes';
import { classroomSync } from '../services/classroomSync';
import { insforgeService } from '../services/insforgeService';

interface ClassroomConversationPanelProps {
  currentUser: ClassroomUser;
  peers: ClassroomUser[];
  cameraActive: boolean;
  micActive: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  isOpen: boolean;
  onClose: () => void;
  speakingMap?: Record<string, boolean>;
}

export const ClassroomConversationPanel: React.FC<ClassroomConversationPanelProps> = ({
  currentUser,
  peers,
  cameraActive,
  micActive,
  onToggleCamera,
  onToggleMic,
  isOpen,
  onClose,
  speakingMap = {},
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load message history from InsForge DB on mount/room join
  useEffect(() => {
    if (!currentUser?.classCode) return;
    insforgeService.fetchMessages(currentUser.classCode).then((history) => {
      if (history && history.length > 0) {
        setMessages(history);
      }
    });

    const unsubChat = classroomSync.onChatMessage((msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    const unsubMsg = classroomSync.onMessage((msg) => {
      if (msg.action === 'raise_hand') {
        const handMsg: ChatMessage = {
          id: `hand-${Date.now()}-${Math.random()}`,
          senderSessionId: msg.sender.sessionId,
          senderName: msg.sender.username,
          senderRole: msg.sender.role,
          senderAvatar: msg.sender.avatarColor,
          text: `✋ Raised their hand to ask a question!`,
          timestamp: Date.now(),
          isHandRaise: true,
        };
        setMessages((prev) => [...prev, handMsg]);
      }
    });

    // Periodic message poll to sync messages from InsForge DB across devices
    const msgInterval = setInterval(() => {
      if (currentUser?.classCode) {
        insforgeService.fetchMessages(currentUser.classCode).then((history) => {
          if (history && history.length > 0) {
            setMessages((prev) => {
              const prevIds = new Set(prev.map((m) => m.id));
              const newOnes = history.filter((m) => !prevIds.has(m.id));
              if (newOnes.length === 0) return prev;
              return [...prev, ...newOnes].sort((a, b) => a.timestamp - b.timestamp);
            });
          }
        });
      }
    }, 2000);

    return () => {
      clearInterval(msgInterval);
      unsubChat();
      unsubMsg();
    };
  }, [currentUser?.classCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderSessionId: currentUser.sessionId,
      senderName: currentUser.username,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarColor,
      text: clean,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    classroomSync.broadcastChatMessage(newMsg);
    setInputText('');
  };

  const handleSendQuick = (preset: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderSessionId: currentUser.sessionId,
      senderName: currentUser.username,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatarColor,
      text: preset,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);
    classroomSync.broadcastChatMessage(newMsg);
  };

  const handleRaiseHand = () => {
    setHandRaised(true);
    classroomSync.broadcastRaiseHand();
    setTimeout(() => setHandRaised(false), 4000);
  };

  if (!isOpen) return null;

  // Find who is currently speaking
  const activeSpeaker = peers.find((p) => speakingMap[p.sessionId]);

  return (
    <div
      className={`fixed bottom-14 right-2 sm:right-4 z-45 bg-[#0b1329]/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col transition-all duration-200 overflow-hidden ${
        isMinimized
          ? 'w-72 sm:w-80 h-12'
          : 'w-[calc(100vw-16px)] max-w-sm sm:w-88 md:w-96 h-[480px] max-h-[85vh]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0f1b33] border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Live Classroom Audio & Chat
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Class: {currentUser.classCode} · {peers.length} Members
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-white">
          <button
            type="button"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors text-white"
            title={isMinimized ? 'Expand Conversation' : 'Minimize Conversation'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5 text-white" /> : <Minimize2 className="w-3.5 h-3.5 text-white" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:text-red-400 hover:bg-slate-800 rounded transition-colors text-white"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Audio & Speaking Call Bar */}
          <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  activeSpeaker
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : micActive
                    ? 'bg-sky-500/20 text-white'
                    : 'bg-slate-800 text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-white" />
              </div>

              <div className="truncate">
                {activeSpeaker ? (
                  <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{activeSpeaker.username} is speaking...</span>
                  </div>
                ) : micActive ? (
                  <div className="text-[11px] text-sky-300 font-medium">
                    Mic is live · Voice ready
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Mic muted · Click unmute to speak
                  </div>
                )}
              </div>
            </div>

            {/* Quick Voice & Hand Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {currentUser.role === 'student' && (
                <button
                  type="button"
                  onClick={handleRaiseHand}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    handRaised
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-bounce'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                  title="Raise hand to ask teacher a question"
                >
                  <Hand className="w-3 h-3 text-white" />
                  <span>{handRaised ? 'Hand Raised!' : 'Raise Hand'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleMic}
                className={`p-1.5 rounded-md border text-xs transition-colors ${
                  micActive
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/40'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                }`}
                title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micActive ? <Mic className="w-3.5 h-3.5 text-white" /> : <MicOff className="w-3.5 h-3.5 text-white" />}
              </button>

              <button
                type="button"
                onClick={onToggleCamera}
                className={`p-1.5 rounded-md border text-xs transition-colors ${
                  cameraActive
                    ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border-sky-500/40'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                }`}
                title={cameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
              >
                {cameraActive ? <Video className="w-3.5 h-3.5 text-white" /> : <VideoOff className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                <Sparkles className="w-6 h-6 text-white mb-1.5" />
                <p className="font-medium text-slate-400">Classroom conversation is open!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Send questions, chat with the teacher, or unmute your microphone to talk live.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderSessionId === currentUser.sessionId;
                const isTeacher = m.senderRole === 'teacher';

                if (m.isHandRaise) {
                  return (
                    <div
                      key={m.id}
                      className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px] flex items-center gap-2 animate-in fade-in"
                    >
                      <Hand className="w-4 h-4 text-white flex-shrink-0 animate-bounce" />
                      <div>
                        <b>{m.senderName}</b> raised hand to ask a question!
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: m.senderAvatar || '#38bdf8' }}
                      />
                      <span className="font-semibold text-slate-300">
                        {m.senderName} {isMe && '(You)'}
                      </span>
                      {isTeacher ? (
                        <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold text-[9px] flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-white" /> Teacher
                        </span>
                      ) : (
                        <span className="px-1 py-0.2 bg-sky-500/20 text-sky-300 rounded text-[9px] flex items-center gap-0.5">
                          <GraduationCap className="w-2.5 h-2.5 text-white" /> Student
                        </span>
                      )}
                      <span className="text-[9px] opacity-60">
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-[12px] leading-relaxed break-words shadow-sm ${
                        isMe
                          ? 'bg-sky-600 text-white rounded-br-xs'
                          : isTeacher
                          ? 'bg-amber-950/70 text-amber-100 border border-amber-500/30 rounded-bl-xs'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-2.5 py-1 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none flex-shrink-0">
            <span className="text-slate-500 font-semibold flex-shrink-0">Quick:</span>
            {[
              'Please explain line 1 ✋',
              'Can you run the code?',
              'Why did this output appear?',
              'Understood! 👍',
              'Please step forward ⏩',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSendQuick(chip)}
                className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap border border-slate-750 transition-colors flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-[#0f1b33] border-t border-slate-800 flex items-center gap-1.5 flex-shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                currentUser.role === 'teacher'
                  ? 'Message classroom or students...'
                  : 'Ask teacher a question...'
              }
              className="flex-1 bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold transition-all shadow-md shadow-sky-950/40"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
