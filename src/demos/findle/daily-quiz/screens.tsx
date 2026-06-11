import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronRight, Newspaper, Sparkles, Trophy } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { FINDLE_APP_BG, FINDLE_GREEN, Fin, FindleBottomNav, FindleTopBar } from '../_shared/ui';
import { INITIAL, NEWS, STR } from './data';
import { useDailyQuiz } from './state';

/** 학생 데일리 퀴즈 앱 — 홈 → 뉴스 → 퀴즈 → 결과 */
export function DailyQuizApp() {
  const s = useDailyQuiz();

  return (
    <div className="flex h-full flex-col pt-8" style={{ background: FINDLE_APP_BG }}>
      {s.screen === 'home' && <Home />}
      {s.screen === 'news' && <News />}
      {s.screen === 'quiz' && <QuizRunner />}
      {s.screen === 'result' && <Result />}
      {(s.screen === 'home' || s.screen === 'result') && <FindleBottomNav active="home" />}
      {s.screen === 'quiz' && <FindleBottomNav active="learn" />}
      {s.screen === 'news' && <FindleBottomNav active="learn" />}
    </div>
  );
}

function Home() {
  const s = useDailyQuiz();
  const lang = useLang();
  return (
    <>
      <FindleTopBar streak={INITIAL.streak} fins={s.fins} />
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-1">
        {/* 인사 + 레벨 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[12px] text-zinc-400">{pick(STR.greeting, lang)}</p>
          <div className="flex items-end justify-between">
            <h2 className="text-[22px] font-extrabold text-zinc-900">Hey, {pick(STR.userName, lang)}</h2>
            <span
              className="flex h-11 w-11 flex-col items-center justify-center rounded-xl text-white"
              style={{ background: FINDLE_GREEN }}
            >
              <span className="text-[16px] font-extrabold leading-none">{INITIAL.level}</span>
              <span className="text-[7px] font-medium opacity-80">Level</span>
            </span>
          </div>
          <p className="mt-1 text-[11.5px] font-medium text-zinc-500">
            {fmt(pick(STR.toLevel, lang), { n: INITIAL.level + 1, xp: INITIAL.xp })}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full" style={{ width: `${INITIAL.xpInLevel * 100}%`, background: FINDLE_GREEN }} />
          </div>
        </div>

        {/* 스탯 */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { v: `${INITIAL.streak}`, l: pick(STR.dayStreak, lang), c: 'text-orange-500' },
            { v: s.fins.toLocaleString('en-US'), l: pick(STR.finsLabel, lang), c: 'text-emerald-600' },
            { v: `#${INITIAL.rankInClass}`, l: pick(STR.inClass, lang), c: 'text-zinc-900' },
          ].map((x, i) => (
            <div key={i} className="rounded-2xl bg-white p-3 text-center shadow-sm">
              <p className={cn('text-[18px] font-extrabold tabular-nums', x.c)}>{x.v}</p>
              <p className="text-[10px] text-zinc-400">{x.l}</p>
            </div>
          ))}
        </div>

        {/* 오늘의 뉴스 퀴즈 CTA */}
        <button
          data-demo-id="todays-quiz"
          onClick={() => s.openNews()}
          className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-emerald-100"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Newspaper className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10.5px] font-bold uppercase tracking-wide text-emerald-600">
              {pick(STR.todaysQuizTag, lang)}
            </span>
            <span className="mt-0.5 block truncate text-[13.5px] font-bold text-zinc-900">{pick(NEWS.headline, lang)}</span>
            <span className="block text-[11px] text-zinc-400">{pick(NEWS.topic, lang)}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
        </button>
      </div>
    </>
  );
}

