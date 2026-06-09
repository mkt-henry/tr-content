import { motion } from 'framer-motion';
import { Trophy, Flame } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick, fmt } from '../_shared/i18n';
import { Coin } from '../_shared/ui';
import { CountUp } from '../../../ui/CountUp';
import { useAiDailyQuiz } from './state';
import { SOLVABLE_ARTICLE, STR } from './data';

// ---------------------------------------------------------------------------
// Helper: render a localised template with {n} replaced by a <CountUp> node
// ---------------------------------------------------------------------------

function GoldTemplate({ template, value }: { template: string; value: number }) {
  const parts = template.split('{n}');
  // parts should be [before, after]; guard for unexpected formats
  const before = parts[0] ?? '';
  const after = parts[1] ?? '';
  return (
    <>
      {before}
      <CountUp value={value} />
      {after}
    </>
  );
}

// ---------------------------------------------------------------------------
// ResultScreen
// ---------------------------------------------------------------------------

export function ResultScreen() {
  const { earnedGold, answers, comboMode, lang, goToFeed } = useAiDailyQuiz();

  const total = SOLVABLE_ARTICLE.quizzes.length;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;

  return (
    <div
      className="flex h-full flex-col items-center justify-center px-5 py-8"
      style={{ backgroundColor: '#f4f4f6' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-white px-6 py-8 shadow-lg"
      >
        {/* 1. Celebration icon + title */}
        <div className="flex flex-col items-center gap-2">
          <Trophy className="h-12 w-12 text-amber-400" />
          <h1 className="text-center text-[22px] font-extrabold leading-tight text-zinc-900">
            {pick(STR.resultTitle, lang)}
          </h1>
        </div>

        {/* 2. Earned gold */}
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-5 py-3 ring-1 ring-amber-200">
          <Coin className="h-6 w-6 shrink-0 text-[11px]" />
          <span className="text-[20px] font-extrabold tabular-nums text-amber-600">
            <GoldTemplate template={pick(STR.resultGold, lang)} value={earnedGold} />
          </span>
        </div>

        {/* 3. Score */}
        <p className={cn('text-[15px] font-semibold text-zinc-500')}>
          {fmt(pick(STR.resultScore, lang), { c: correctCount, t: total })}
        </p>

        {/* 4. Streak card — only when comboMode (v2) */}
        {comboMode && (
          <div className="flex w-full flex-col items-center gap-1 rounded-2xl bg-orange-50 px-4 py-4 ring-1 ring-orange-200">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-[16px] font-extrabold text-orange-600">
                {fmt(pick(STR.streakTitle, lang), { n: 7 })}
              </span>
            </div>
            <p className="text-center text-[12px] font-medium text-orange-400">
              {pick(STR.tomorrow, lang)}
            </p>
          </div>
        )}

        {/* 5. CTA button */}
        <button
          data-demo-id="result-cta"
          onClick={goToFeed}
          className="mt-1 w-full rounded-2xl bg-orange-500 py-3.5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-orange-600 active:bg-orange-700"
        >
          {pick(STR.playAgain, lang)}
        </button>
      </motion.div>
    </div>
  );
}
