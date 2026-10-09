import React, { useState } from 'react';
import {
  GraduationCap,
  Crown,
  Play,
  ArrowRight,
  Code2,
  Video,
  Layers,
  Sparkles,
  Monitor,
  Film,
  Eye,
  CheckCircle2,
  Compass,
  Cpu,
  Share2,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Zap,
  Users,
  Shield,
  Clock,
  BookOpen,
} from 'lucide-react';

interface LandingPageProps {
  onOpenLogin: (initialRole?: 'student' | 'teacher') => void;
  onLaunchSandbox: () => void;
  activeTeacherClass?: { classCode: string; teacherName: string } | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onLaunchSandbox,
  activeTeacherClass,
}) => {
  // Interactive Hero Preview State (Simulate code stepping on the landing page)
  const [heroStep, setHeroStep] = useState<number>(1);
  const heroCodeLines = [
    { num: 1, text: 'def calculate_area(radius):', highlight: heroStep === 1 },
    { num: 2, text: '    pi = 3.14159', highlight: heroStep === 2 },
    { num: 3, text: '    area = pi * (radius ** 2)', highlight: heroStep === 3 },
    { num: 4, text: '    return area', highlight: heroStep === 4 },
    { num: 5, text: '', highlight: false },
    { num: 6, text: 'r = 5', highlight: heroStep === 0 },
    { num: 7, text: 'result = calculate_area(r)', highlight: heroStep === 1 || heroStep === 5 },
    { num: 8, text: 'print("Circle Area:", result)', highlight: heroStep === 6 },
  ];

  const heroMemoryVars = [
    { name: 'r', val: '5', type: 'int', active: heroStep >= 0 },
    { name: 'pi', val: '3.14159', type: 'float', active: heroStep >= 2 },
    { name: 'area', val: '78.539', type: 'float', active: heroStep >= 3 },
    { name: 'result', val: heroStep >= 5 ? '78.539' : 'None', type: 'float', active: heroStep >= 5 },
  ];

  const handleHeroNextStep = () => {
    setHeroStep((prev) => (prev >= 6 ? 0 : prev + 1));
  };

  const [activeCurriculumIndex, setActiveCurriculumIndex] = useState<number>(0);
  const curriculumExamples = [
    {
      title: 'Variables & Memory Capsules',
      desc: 'Understand binding, mutation, and pointer references in computer memory.',
      code: 'x = 10\ny = x + 5\nx = x * 2\nprint("x:", x, "y:", y)',
      tags: ['Memory Stack', 'Integer Scopes'],
    },
    {
      title: 'Conditionals & Branch Decisions',
      desc: 'Visualize dynamic boolean evaluation and control flow branches.',
      code: 'score = 88\nif score >= 90:\n    grade = "A+"\nelif score >= 80:\n    grade = "A"\nelse:\n    grade = "B"',
      tags: ['Branch Flow', 'Boolean Gates'],
    },
    {
      title: 'While & For Loop State Cycles',
      desc: 'Watch iterator step counters and state changes evolve cycle by cycle.',
      code: 'total = 0\nfor i in range(1, 5):\n    total += i * 2\n    print(f"i={i}, total={total}")',
      tags: ['Loop Invariants', 'Accumulator'],
    },
    {
      title: 'Functions & Activation Frames',
      desc: 'See function portals open sub-chamber frames and return values cleanly.',
      code: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\nres = factorial(4)',
      tags: ['Call Stack', 'Frame Return'],
    },
    {
      title: 'Creative Turtle Geometry',
      desc: 'Draw visual geometric algorithms and coordinate paths in real-time.',
      code: 'import turtle\nt = turtle.Turtle()\nfor i in range(5):\n    t.forward(100)\n    t.right(144)',
      tags: ['Turtle Canvas', 'Geometry'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Notification Bar if a live teacher class is detected */}
      {activeTeacherClass && (
        <div className="bg-gradient-to-r from-amber-950/80 via-cyan-950/80 to-slate-900 border-b border-cyan-500/30 px-4 py-2 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">
              Live Classroom Active: <strong>{activeTeacherClass.teacherName}</strong> is hosting room{' '}
              <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {activeTeacherClass.classCode}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenLogin('student')}
            className="flex items-center gap-1 text-cyan-300 hover:text-white font-semibold transition-colors underline text-xs"
          >
            <span>Connect to Class</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-[#070d19]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-cyan-950/50">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm tracking-tight">Python Visualizer</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded">
                  Studio v3
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">Execution Engine & Virtual Classroom</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#curriculum" className="hover:text-cyan-400 transition-colors">
              Curriculum
            </a>
            <a href="#lecture-studio" className="hover:text-cyan-400 transition-colors">
              Lecture Studio
            </a>
            <a href="#shortcuts" className="hover:text-cyan-400 transition-colors">
              Shortcuts
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onLaunchSandbox}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-all flex items-center gap-1.5"
              title="Launch Python code visualizer instantly without room code"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Try Sandbox</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLogin('student')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 transition-all hidden sm:flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Join Class</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLogin('teacher')}
              className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 shadow-md shadow-cyan-950/60 transition-all flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Host Classroom</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Generation Python Learning Environment</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-semibold">Zero-Setup Web Native</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.12]">
              See Every Memory Frame. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                Teach & Code in Real-Time.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              An interactive step-by-step visual execution engine with real-time student/teacher synchronization,
              creative Turtle geometric graphics, and Picture-in-Picture automatic lecture video recording.
            </p>

            {/* CTA Action Cluster */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => onOpenLogin('teacher')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 via-sky-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 shadow-xl shadow-cyan-950/60 transition-all flex items-center justify-center gap-2 group"
              >
                <Crown className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>Host Live Classroom</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onOpenLogin('student')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Join with Class Code</span>
              </button>

              <button
                type="button"
                onClick={onLaunchSandbox}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Explore Sandbox (No Login)</span>
              </button>
            </div>

            {/* Feature metadata tags */}
            <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Web Audio & Screen Composite
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-Student Live Stage
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Download Lecture Video
              </span>
            </div>
          </div>

          {/* Interactive Live Hero Simulation Card */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-[#090f1d] border border-slate-800 shadow-2xl shadow-cyan-950/40 overflow-hidden">
            {/* Window header */}
            <div className="px-4 py-3 bg-[#0d1629] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2">main.py — Live Execution Tracer</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">Step {heroStep + 1}/7</span>
                <button
                  type="button"
                  onClick={handleHeroNextStep}
                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Step Line</span>
                </button>
              </div>
            </div>

            {/* Interactive Simulator Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {/* Code Editor Preview */}
              <div className="md:col-span-7 p-4 bg-[#070c17] font-mono text-xs sm:text-sm">
                <div className="space-y-1">
                  {heroCodeLines.map((line) => (
                    <div
                      key={line.num}
                      className={`flex items-center gap-3 px-2 py-0.5 rounded transition-colors ${
                        line.highlight ? 'bg-cyan-500/20 text-cyan-200 border-l-2 border-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600 text-[11px] w-4 select-none">{line.num}</span>
                      <span className={line.highlight ? 'font-bold text-slate-100' : ''}>
                        {line.text || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Memory Vessel Stack & Console */}
              <div className="md:col-span-5 p-4 bg-[#0a1120] flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Memory Scope (G.vars)</span>
                    <span className="text-cyan-400 font-mono text-[10px]">Real-Time Heap</span>
                  </div>

                  <div className="space-y-1.5">
                    {heroMemoryVars.map((v) => (
                      <div
                        key={v.name}
                        className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
                          v.active
                            ? 'bg-slate-900 border-cyan-500/30 text-slate-200'
                            : 'bg-slate-950/40 border-slate-800 text-slate-600'
                        }`}
                      >
                        <span className="font-bold text-sky-400">{v.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{v.type}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-bold">
                            {v.val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Output Terminal */}
                <div className="p-2.5 bg-black/60 rounded-lg border border-slate-800 text-xs font-mono">
                  <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                    <Terminal className="w-3 h-3" /> Console Output
                  </div>
                  <div className="text-emerald-400">
                    {heroStep >= 6 ? '> Circle Area: 78.539' : '> python main.py [executing...]'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section id="features" className="py-16 md:py-24 bg-[#080e1b] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Engineered for Deep Conceptual Understanding
            </h2>
            <p className="text-sm text-slate-400">
              Transform abstract syntax errors and hidden memory references into crystal-clear visual mental models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#0b1328] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Step-by-Step Memory Frames</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step line-by-line forward and backwards. Watch global scopes, activation frames, and heap variables
                materialize with full execution trace tables.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#0b1328] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Synchronized Virtual Classroom</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instructors broadcast live code changes, stepping points, and resets to all students across the network
                with sub-second latency and multi-peer audio/video.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#0b1328] border border-cyan-500/30 bg-gradient-to-b from-[#0b1328] to-[#07162c] transition-all space-y-3 shadow-lg ring-1 ring-cyan-500/20">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-100">Screen + WebCam Lecture Studio</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">New</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simultaneously record visualizer screen and teacher webcam in Picture-in-Picture with mixed audio,
                auto-tracked chapter timelines, and instant Markdown notes download.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#0b1328] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Creative Turtle Canvas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time geometric turtle graphics engine. Draw polygons, star spirals, and recursive fractals with
                immediate interactive visual feedback.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#0b1328] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Student Stage & Presentation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Any student can take the stage with 1 click to code and visualize for the entire class, turning passive
                spectators into active presenters.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#0b1328] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Distraction-Free Immersion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hide the entire navbar with 1 click or keyboard shortcut <code>H</code> for maximum screen space,
                retaining a floating status pill with recording and mic controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Showcase Section */}
      <section id="curriculum" className="py-16 md:py-24 bg-[#070d19] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Pre-Loaded Computer Science Curriculum
            </h2>
            <p className="text-sm text-slate-400">
              Interactive examples ready to run, explore, and visualize from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Curriculum Topics List */}
            <div className="lg:col-span-5 space-y-2">
              {curriculumExamples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveCurriculumIndex(idx)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex items-start justify-between ${
                    activeCurriculumIndex === idx
                      ? 'bg-cyan-950/40 border-cyan-500/40 shadow-md shadow-cyan-950/50'
                      : 'bg-[#090f1d] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200">{ex.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{ex.desc}</p>
                    <div className="flex items-center gap-2 pt-1">
                      {ex.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-cyan-400 font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${
                      activeCurriculumIndex === idx ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Selected Topic Code Snapshot */}
            <div className="lg:col-span-7 bg-[#090f1d] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs text-slate-200">
                    {curriculumExamples[activeCurriculumIndex].title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLaunchSandbox}
                  className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run in Studio</span>
                </button>
              </div>

              <div className="p-4 bg-[#050912] rounded-xl font-mono text-xs text-slate-200 border border-slate-900 overflow-x-auto min-h-[160px]">
                <pre>{curriculumExamples[activeCurriculumIndex].code}</pre>
              </div>

              <p className="text-xs text-slate-400">
                {curriculumExamples[activeCurriculumIndex].desc} Open it inside the visualizer to inspect how variables,
                loops, and functions execute step-by-step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lecture Studio Spotlight */}
      <section id="lecture-studio" className="py-16 md:py-24 bg-[#090f1e] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-cyan-950/60 via-[#0a162e] to-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl space-y-5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
                <Film className="w-3.5 h-3.5" />
                <span>Automatic Lecture Video Studio</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                Record Screen & WebCam Simultaneously.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Create complete, polished lecture recordings with no external editing software. Our compositor merges
                your visualizer screen with a stylish Picture-in-Picture webcam overlay, mixes audio seamlessly, and
                tracks actions into clickable timeline chapters with Markdown summary notes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>1080p HD Canvas Compositing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Dual Web Audio Mixing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Auto Chapter Timeline Markers</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>1-Click Video & Notes Download</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenLogin('teacher')}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 transition-all shadow-md flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Start Teaching & Recording</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts Strip */}
      <section id="shortcuts" className="py-12 bg-[#070c17] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Power User Productivity:</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">H</kbd>{' '}
                Hide/Show Navbar
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">Run</kbd>{' '}
                Execute script
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">Step</kbd>{' '}
                Execute line-by-line
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">REC</kbd>{' '}
                Record Screen + Cam
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-[#050912] border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Python Visualizer Live Studio</span>
            <span>·</span>
            <span>Interactive Computer Science Education</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLaunchSandbox}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Open Visualizer
            </button>
            <button
              type="button"
              onClick={() => onOpenLogin('teacher')}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Host Room
            </button>
            <button
              type="button"
              onClick={() => onOpenLogin('student')}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Join Room
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
