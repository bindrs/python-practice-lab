import { useEffect, useState } from 'react';
import { SubTopic, CurriculumModule } from '../data/curriculumData';

interface TopicIntroAnimationProps {
  topic: SubTopic;
  module: CurriculumModule;
  theme?: 'light' | 'dark';
  onContinue: () => void;
  onOpenInStudio?: (code: string) => void;
}

export default function TopicIntroAnimation({
  topic,
  module,
  theme = 'dark',
  onContinue,
  onOpenInStudio,
}: TopicIntroAnimationProps) {
  const [stage, setStage] = useState<number>(0);
  const [pulse, setPulse] = useState(true);
  const isLight = theme === 'light';

  useEffect(() => {
    setStage(0);
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 600);
    const t3 = setTimeout(() => setStage(3), 1200);

    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [topic.id]);

  return (
    <div
      className={`relative min-h-[500px] w-full rounded-2xl p-6 sm:p-10 overflow-hidden border shadow-2xl flex flex-col justify-between transition-colors duration-300 ${
        isLight
          ? 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 border-slate-200'
          : 'bg-gradient-to-br from-[#0c1527] via-[#09101d] to-[#050811] text-white border-slate-800'
      }`}
    >
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/30 blur-3xl transition-transform duration-1000 ${
            pulse ? 'scale-110' : 'scale-90'
          }`}
        />
        <div
          className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl transition-transform duration-1000 ${
            pulse ? 'scale-95' : 'scale-115'
          }`}
        />
        <div
          className={`absolute inset-0 [background-size:16px_16px] opacity-40 ${
            isLight
              ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)]'
              : 'bg-[radial-gradient(#1e293b_1px,transparent_1px)]'
          }`}
        />
      </div>

      {/* Top Header Badge */}
      <div
        className={`relative z-10 flex flex-wrap items-center justify-between gap-3 transition-all duration-700 ${
          stage >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
              isLight
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            Module {module.moduleNumber}: {module.title}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isLight
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}
          >
            Topic {topic.topicNumber}
          </span>
        </div>
        <div
          className={`text-xs font-mono flex items-center gap-2 ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <span>Est. {topic.durationMinutes} mins</span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>/</span>
          <span>Interactive Guide</span>
        </div>
      </div>

      {/* Center Cinematic Intro Block */}
      <div className="relative z-10 my-6 sm:my-8 max-w-4xl">
        {/* Animated Numeric Badge */}
        <div
          className={`mb-6 flex items-center gap-4 transition-all duration-700 ${
            stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-mono shadow-lg relative ${
              isLight
                ? 'bg-white border-slate-200 shadow-slate-200/60'
                : 'bg-slate-800/90 border-slate-700/80 shadow-emerald-950/40'
            }`}
          >
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              SECTION
            </span>
            <span
              className={`text-xl font-extrabold ${
                isLight ? 'text-emerald-600' : 'text-emerald-400'
              }`}
            >
              {topic.topicNumber}
            </span>
          </div>
          <div>
            <p
              className={`text-xs font-semibold tracking-wide uppercase ${
                isLight ? 'text-amber-700 font-bold' : 'text-amber-400'
              }`}
            >
              {topic.category}
            </p>
            <h1
              className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
                isLight ? 'text-slate-900' : 'text-slate-100'
              }`}
            >
              {topic.topicNumber} {topic.title}
            </h1>
            <p
              className={`text-sm sm:text-base font-medium mt-1 ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {topic.intro.headline}
            </p>
          </div>
        </div>

        {/* Narrative & Real World Analogy Box */}
        <div
          className={`space-y-4 transition-all duration-700 delay-150 ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p
            className={`text-base sm:text-lg leading-relaxed font-normal ${
              isLight ? 'text-slate-800' : 'text-slate-200'
            }`}
          >
            {topic.intro.summary}
          </p>

          <div
            className={`p-4 rounded-xl border shadow-inner ${
              isLight
                ? 'bg-amber-50/70 border-amber-200/70'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                isLight ? 'text-amber-800' : 'text-amber-400'
              }`}
            >
              Mental Metaphor:
            </span>
            <p
              className={`text-sm italic ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              "{topic.intro.analogy}"
            </p>
          </div>
        </div>

        {/* Key Objectives / Takeaways */}
        <div
          className={`mt-6 transition-all duration-700 delay-300 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span
            className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
              isLight ? 'text-emerald-700' : 'text-emerald-400'
            }`}
          >
            Key Objectives to Master:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {topic.intro.keyTakeaways.map((takeaway, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border flex items-start gap-2.5 transition-colors ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-emerald-500'
                    : 'bg-slate-800/40 border-slate-700/50 hover:border-emerald-500/40'
                }`}
              >
                <span
                  className={`text-xs font-mono font-bold shrink-0 ${
                    isLight ? 'text-emerald-600' : 'text-emerald-400'
                  }`}
                >
                  {i + 1}.
                </span>
                <span
                  className={`text-xs leading-snug ${
                    isLight ? 'text-slate-700 font-medium' : 'text-slate-300'
                  }`}
                >
                  {takeaway}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div
        className={`relative z-10 pt-4 border-t flex flex-wrap items-center justify-between gap-4 ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}
      >
        <div
          className={`text-xs font-mono ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <span>Curriculum Standard KP BT&CE DIT</span>
        </div>

        <div className="flex items-center gap-3">
          {onOpenInStudio && (
            <button
              onClick={() => onOpenInStudio(topic.guide.codeExample)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Directly launch the topic example into the visualizer editor"
            >
              Load in Studio
            </button>
          )}

          <button
            onClick={onContinue}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition ${
              isLight
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-950/60'
            }`}
          >
            Enter Lesson Guide
          </button>
        </div>
      </div>
    </div>
  );
}