function News() {
  const s = useDailyQuiz();
  const lang = useLang();
  return (
    <>
      <header className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-3.5">
        <button onClick={() => useDailyQuiz.setState({ screen: 'home' })} className="text-zinc-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-bold text-zinc-900">{pick(STR.appTitle, lang)}</span>
      </header>
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
            <Newspaper className="h-3.5 w-3.5" /> {pick(NEWS.source, lang)} · {pick(NEWS.time, lang)}
          </div>
          <h2 className="mt-2 text-[18px] font-extrabold leading-snug text-zinc-900">{pick(NEWS.headline, lang)}</h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-500">{pick(NEWS.summary, lang)}</p>
          <span className="mt-3 inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500">
            {pick(NEWS.topic, lang)}
          </span>
        </div>
        <p className="mt-4 text-center text-[11.5px] font-medium" style={{ color: FINDLE_GREEN }}>
          ✨ {pick(STR.newsToLesson, lang)}
        </p>
      </div>
      <div className="shrink-0 p-4">
        <button
          data-demo-id="start-quiz"
          onClick={() => s.startQuiz()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white"
          style={{ background: FINDLE_GREEN }}
        >
          <Sparkles className="h-4 w-4" /> {pick(STR.startQuiz, lang)}
        </button>
      </div>
    </>
  );
}

function QuizRunner() {
  const s = useDailyQuiz();
  const lang = useLang();
  const quiz = s.questions[s.currentQuiz];

  const optClass = (j: number): string => {
    if (!s.submitted) {
      return j === s.selectedOption ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-zinc-50 text-zinc-700';
    }
    if (j === quiz.correctIndex) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    if (j === s.selectedOption) return 'border-rose-400 bg-rose-50 text-rose-600';
    return 'border-zinc-200 bg-zinc-50 text-zinc-400';
  };

  return (
    <>
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3.5">
        <span className="text-[15px] font-bold text-zinc-900">{pick(STR.quizHeader, lang)}</span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500">
          <Fin className="h-3.5 w-3.5" />
          <motion.span key={s.fins} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="tabular-nums">
            {s.fins.toLocaleString('en-US')}
          </motion.span>
        </span>
      </header>
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence>
          {s.followUpAdded && quiz.id === 'fu' && (
            <motion.div
              data-demo-id="followup-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11.5px] font-medium text-emerald-700 ring-1 ring-emerald-200"
            >
              <Sparkles className="h-3.5 w-3.5" /> {pick(STR.followUpAdded, lang)}
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-[13px] font-bold" style={{ color: FINDLE_GREEN }}>
          {fmt(pick(STR.questionLabel, lang), { n: s.currentQuiz + 1 })}
        </span>
        <motion.p key={quiz.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="mb-4 mt-1.5 text-[18px] font-bold leading-snug text-zinc-900">
          {pick(quiz.question, lang)}
        </motion.p>
        <div className="flex flex-col gap-2.5">
          {pick(quiz.options, lang).map((opt, j) => (
            <button
              key={j}
              data-demo-id={`quiz-opt-${j}`}
              onClick={() => s.selectOption(j)}
              disabled={s.submitted}
              className={cn('w-full rounded-2xl border-2 px-4 py-3 text-left text-[14px] font-medium transition-colors', optClass(j))}
            >
              {j + 1}. {opt}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {s.submitted && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-zinc-100 p-3.5">
              <p className="text-[13px] font-bold text-zinc-700">{pick(STR.explanationLabel, lang)}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">{pick(quiz.explanation, lang)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="shrink-0 p-4">
        {!s.submitted ? (
          <button
            data-demo-id="submit-answer"
            onClick={() => s.submitAnswer()}
            disabled={s.selectedOption === null}
            className={cn('h-12 w-full rounded-xl text-[15px] font-bold text-white transition-colors', s.selectedOption === null ? 'bg-emerald-300' : '')}
            style={s.selectedOption === null ? undefined : { background: FINDLE_GREEN }}
          >
            {pick(STR.submit, lang)}
          </button>
        ) : (
          <button
            data-demo-id="next-quiz"
            onClick={() => s.nextQuiz()}
            className="h-12 w-full rounded-xl text-[15px] font-bold text-white"
            style={{ background: FINDLE_GREEN }}
          >
            {pick(STR.next, lang)}
          </button>
        )}
      </div>
    </>
  );
}

function Result() {
  const s = useDailyQuiz();
  const lang = useLang();
  const total = s.questions.length;
  const correct = Object.values(s.answers).filter((a) => a.correct).length;
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-3xl bg-white px-6 py-7 text-center shadow-lg">
        <Trophy className="mx-auto h-12 w-12 text-amber-400" />
        <h1 className="mt-2 text-[22px] font-extrabold text-zinc-900">{pick(STR.resultTitle, lang)}</h1>
        <div className="mt-4 flex justify-center gap-2">
          <span className="rounded-2xl bg-emerald-50 px-4 py-2 text-[16px] font-extrabold text-emerald-600">
            {fmt(pick(STR.earnedXp, lang), { n: s.earnedXp })}
          </span>
          <span className="flex items-center gap-1.5 rounded-2xl bg-amber-50 px-4 py-2 text-[16px] font-extrabold text-amber-600">
            <Fin className="h-4 w-4" /> {fmt(pick(STR.earnedFins, lang), { n: s.earnedFins })}
          </span>
        </div>
        <p className="mt-4 text-[14px] font-semibold text-zinc-500">{fmt(pick(STR.scoreLine, lang), { c: correct, t: total })}</p>
        <p className="mt-1 text-[12px] text-zinc-400">{fmt(pick(STR.levelUpNote, lang), { n: INITIAL.level })}</p>
        <button
          data-demo-id="result-cta"
          onClick={() => useDailyQuiz.setState({ screen: 'home' })}
          className="mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl text-[14px] font-bold text-white"
          style={{ background: FINDLE_GREEN }}
        >
          {pick(STR.backHome, lang)} <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
