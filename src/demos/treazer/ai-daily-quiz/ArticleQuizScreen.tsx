import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles, Check, X } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick, fmt } from '../_shared/i18n';
import type { Lang } from '../_shared/i18n';
import { Wordmark, GoldPill, Coin } from '../_shared/ui';
import { Thumbnail, GoldFloat, ComboBadge } from './widgets';
import { useAiDailyQuiz } from './state';
import { SOLVABLE_ARTICLE, STR } from './data';
import type { Quiz } from './data';

// ---------------------------------------------------------------------------
// See-results label (inline localised map — no data.ts change needed)
// ---------------------------------------------------------------------------

const SEE_RESULTS_LABEL: Record<Lang, string> = {
  en: 'See results',
  ja: '結果を見る',
  vi: 'Xem kết quả',
  th: 'ดูผลลัพธ์',
};

// ---------------------------------------------------------------------------
// QuizBlock sub-component
// ---------------------------------------------------------------------------

interface QuizBlockProps {
  quiz: Quiz;
  index: number;
  lang: Lang;
}

function QuizBlock({ quiz, index, lang }: QuizBlockProps) {
  const { answers, combo, comboMode, selectAnswer } = useAiDailyQuiz();
  const ans = answers[index];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      {/* Top row: AI Quiz label + reward */}
      <div className="mb-2.5 flex items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-orange-500">AI Quiz</span>
        <span className="mx-1 text-zinc-300">·</span>
        <Coin className="h-3.5 w-3.5 shrink-0 text-[8px]" />
        <span className="text-[11px] font-semibold text-amber-500">
          {fmt(pick(STR.upTo, lang), { n: quiz.reward })}
        </span>
      </div>

      {/* Question */}
      <p className="mb-3 text-[14px] font-bold leading-snug text-zinc-900">
        {pick(quiz.question, lang)}
      </p>

      {/* 2×2 option grid */}
      <div className="grid grid-cols-2 gap-2">
        {pick(quiz.options, lang).map((optText, j) => {
          let btnClass =
            'flex w-full items-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-left text-[12px] font-medium leading-snug transition-colors';
          let icon: React.ReactNode = null;

          if (!ans) {
            btnClass = cn(
              btnClass,
              'border-zinc-100 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:border-zinc-200',
            );
          } else if (j === quiz.correctIndex) {
            btnClass = cn(btnClass, 'border-emerald-400 bg-emerald-50 text-emerald-700');
            icon = <Check className="h-3.5 w-3.5 shrink-0" />;
          } else if (j === ans.selected) {
            btnClass = cn(btnClass, 'border-rose-400 bg-rose-50 text-rose-600');
            icon = <X className="h-3.5 w-3.5 shrink-0" />;
          } else {
            btnClass = cn(
              btnClass,
              'border-zinc-100 bg-zinc-100/60 text-zinc-400 opacity-60',
            );
          }

          return (
            <button
              key={j}
              data-demo-id={`quiz-${index}-opt-${j}`}
              onClick={() => selectAnswer(index, j)}
              disabled={!!ans}
              className={btnClass}
            >
              {icon}
              <span>{optText}</span>
            </button>
          );
        })}
      </div>

      {/* Result + explanation (shown after answering) */}
      {ans && (
        <div className="relative mt-3">
          {/* GoldFloat is absolutely positioned inside this relative wrapper */}
          <GoldFloat show={ans.correct} amount={quiz.reward} />

          {/* Correct / Wrong label */}
          <p
            className={cn(
              'mb-1.5 text-[13px] font-bold',
              ans.correct ? 'text-emerald-600' : 'text-rose-500',
            )}
          >
            {ans.correct ? pick(STR.correct, lang) : pick(STR.wrong, lang)}
          </p>

          {/* Combo badge */}
          {comboMode && ans.correct && <ComboBadge combo={combo} />}

          {/* Explanation — slide down */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-zinc-50 px-3 py-2.5">
              <p className="text-[11.5px] leading-relaxed text-zinc-500">
                {pick(quiz.explanation, lang)}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ArticleQuizScreen
// ---------------------------------------------------------------------------

export function ArticleQuizScreen() {
  const { gold, flash, lang, answers, goToFeed, finish } = useAiDailyQuiz();

  const allAnswered =
    Object.keys(answers).length === SOLVABLE_ARTICLE.quizzes.length;

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#f4f4f6' }}>
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-3 pb-2 pt-4">
        <button
          onClick={goToFeed}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-200 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>
        <Wordmark className="text-[18px]" />
        <GoldPill amount={gold} flash={flash} />
      </div>

      {/* Scrollable content */}
      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-4">
          {/* Article header */}
          <div className="flex items-start gap-3 pt-1">
            <Thumbnail thumb={SOLVABLE_ARTICLE.thumb} className="h-16 w-16" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[15px] font-bold leading-snug text-zinc-900">
                {pick(SOLVABLE_ARTICLE.headline, lang)}
              </p>
              <p className="text-[11.5px] text-zinc-400">
                {SOLVABLE_ARTICLE.source} · {pick(SOLVABLE_ARTICLE.time, lang)}
              </p>
            </div>
          </div>

          {/* Article summary card */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p
              className="whitespace-pre-line text-[12.5px] leading-relaxed text-zinc-500"
            >
              {pick(SOLVABLE_ARTICLE.summary, lang)}
            </p>
          </div>

          {/* Divider + quiz section header */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-zinc-200" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-[13px] font-bold text-orange-500">
                {pick(STR.aiQuizHeader, lang)}
              </span>
            </div>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          {/* Quiz blocks */}
          {SOLVABLE_ARTICLE.quizzes.map((quiz, i) => (
            <QuizBlock key={i} quiz={quiz} index={i} lang={lang} />
          ))}

          {/* See results button — appears after all quizzes answered */}
          <AnimatePresence>
            {allAnswered && (
              <motion.button
                key="see-result-btn"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                data-demo-id="see-result"
                onClick={finish}
                className="w-full rounded-2xl bg-orange-500 py-3.5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-orange-600 active:bg-orange-700"
              >
                {SEE_RESULTS_LABEL[lang]}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
