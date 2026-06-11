import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, GraduationCap, Link2, Loader2, Save, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { FINDLE_GREEN, FindleMark } from '../_shared/ui';
import { COUNTS, DIFFICULTIES, STR, type Difficulty, type GenQuestion } from './data';
import { useQuizGen } from './state';

const LEVEL_STYLE: Record<Difficulty, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-violet-100 text-violet-700',
  mixed: 'bg-zinc-100 text-zinc-600',
};

export function Header() {
  const lang = useLang();
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-5 py-3">
      <FindleMark className="h-7 w-7 text-[14px]" />
      <div>
        <h2 className="text-[14px] font-extrabold text-zinc-900">{pick(STR.appTitle, lang)}</h2>
        <p className="text-[11px] text-zinc-400">{pick(STR.subtitle, lang)}</p>
      </div>
      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[12px] font-medium text-zinc-600">
        <GraduationCap className="h-3.5 w-3.5" /> {pick(STR.teacher, lang)}
      </span>
    </header>
  );
}

export function Form() {
  const { url, count, difficulty, phase, setUrl, setCount, setDifficulty, generate } = useQuizGen();
  const lang = useLang();
  const busy = phase === 'reading' || phase === 'generating';
  const tips = pick(STR.tips as Record<typeof lang, string[]>, lang);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
          <Link2 className="h-3.5 w-3.5" /> {pick(STR.urlLabel, lang)}
          <span className="text-emerald-600">({pick(STR.required, lang)})</span>
        </label>
        <input
          data-demo-id="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://finance.news/article"
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12.5px] text-zinc-800 outline-none focus:border-emerald-400"
        />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-zinc-500">{pick(STR.countLabel, lang)}</label>
            <select
              data-demo-id="count-select"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[12.5px] text-zinc-800 outline-none"
            >
              {COUNTS.map((c) => (
                <option key={c} value={c}>
                  {fmt(pick(STR.countUnit, lang), { n: c })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-zinc-500">{pick(STR.difficultyLabel, lang)}</label>
            <select
              data-demo-id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-[12.5px] text-zinc-800 outline-none"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.id} value={d.id}>
                  {pick(d.label, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          data-demo-id="generate-btn"
          onClick={() => generate()}
          disabled={busy}
          className={cn('mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white transition-colors', busy && 'opacity-70')}
          style={{ background: FINDLE_GREEN }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {phase === 'done' ? pick(STR.regenerate, lang) : busy ? pick(STR.generating, lang) : pick(STR.generateBtn, lang)}
        </button>
      </div>

      {/* 사용 팁 */}
      <div className="rounded-2xl bg-emerald-50/60 p-4 ring-1 ring-emerald-100">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <Sparkles className="h-3.5 w-3.5" /> {pick(STR.tipsTitle, lang)}
        </p>
        <ul className="mt-1.5 flex flex-col gap-1">
          {tips.map((t, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug text-zinc-500">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function QuestionCard({ q, index }: { q: GenQuestion; index: number }) {
  const lang = useLang();
  const level = DIFFICULTIES.find((d) => d.id === q.level)!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100 text-[11px] font-bold text-zinc-500">
          {index + 1}
        </span>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', LEVEL_STYLE[q.level])}>{pick(level.label, lang)}</span>
      </div>
      <p className="mt-2 text-[13.5px] font-bold leading-snug text-zinc-900">{pick(q.question, lang)}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {pick(q.options, lang).map((opt, j) => {
          const correct = j === q.correctIndex;
          return (
            <div
              key={j}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px]',
                correct ? 'border-emerald-300 bg-emerald-50 font-semibold text-emerald-700' : 'border-zinc-100 bg-zinc-50 text-zinc-600',
              )}
            >
              {correct && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
              {opt}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">{pick(q.explanation, lang)}</p>
    </motion.div>
  );
}

export function ResultPanel() {
  const { phase, questions } = useQuizGen();
  const lang = useLang();
  const status = phase === 'reading' ? pick(STR.statusReading, lang) : phase === 'generating' ? pick(STR.statusGenerating, lang) : '';

  return (
    <div data-demo-id="result-panel" className="flex h-full min-h-0 flex-col rounded-2xl bg-zinc-50 p-3">
      {phase === 'idle' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: FINDLE_GREEN }}>
            <Sparkles className="h-6 w-6" />
          </span>
          <p className="text-[15px] font-bold text-zinc-700">{pick(STR.emptyTitle, lang)}</p>
          <p className="text-[12px] leading-relaxed text-zinc-400">{pick(STR.emptyBody, lang)}</p>
        </div>
      ) : (
        <div className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto pr-1">
          {status && (
            <div className="mb-2 flex items-center gap-2 px-1 text-[12px] font-medium text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" /> {status}
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} />
            ))}
          </div>
          <AnimatePresence>
            {phase === 'done' && (
              <motion.button
                data-demo-id="save-quiz"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-bold text-white"
                style={{ background: FINDLE_GREEN }}
              >
                <Save className="h-3.5 w-3.5" /> {pick(STR.saveBtn, lang)}
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {phase === 'done' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center text-[10.5px] text-emerald-600">
                {fmt(pick(STR.statusDone, lang), { n: questions.length })}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
