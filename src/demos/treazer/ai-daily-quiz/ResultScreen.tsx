import { motion } from 'framer-motion';
import { Trophy, Flame, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick, fmt } from '../_shared/i18n';
import { Coin } from '../_shared/ui';
import { CountUp } from '../../../ui/CountUp';
import { useAiDailyQuiz } from './state';
import {
  STR,
  CURRENCY,
  valuation,
  money,
  INITIAL_GOLD_PRICE,
  INITIAL_AVG_COST,
  GOLD_DAILY_CHANGE,
} from './data';

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
      <span className="whitespace-nowrap">
        <CountUp value={value} />
        {after}
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// ResultScreen
// ---------------------------------------------------------------------------

export function ResultScreen() {
  const { earnedGold, answers, comboMode, lang, goToFeed, gold, quizCount } = useAiDailyQuiz();

  const total = quizCount;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;

  const cur = CURRENCY[lang];
  const v = valuation(gold, INITIAL_GOLD_PRICE, INITIAL_AVG_COST, cur);

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
        <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
          <Coin className="h-6 w-6 shrink-0 text-[11px]" />
          <span className="text-balance text-center text-[16px] font-extrabold leading-snug tabular-nums text-amber-600">
            <GoldTemplate template={pick(STR.resultGold, lang)} value={earnedGold} />
          </span>
        </div>

        {/* 3. My Gold Value — highlights GOLD is pegged to real gold */}
        <div className="w-full rounded-2xl bg-zinc-900 p-4 text-white ring-1 ring-orange-400/50">
          {/* Label */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {pick(STR.myGoldValue, lang)}
          </p>

          {/* Balance row */}
          <div className="flex items-center gap-1.5">
            <Coin className="h-5 w-5 shrink-0 text-[10px]" />
            <span className="text-[22px] font-extrabold tabular-nums text-amber-400">
              {gold.toLocaleString('en-US')} G
            </span>
          </div>

          {/* Fiat value */}
          <p className="mt-0.5 text-[14px] tabular-nums text-zinc-300">
            ≈ <span className="font-semibold text-white">{money(v.value, cur)}</span>
          </p>

          {/* Since-collecting gain row */}
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-950/60 px-3 py-1.5 ring-1 ring-emerald-800/50">
            <span className="min-w-0 flex-1 text-[11px] leading-tight text-emerald-300">
              {pick(STR.sinceCollecting, lang)}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span className="text-[13px] font-bold tabular-nums text-emerald-400">
                +{(v.ret * 100).toFixed(1)}%
              </span>
              <span className="whitespace-nowrap text-[12px] tabular-nums text-emerald-500">
                (+{money(v.profit, cur)})
              </span>
            </span>
          </div>

          {/* Gold price daily change (rate only — avoids unrealistic per-gram spot across currencies) */}
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[12px] text-zinc-400">{pick(STR.goldPriceLabel, lang)}</span>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold tabular-nums text-emerald-400">
              ▲ +{(GOLD_DAILY_CHANGE * 100).toFixed(2)}% {pick(STR.todayChange, lang)}
            </span>
          </div>

          {/* Peg note */}
          <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
            {pick(STR.goldPeggedNote, lang)}
          </p>
        </div>

        {/* 4. Score */}
        <p className={cn('text-[15px] font-semibold text-zinc-500')}>
          {fmt(pick(STR.resultScore, lang), { c: correctCount, t: total })}
        </p>

        {/* 5. Streak card — only when comboMode (v2) */}
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

        {/* 6. CTA button */}
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
