import React, { useRef, useState } from 'react';
import {
  Film,
  Download,
  Copy,
  Check,
  X,
  Clock,
  Layers,
  FileText,
  Code2,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { LectureResult } from '../services/lectureRecorderService';

interface LectureVideoModalProps {
  lecture: LectureResult;
  onClose: () => void;
}

export const LectureVideoModal: React.FC<LectureVideoModalProps> = ({
  lecture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeTab, setActiveTab] = useState<'chapters' | 'notes' | 'code'>('chapters');
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const seekTo = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCopyNotes = async () => {
    await navigator.clipboard.writeText(lecture.notesMarkdown);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const latestCode = lecture.codeSnapshots.length > 0
    ? lecture.codeSnapshots[lecture.codeSnapshots.length - 1]
    : '';

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(latestCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([lecture.notesMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lecture.filename.replace(/\.webm$/, '-lecture-notes.md');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b1328] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/60 overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {lecture.topicTitle || 'Automatic Python Lecture Video'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Screen + WebCam PiP</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                <span>
                  Instructor: <strong className="text-slate-200">{lecture.instructorName || 'Teacher'}</strong>
                </span>
                <span>•</span>
                <span>
                  Classroom: <strong className="text-slate-200">{lecture.classCode}</strong>
                </span>
                <span>•</span>
                <span>
                  Duration: <strong className="text-cyan-400 font-mono">{lecture.durationStr}</strong> ({lecture.sizeMb} MB)
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Close Lecture Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden bg-black border border-slate-800 relative group shadow-lg">
            <video
              ref={videoRef}
              src={lecture.videoUrl}
              controls
              playsInline
              className="w-full max-h-[380px] object-contain bg-black"
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('chapters')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chapters'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chapters & Timeline ({lecture.chapters.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'notes'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Auto Lecture Notes (.md)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'code'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python Code ({lecture.codeSnapshots.length} revisions)</span>
            </button>
          </div>

          {/* Tab 1: Chapters */}
          {activeTab === 'chapters' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Click any chapter to jump directly to that point in the lecture video:</span>
                <span className="text-cyan-400 font-mono text-[10px]">Auto-tracked events</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lecture.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => seekTo(ch.timeSec)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="px-2 py-0.5 rounded bg-slate-800 group-hover:bg-cyan-900/60 text-cyan-400 font-mono text-[11px] font-bold flex-shrink-0">
                        {ch.timestampStr}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200 truncate">
                          {ch.title}
                        </div>
                        {ch.detail && (
                          <div className="text-[10px] text-slate-400 truncate">{ch.detail}</div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Auto Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Auto-generated comprehensive lecture notes with chapters and code:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyNotes}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    {copiedNotes ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    <span>{copiedNotes ? 'Copied' : 'Copy Notes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadNotes}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download (.md)</span>
                  </button>
                </div>
              </div>
              <div className="p-3 bg-[#070d19] rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-56 whitespace-pre-wrap">
                {lecture.notesMarkdown}
              </div>
            </div>
          )}

          {/* Tab 3: Code Snapshot */}
          {activeTab === 'code' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Python code analyzed and visualized during this lecture session:</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Latest Code'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#070d19] rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-56">
                <pre>{latestCode || '# No code recorded in session'}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono truncate max-w-xs">
              <Check className="w-4 h-4 flex-shrink-0 text-white" />
              <span className="truncate">{lecture.filename}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">({lecture.sizeMb} MB)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Download Notes (.md)</span>
            </button>

            <a
              href={lecture.videoUrl}
              download={lecture.filename}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/60"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download Video Again</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
