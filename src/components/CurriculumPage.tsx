import { useState, useMemo } from 'react';
import {
  CURRICULUM_MODULES,
  CurriculumModule,
  SubTopic,
} from '../data/curriculumData';
import TopicIntroAnimation from './TopicIntroAnimation';

interface CurriculumPageProps {
  onLoadCodeIntoStudio: (code: string) => void;
  onCloseToStudio?: () => void;
  theme?: 'light' | 'dark';
}

export default function CurriculumPage({
  onLoadCodeIntoStudio,
  onCloseToStudio,
  theme = 'dark',
}: CurriculumPageProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('m1');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('1.1');
  const [showIntroAnimation, setShowIntroAnimation] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [quizSelection, setQuizSelection] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [showCodeSolution, setShowCodeSolution] = useState<boolean>(false);

  const isLight = theme === 'light';

  // Active module & topic
  const activeModule = useMemo(() => {
    return (
      CURRICULUM_MODULES.find((m) => m.id === selectedModuleId) ||
      CURRICULUM_MODULES[0]
    );
  }, [selectedModuleId]);

  const activeTopic = useMemo(() => {
    for (const m of CURRICULUM_MODULES) {
      const found = m.topics.find((t) => t.id === selectedTopicId);
      if (found) return found;
    }
    return activeModule.topics[0];
  }, [selectedTopicId, activeModule]);

  // Overall progress calculation
  const totalTopicsCount = useMemo(() => {
    return CURRICULUM_MODULES.reduce((acc, m) => acc + m.topics.length, 0);
  }, []);

  const completedCount = useMemo(() => {
    return Object.values(completedTopics).filter(Boolean).length;
  }, [completedTopics]);

  const progressPercentage = Math.round((completedCount / totalTopicsCount) * 100);

  // Filter topics for search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return CURRICULUM_MODULES;
    const q = searchQuery.toLowerCase();
    return CURRICULUM_MODULES.map((m) => ({
      ...m,
      topics: m.topics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.topicNumber.includes(q) ||
          t.guide.overview.toLowerCase().includes(q)
      ),
    })).filter((m) => m.topics.length > 0);
  }, [searchQuery]);

  // Handle topic change
  const selectTopic = (modId: string, topId: string, showIntro = true) => {
    setSelectedModuleId(modId);
    setSelectedTopicId(topId);
    setShowIntroAnimation(showIntro);
    setQuizSelection(null);
    setQuizSubmitted(false);
    setShowCodeSolution(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Next topic navigation
  const goToNextTopic = () => {
    const allTopicsWithModule: Array<{ mod: CurriculumModule; top: SubTopic }> = [];
    CURRICULUM_MODULES.forEach((m) => {
      m.topics.forEach((t) => {
        allTopicsWithModule.push({ mod: m, top: t });
      });
    });

    const currentIndex = allTopicsWithModule.findIndex(
      (item) => item.top.id === activeTopic.id
    );

    if (currentIndex >= 0 && currentIndex < allTopicsWithModule.length - 1) {
      const next = allTopicsWithModule[currentIndex + 1];
      selectTopic(next.mod.id, next.top.id, true);
    }
  };

  // Previous topic navigation
  const goToPrevTopic = () => {
    const allTopicsWithModule: Array<{ mod: CurriculumModule; top: SubTopic }> = [];
    CURRICULUM_MODULES.forEach((m) => {
      m.topics.forEach((t) => {
        allTopicsWithModule.push({ mod: m, top: t });
      });
    });

    const currentIndex = allTopicsWithModule.findIndex(
      (item) => item.top.id === activeTopic.id
    );

    if (currentIndex > 0) {
      const prev = allTopicsWithModule[currentIndex - 1];
      selectTopic(prev.mod.id, prev.top.id, false);
    }
  };

  const toggleCompleted = (topicId: string) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className={`flex flex-col lg:flex-row h-full min-h-0 font-sans transition-colors duration-200 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090e17] text-slate-100'
      }`}
    >
      {/* Sidebar: Modules & Topics Navigator */}
      <aside
        className={`w-full lg:w-80 xl:w-96 shrink-0 border-r flex flex-col h-auto lg:h-full min-h-0 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-slate-800'
        }`}
      >
        {/* Sidebar Header & Overall Progress */}
        <div
          className={`p-4 border-b ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131c2e] border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2
                className={`font-extrabold text-sm tracking-tight uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Python Curriculum
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                9 Modules · Complete Interactive Guide
              </p>
            </div>
            {onCloseToStudio && (
              <button
                onClick={onCloseToStudio}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Studio
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div
              className={`flex justify-between text-xs font-semibold ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              <span>Overall Progress</span>
              <span className={`font-mono ${isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400'}`}>
                {progressPercentage}% ({completedCount}/{totalTopicsCount})
              </span>
            </div>
            <div
              className={`w-full h-2 rounded-full overflow-hidden ${
                isLight ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search topics (e.g. strings, loops)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-emerald-500 ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
              }`}
            />
          </div>
        </div>

        {/* Modules Accordion / List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {filteredModules.map((m) => {
            const isModuleActive = m.id === selectedModuleId;
            const completedInModule = m.topics.filter(
              (t) => completedTopics[t.id]
            ).length;

            return (
              <div
                key={m.id}
                className={`rounded-xl border overflow-hidden ${
                  isLight
                    ? 'border-slate-200 bg-slate-50/70'
                    : 'border-slate-800/80 bg-slate-900/60'
                }`}
              >
                {/* Module Bar */}
                <button
                  onClick={() => {
                    setSelectedModuleId(m.id);
                    if (m.topics.length > 0) {
                      selectTopic(m.id, m.topics[0].id, true);
                    }
                  }}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors ${
                    isModuleActive
                      ? isLight
                        ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600'
                        : 'bg-slate-800/80 text-emerald-400 font-bold border-l-4 border-emerald-500'
                      : isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-6 h-6 rounded-md border text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-700'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      {m.moduleNumber}
                    </span>
                    <div className="truncate">
                      <p className="text-xs truncate font-bold leading-tight">
                        {m.title}
                      </p>
                      <span
                        className={`text-[10px] font-normal ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {completedInModule}/{m.topics.length} completed
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {isModuleActive ? '[-]' : '[+]'}
                  </span>
                </button>

                {/* Subtopic Items */}
                {isModuleActive && (
                  <div
                    className={`p-1 space-y-1 border-t ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    {m.topics.map((t) => {
                      const isSelected = t.id === activeTopic.id;
                      const isDone = !!completedTopics[t.id];

                      return (
                        <button
                          key={t.id}
                          onClick={() => selectTopic(m.id, t.id, true)}
                          className={`w-full px-2.5 py-2 rounded-lg text-left flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? isLight
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold'
                              : isLight
                              ? 'hover:bg-slate-100 text-slate-700'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompleted(t.id);
                              }}
                              className={`w-4 h-4 rounded-full border text-[9px] font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                  : isLight
                                  ? 'border-slate-300 hover:border-emerald-500 text-slate-400'
                                  : 'border-slate-600 hover:border-emerald-400 text-slate-400'
                              }`}
                              title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                            >
                              {isDone ? '✓' : ''}
                            </span>
                            <span
                              className={`font-mono text-[11px] ${
                                isLight ? 'text-slate-500' : 'text-slate-400'
                              }`}
                            >
                              {t.topicNumber}
                            </span>
                            <span className="truncate">{t.title}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Pane */}
      <main
        className={`flex-1 overflow-y-auto p-4 sm:p-8 min-h-0 ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090e17] text-slate-100'
        }`}
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Top Navigation Strip */}
          <div
            className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-mono ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span
                className={`font-semibold ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                Module {activeModule.moduleNumber}
              </span>
              <span>/</span>
              <span
                className={`font-semibold ${
                  isLight ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                Topic {activeTopic.topicNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIntroAnimation((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-amber-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                }`}
              >
                <span>{showIntroAnimation ? 'Show Full Guide' : 'Replay Topic Intro'}</span>
              </button>

              <button
                onClick={() => toggleCompleted(activeTopic.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  completedTopics[activeTopic.id]
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : isLight
                    ? 'bg-white text-slate-700 border-slate-300 hover:border-emerald-600'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500'
                }`}
              >
                <span>{completedTopics[activeTopic.id] ? 'Completed' : 'Mark as Done'}</span>
              </button>

              <button
                onClick={() => onLoadCodeIntoStudio(activeTopic.guide.codeExample)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
              >
                <span>Open in Studio</span>
              </button>
            </div>
          </div>

          {/* Animated Intro Card (Curtain View) */}
          {showIntroAnimation ? (
            <div className="animate-in fade-in duration-500">
              <TopicIntroAnimation
                topic={activeTopic}
                module={activeModule}
                theme={theme}
                onContinue={() => setShowIntroAnimation(false)}
                onOpenInStudio={onLoadCodeIntoStudio}
              />
            </div>
          ) : (
            /* In-Depth Lesson Guide View */
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Header Box */}
              <div
                className={`p-6 rounded-2xl border shadow-sm ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-[#0f172a] border-slate-800 text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      isLight
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    Topic {activeTopic.topicNumber}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Category: {activeTopic.category}
                  </span>
                </div>
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {activeTopic.title}
                </h1>
                <p
                  className={`mt-3 text-sm sm:text-base leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {activeTopic.guide.overview}
                </p>
              </div>

              {/* Key Architectural & Concept Breakdown Cards */}
              {activeTopic.guide.keyPoints && activeTopic.guide.keyPoints.length > 0 && (
                <div className="space-y-3">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isLight ? 'text-emerald-800' : 'text-emerald-400'
                    }`}
                  >
                    Key Principles & Mechanisms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTopic.guide.keyPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isLight
                            ? 'bg-white border-slate-200 hover:border-emerald-500 text-slate-800 shadow-sm'
                            : 'bg-[#111c30] border-slate-800 hover:border-emerald-500/40 text-slate-100'
                        }`}
                      >
                        <div>
                          <h4
                            className={`font-bold text-sm mb-1.5 ${
                              isLight ? 'text-slate-900' : 'text-slate-100'
                            }`}
                          >
                            {pt.title}
                          </h4>
                          <p
                            className={`text-xs leading-relaxed ${
                              isLight ? 'text-slate-600' : 'text-slate-300'
                            }`}
                          >
                            {pt.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Code Playground / Example */}
              <div className="rounded-2xl bg-[#0b1120] border border-slate-800 overflow-hidden shadow-2xl">
                <div className="px-4 py-3 bg-[#131c2e] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">
                      topic_{activeTopic.topicNumber.replace('.', '_')}_demo.py
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyCode(activeTopic.guide.codeExample)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      {copiedCode ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => onLoadCodeIntoStudio(activeTopic.guide.codeExample)}
                      className="px-3 py-1 text-xs font-bold rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                    >
                      Run in Visualizer
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm overflow-x-auto text-emerald-300 bg-[#050811] leading-relaxed">
                  <pre>{activeTopic.guide.codeExample}</pre>
                </div>

                {/* Code Explanation & Expected Output Preview */}
                <div className="p-4 bg-[#0d1627] border-t border-slate-800/80 space-y-3">
                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-100">Walkthrough: </strong>
                    {activeTopic.guide.codeExplanation}
                  </p>
                  {activeTopic.guide.outputSample && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Terminal Output Preview:
                      </span>
                      <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-slate-300 leading-normal">
                        {activeTopic.guide.outputSample}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Common Pitfalls / Tips */}
              {activeTopic.guide.commonMistakes && activeTopic.guide.commonMistakes.length > 0 && (
                <div
                  className={`p-4 rounded-xl border ${
                    isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="mb-2">
                    <span
                      className={`text-xs font-bold tracking-wide uppercase ${
                        isLight ? 'text-amber-800' : 'text-amber-400'
                      }`}
                    >
                      Common Beginner Traps:
                    </span>
                  </div>
                  <ul
                    className={`list-disc list-inside text-xs space-y-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {activeTopic.guide.commonMistakes.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Exercise & Knowledge Check */}
              <div
                className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-[#0f172a] border-slate-800 text-white'
                }`}
              >
                <div>
                  <h3
                    className={`text-base font-bold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Knowledge Check: {activeTopic.title}
                  </h3>
                </div>

                <p
                  className={`text-sm font-medium ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {activeTopic.exercise.question}
                </p>

                {/* Multiple choice options */}
                {activeTopic.exercise.options && (
                  <div className="space-y-2">
                    {activeTopic.exercise.options.map((opt, idx) => {
                      const isSelected = quizSelection === idx;
                      const isCorrect = idx === activeTopic.exercise.correctOption;
                      let optionClasses =
                        'p-3 rounded-xl border text-xs sm:text-sm font-medium w-full text-left transition-all flex items-center justify-between ';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionClasses += isLight
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                            : 'bg-emerald-500/20 border-emerald-400 text-emerald-200';
                        } else if (isSelected) {
                          optionClasses += isLight
                            ? 'bg-rose-50 border-rose-400 text-rose-900'
                            : 'bg-rose-500/20 border-rose-400 text-rose-200';
                        } else {
                          optionClasses += isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                            : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60';
                        }
                      } else {
                        if (isSelected) {
                          optionClasses += isLight
                            ? 'bg-slate-100 border-emerald-600 text-slate-900 font-semibold'
                            : 'bg-slate-800 border-emerald-500 text-white';
                        } else {
                          optionClasses += isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                            : 'bg-slate-900 hover:bg-slate-800/80 border-slate-700 text-slate-300';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!quizSubmitted) setQuizSelection(idx);
                          }}
                          className={optionClasses}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <span
                              className={`text-xs font-mono font-bold ${
                                isLight ? 'text-emerald-700' : 'text-emerald-400'
                              }`}
                            >
                              [Correct]
                            </span>
                          )}
                        </button>
                      );
                    })}

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={quizSelection === null || quizSubmitted}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition"
                      >
                        Submit Answer
                      </button>

                      {quizSubmitted && (
                        <button
                          onClick={() => {
                            setQuizSelection(null);
                            setQuizSubmitted(false);
                          }}
                          className={`text-xs ${
                            isLight
                              ? 'text-slate-600 hover:text-slate-900'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Retry Question
                        </button>
                      )}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs mt-2 ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <strong
                          className={isLight ? 'text-emerald-700' : 'text-emerald-400'}
                        >
                          Explanation:{' '}
                        </strong>
                        {activeTopic.exercise.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Practice Code Challenge */}
                {activeTopic.exercise.starterCode && (
                  <div
                    className={`mt-4 pt-4 border-t space-y-3 ${
                      isLight ? 'border-slate-200' : 'border-slate-800/80'
                    }`}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        isLight ? 'text-amber-800' : 'text-amber-400'
                      }`}
                    >
                      Hands-On Coding Challenge:
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          onLoadCodeIntoStudio(activeTopic.exercise.starterCode || '')
                        }
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                      >
                        Solve in Studio Editor
                      </button>
                      <button
                        onClick={() => setShowCodeSolution((s) => !s)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {showCodeSolution ? 'Hide Solution' : 'Reveal Solution'}
                      </button>
                    </div>

                    {showCodeSolution && activeTopic.exercise.solutionCode && (
                      <div className="p-3 rounded-lg bg-black/80 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                        <pre>{activeTopic.exercise.solutionCode}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Next / Previous Navigation Bar */}
              <div
                className={`pt-6 border-t flex items-center justify-between ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <button
                  onClick={goToPrevTopic}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  Previous Topic
                </button>

                <button
                  onClick={goToNextTopic}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-950 transition"
                >
                  Next Topic
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
