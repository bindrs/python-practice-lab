/**
 * Lecture Recorder Service: Captures Screen + Webcam simultaneously
 * with Canvas Compositing, Picture-in-Picture (PiP), Mixed Audio,
 * Automatic Chapter Indexing, and Auto-Generated Lecture Notes.
 */

export interface LectureChapter {
  timeSec: number;
  timestampStr: string; // e.g. "00:15"
  title: string;
  detail?: string;
  type?: 'intro' | 'run' | 'step' | 'reset' | 'example' | 'tab' | 'custom';
}

export type PipPosition = 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';

export interface LectureRecordingConfig {
  instructorName: string;
  classCode: string;
  topicTitle?: string;
  mode: 'lecture_composite' | 'screen_only' | 'camera_only';
  pipPosition?: PipPosition;
  webcamStream?: MediaStream | null;
}

export interface LectureResult {
  videoBlob: Blob;
  videoUrl: string;
  filename: string;
  duration: number;
  durationStr: string;
  chapters: LectureChapter[];
  notesMarkdown: string;
  codeSnapshots: string[];
  topicTitle: string;
  instructorName: string;
  classCode: string;
  recordedAt: string;
  sizeMb: string;
}

export class LectureRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private screenStream: MediaStream | null = null;
  private webcamStream: MediaStream | null = null;
  private combinedStream: MediaStream | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  private screenVideoEl: HTMLVideoElement | null = null;
  private webcamVideoEl: HTMLVideoElement | null = null;

  private audioContext: AudioContext | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;

  private isRecordingActive = false;
  private startTime = 0;
  private durationSec = 0;
  private timerInterval: any = null;

  private currentConfig: LectureRecordingConfig | null = null;
  private chapters: LectureChapter[] = [];
  private codeSnapshots: string[] = [];
  private consoleOutputs: string[] = [];
  private onDurationUpdateCallbacks: ((sec: number, str: string) => void)[] = [];
  private onChapterAddedCallbacks: ((chapter: LectureChapter) => void)[] = [];
  private onFinishedCallbacks: ((result: LectureResult) => void)[] = [];

  public isRecording(): boolean {
    return this.isRecordingActive;
  }

  public getDuration(): number {
    return this.durationSec;
  }

  public getDurationStr(): string {
    return this.formatTime(this.durationSec);
  }

  public getChapters(): LectureChapter[] {
    return [...this.chapters];
  }

  public onFinished(cb: (result: LectureResult) => void): () => void {
    this.onFinishedCallbacks.push(cb);
    return () => {
      this.onFinishedCallbacks = this.onFinishedCallbacks.filter((c) => c !== cb);
    };
  }

  public onDurationUpdate(cb: (sec: number, str: string) => void): () => void {
    this.onDurationUpdateCallbacks.push(cb);
    return () => {
      this.onDurationUpdateCallbacks = this.onDurationUpdateCallbacks.filter((c) => c !== cb);
    };
  }

  public onChapterAdded(cb: (chapter: LectureChapter) => void): () => void {
    this.onChapterAddedCallbacks.push(cb);
    return () => {
      this.onChapterAddedCallbacks = this.onChapterAddedCallbacks.filter((c) => c !== cb);
    };
  }

  public addChapter(title: string, detail?: string, type: LectureChapter['type'] = 'custom') {
    if (!this.isRecordingActive) return;
    const timeSec = this.durationSec;
    const timestampStr = this.formatTime(timeSec);

    // Prevent duplicate chapters in the same 2 seconds with the same title
    const lastChapter = this.chapters[this.chapters.length - 1];
    if (lastChapter && lastChapter.title === title && Math.abs(lastChapter.timeSec - timeSec) < 2) {
      return;
    }

    const chapter: LectureChapter = {
      timeSec,
      timestampStr,
      title,
      detail,
      type,
    };
    this.chapters.push(chapter);
    this.onChapterAddedCallbacks.forEach((cb) => cb(chapter));
  }

  public recordCodeSnapshot(code: string, output?: string) {
    if (!this.isRecordingActive) return;
    if (code && !this.codeSnapshots.includes(code)) {
      this.codeSnapshots.push(code);
    }
    if (output && !this.consoleOutputs.includes(output)) {
      this.consoleOutputs.push(output);
    }
  }

  /**
   * Start Lecture Recording
   */
  public async startRecording(config: LectureRecordingConfig): Promise<void> {
    if (this.isRecordingActive) {
      throw new Error('Recording is already in progress');
    }

    this.currentConfig = {
      pipPosition: 'bottom-right',
      ...config,
    };
    this.chapters = [];
    this.codeSnapshots = [];
    this.consoleOutputs = [];
    this.recordedChunks = [];
    this.durationSec = 0;

    // 1. Acquire screen stream if mode requires it
    if (config.mode === 'lecture_composite' || config.mode === 'screen_only') {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
            frameRate: { ideal: 30, max: 60 },
          },
          audio: true, // system/display audio if available
        });
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          throw new Error('Screen sharing permission was cancelled or denied.');
        }
        throw err;
      }
    }

    // 2. Acquire webcam stream if mode requires it
    if (config.mode === 'lecture_composite' || config.mode === 'camera_only') {
      if (config.webcamStream && config.webcamStream.getVideoTracks().length > 0) {
        this.webcamStream = config.webcamStream;
      } else {
        try {
          this.webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            },
            audio: true,
          });
        } catch (err: any) {
          console.warn('Could not acquire webcam stream for lecture recording:', err);
          // If in composite mode and camera fails, fallback to screen-only
          if (config.mode === 'lecture_composite' && this.screenStream) {
            config.mode = 'screen_only';
          } else {
            throw new Error('Camera or microphone permission was denied.');
          }
        }
      }
    }

    // 3. Setup Audio Mixing via AudioContext
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.audioContext = new AudioCtx();
      this.audioDestination = this.audioContext.createMediaStreamDestination();

      // Connect screen audio if available
      if (this.screenStream && this.screenStream.getAudioTracks().length > 0) {
        try {
          const screenAudioSource = this.audioContext.createMediaStreamSource(this.screenStream);
          screenAudioSource.connect(this.audioDestination);
        } catch {
          // ignore
        }
      }

      // Connect microphone/webcam audio if available
      if (this.webcamStream && this.webcamStream.getAudioTracks().length > 0) {
        try {
          const micAudioSource = this.audioContext.createMediaStreamSource(this.webcamStream);
          micAudioSource.connect(this.audioDestination);
        } catch {
          // ignore
        }
      }
    }

    // 4. Setup Video Canvas Compositor (Full HD 1920x1080)
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    // Create hidden video elements to read stream frames
    if (this.screenStream) {
      this.screenVideoEl = document.createElement('video');
      this.screenVideoEl.srcObject = this.screenStream;
      this.screenVideoEl.muted = true;
      this.screenVideoEl.playsInline = true;
      await this.screenVideoEl.play();

      // If user stops screen sharing via browser native floating bar:
      this.screenStream.getVideoTracks()[0].onended = () => {
        if (this.isRecordingActive) {
          this.stopRecording().catch(() => {});
        }
      };
    }

    if (this.webcamStream) {
      this.webcamVideoEl = document.createElement('video');
      this.webcamVideoEl.srcObject = this.webcamStream;
      this.webcamVideoEl.muted = true;
      this.webcamVideoEl.playsInline = true;
      await this.webcamVideoEl.play();
    }

    // Start Compositor Render Loop
    this.startRenderLoop();

    // 5. Build Combined MediaStream
    const canvasStream = this.canvas.captureStream(30);
    const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

    if (this.audioDestination && this.audioDestination.stream.getAudioTracks().length > 0) {
      tracks.push(...this.audioDestination.stream.getAudioTracks());
    } else if (this.webcamStream && this.webcamStream.getAudioTracks().length > 0) {
      tracks.push(...this.webcamStream.getAudioTracks());
    }

    this.combinedStream = new MediaStream(tracks);

    // 6. Setup MediaRecorder
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    let selectedMime = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';
    const options = selectedMime ? { mimeType: selectedMime } : undefined;

    this.mediaRecorder = new MediaRecorder(this.combinedStream, options);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(1000); // 1-second chunks
    this.isRecordingActive = true;
    this.startTime = Date.now();

    // 7. Initial Chapter
    const initialTopic = config.topicTitle || 'Lecture Introduction';
    this.addChapter(`🎬 ${initialTopic}`, 'Session started with Python Visualizer Studio', 'intro');

    // Timer loop
    this.timerInterval = setInterval(() => {
      this.durationSec = Math.floor((Date.now() - this.startTime) / 1000);
      const str = this.formatTime(this.durationSec);
      this.onDurationUpdateCallbacks.forEach((cb) => cb(this.durationSec, str));
    }, 1000);
  }

  /**
   * Stop Lecture Recording and Generate Final Lecture Package
   */
  public async stopRecording(): Promise<LectureResult> {
    if (!this.isRecordingActive) {
      throw new Error('No active recording to stop');
    }

    return new Promise((resolve) => {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          this.finalizeLecturePackage(resolve);
        };
        this.mediaRecorder.stop();
      } else {
        this.finalizeLecturePackage(resolve);
      }
    });
  }

  private finalizeLecturePackage(resolve: (result: LectureResult) => void) {
    this.isRecordingActive = false;

    // Stop streams
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    if (this.screenVideoEl) {
      this.screenVideoEl.srcObject = null;
      this.screenVideoEl = null;
    }
    if (this.webcamVideoEl) {
      this.webcamVideoEl.srcObject = null;
      this.webcamVideoEl = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    const blobType = this.mediaRecorder?.mimeType || 'video/webm';
    const blob = new Blob(this.recordedChunks, { type: blobType });
    const videoUrl = URL.createObjectURL(blob);

    const config = this.currentConfig || {
      instructorName: 'Instructor',
      classCode: 'STUDIO',
      topicTitle: 'Python Lecture',
      mode: 'lecture_composite',
    };

    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const filename = `lecture-${config.classCode}-${dateStr}.webm`;
    const durationStr = this.formatTime(this.durationSec);
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
    const recordedAt = new Date().toLocaleString();

    // Auto-generate comprehensive lecture notes
    const notesMarkdown = this.generateLectureNotes(config, durationStr, recordedAt);

    // Auto trigger 1-click video download
    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // ignore
    }

    const result: LectureResult = {
      videoBlob: blob,
      videoUrl,
      filename,
      duration: this.durationSec,
      durationStr,
      chapters: [...this.chapters],
      notesMarkdown,
      codeSnapshots: [...this.codeSnapshots],
      topicTitle: config.topicTitle || 'Interactive Python Lecture',
      instructorName: config.instructorName,
      classCode: config.classCode,
      recordedAt,
      sizeMb,
    };

    this.onFinishedCallbacks.forEach((cb) => {
      try {
        cb(result);
      } catch (err) {
        console.error('Error in onFinished callback:', err);
      }
    });

    resolve(result);
  }

  /**
   * Auto-generate Lecture Notes & Summary in clean Markdown format
   */
  private generateLectureNotes(
    config: LectureRecordingConfig,
    durationStr: string,
    recordedAt: string
  ): string {
    const topic = config.topicTitle || 'Interactive Python Code Visualization & Execution';

    let md = `# 🎓 ${topic}\n\n`;
    md += `**Instructor:** ${config.instructorName}  \n`;
    md += `**Class Code:** \`${config.classCode}\`  \n`;
    md += `**Recorded Date:** ${recordedAt}  \n`;
    md += `**Total Duration:** ${durationStr}  \n`;
    md += `**Format:** Screen & Webcam Composite Lecture Video  \n\n`;

    md += `---\n\n`;
    md += `## ⏱️ Video Chapter Index\n\n`;
    if (this.chapters.length > 0) {
      this.chapters.forEach((ch) => {
        md += `- **[${ch.timestampStr}]** ${ch.title}${ch.detail ? ` — *${ch.detail}*` : ''}\n`;
      });
    } else {
      md += `- **[00:00]** Complete Python Lecture Session\n`;
    }
    md += `\n---\n\n`;

    md += `## 💻 Executed Python Code\n\n`;
    if (this.codeSnapshots.length > 0) {
      this.codeSnapshots.forEach((code, idx) => {
        md += `### Snippet ${idx + 1}\n\`\`\`python\n${code}\n\`\`\`\n\n`;
      });
    } else {
      md += `*Interactive code debugger and live memory warehouse utilized throughout the session.*\n\n`;
    }

    md += `---\n\n`;
    md += `## 🧠 Key Python Concepts Covered\n\n`;
    const allCode = this.codeSnapshots.join('\n');
    const concepts: string[] = [];

    if (/\bfor\b|\bwhile\b/.test(allCode)) {
      concepts.push('- **Loops & Iteration:** `for` / `while` statements and range sequencing.');
    }
    if (/\bif\b|\belif\b|\belse\b/.test(allCode)) {
      concepts.push('- **Conditional Logic:** Decision branching with `if` / `elif` / `else`.');
    }
    if (/\bdef\b/.test(allCode)) {
      concepts.push('- **Functions & Scope:** Modular function definitions, parameters, and return values.');
    }
    if (/turtle|forward|left|right|circle/.test(allCode)) {
      concepts.push('- **Turtle Graphics:** Vector coordinate drawing, heading, and canvas animations.');
    }
    if (/\[|\bdict\b|\blist\b/.test(allCode)) {
      concepts.push('- **Data Structures:** Lists, arrays, dictionaries, and memory references.');
    }
    if (concepts.length === 0) {
      concepts.push('- **Variables & Types:** Data representation, dynamic typing, and console output.');
      concepts.push('- **Execution Tracing:** Step-by-step memory tracking and variable trace tables.');
    }

    md += concepts.join('\n') + '\n\n';

    md += `---\n\n`;
    md += `*Generated automatically by Python Visualizer Classroom Studio.*`;
    return md;
  }

  /**
   * Continuous Canvas Compositor Loop
   */
  private startRenderLoop() {
    const canvas = this.canvas!;
    const ctx = this.ctx!;
    const screenVideo = this.screenVideoEl;
    const webcamVideo = this.webcamVideoEl;
    const config = this.currentConfig!;

    const render = () => {
      if (!this.isRecordingActive) return;

      const cw = canvas.width;
      const ch = canvas.height;

      // 1. Dark Backdrop
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, cw, ch);

      // 2. Render Screen Stream
      if (screenVideo && screenVideo.readyState >= 2) {
        const vw = screenVideo.videoWidth || cw;
        const vh = screenVideo.videoHeight || ch;

        // Scale to fit while maintaining aspect ratio
        const scale = Math.min(cw / vw, ch / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.drawImage(screenVideo, dx, dy, dw, dh);
      } else if (config.mode === 'camera_only' && webcamVideo && webcamVideo.readyState >= 2) {
        // Camera only mode: draw camera full canvas
        ctx.drawImage(webcamVideo, 0, 0, cw, ch);
      }

      // 3. Render Intro Banner (First 3.5 seconds)
      const elapsed = (Date.now() - this.startTime) / 1000;
      if (elapsed < 3.5) {
        const opacity = elapsed > 2.8 ? (3.5 - elapsed) / 0.7 : 1;
        ctx.save();
        ctx.globalAlpha = opacity;

        // Gradient title bar across top
        const grad = ctx.createLinearGradient(0, 0, cw, 0);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
        grad.addColorStop(0.5, 'rgba(14, 116, 144, 0.90)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, 110);

        // Accent bottom line
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 108, cw, 3);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(config.topicTitle || 'Python Visualizer Lecture Session', 48, 52);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px sans-serif';
        ctx.fillText(
          `Instructor: ${config.instructorName}  ·  Class: ${config.classCode}  ·  Interactive Execution & Trace Table`,
          48,
          88
        );

        ctx.restore();
      }

      // 4. Render Webcam Picture-in-Picture (PiP) Window
      if (
        config.mode === 'lecture_composite' &&
        webcamVideo &&
        webcamVideo.readyState >= 2
      ) {
        const pipW = 380;
        const pipH = 240;
        const margin = 28;

        let pipX = cw - pipW - margin;
        let pipY = ch - pipH - margin;

        if (config.pipPosition === 'top-right') {
          pipX = cw - pipW - margin;
          pipY = margin + (elapsed < 3.5 ? 120 : 0);
        } else if (config.pipPosition === 'bottom-left') {
          pipX = margin;
          pipY = ch - pipH - margin;
        } else if (config.pipPosition === 'top-left') {
          pipX = margin;
          pipY = margin + (elapsed < 3.5 ? 120 : 0);
        }

        ctx.save();

        // Shadow for PiP window
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;

        // Rounded box clipping
        ctx.beginPath();
        ctx.roundRect(pipX, pipY, pipW, pipH, 16);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.save();
        ctx.clip();

        // Draw webcam feed inside rounded box
        const wvw = webcamVideo.videoWidth || pipW;
        const wvh = webcamVideo.videoHeight || pipH;
        // Center-crop video into PiP aspect
        const targetAspect = pipW / pipH;
        const videoAspect = wvw / wvh;

        let sx = 0,
          sy = 0,
          sw = wvw,
          sh = wvh;

        if (videoAspect > targetAspect) {
          sw = wvh * targetAspect;
          sx = (wvw - sw) / 2;
        } else {
          sh = wvw / targetAspect;
          sy = (wvh - sh) / 2;
        }

        ctx.drawImage(webcamVideo, sx, sy, sw, sh, pipX, pipY, pipW, pipH);
        ctx.restore();

        // PiP Border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(pipX, pipY, pipW, pipH, 16);
        ctx.stroke();

        // Name Tag Badge at bottom of PiP
        const badgeH = 28;
        const badgeY = pipY + pipH - badgeH - 8;
        const badgeX = pipX + 10;
        const badgeText = `🎙️ ${config.instructorName}`;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, 190, badgeH, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(badgeText, badgeX + 10, badgeY + 19);

        ctx.restore();
      }

      // 5. Watermark & Live Rec Indicator (Top-Right)
      ctx.save();
      const recX = cw - 280;
      const recY = 24;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(recX, recY, 256, 36, 18);
      ctx.fill();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pulsing red dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(recX + 18, recY + 18, 6, 0, Math.PI * 2);
      ctx.fill();

      // Text: REC MM:SS · Python Studio
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`REC ${this.formatTime(this.durationSec)} · LECTURE`, recX + 32, recY + 23);

      ctx.restore();

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(m)}:${pad(s)}`;
  }
}

export const lectureRecorder = new LectureRecorderService();
