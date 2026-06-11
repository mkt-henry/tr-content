import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Flame, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { FINDLE_APP_BG, FINDLE_GREEN, FindleBottomNav } from '../_shared/ui';
import { STR, TOP3_BADGE } from './data';
import { useLeaderboard } from './state';

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const MEDAL = ['#f4b400', '#9aa3ad', '#cd7f32']; // 1·2·3위

export function LeaderboardApp() {
  const s = useLeaderboard();
  const lang = useLang();
  const list = s.ranked();
  const me = list.find((m) => m.you)!;
  const above = list.find((m) => m.rank === me.rank - 1);
  const gap = above ? above.xp - me.xp + 1 : 0;

  return (
    <div className="relative flex h-full flex-col pt-8" style={{ background: FINDLE_APP_BG }}>
      {/* 헤더 */}
      <header className="shrink-0 px-4 pb-2 pt-3.5">
        <h2 className="text-[17px] font-extrabold text-zinc-900">{pick(STR.appTitle, lang)}</h2>
        <p className="text-[11.5px] text-zinc-400">{pick(STR.classLabel, lang)}</p>
      </header>

      {/* 순위 상승까지 */}
      <div className="shrink-0 px-4 pb-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
          {gap > 0 ? fmt(pick(STR.toRankUp, lang), { n: gap.toLocaleString('en-US') }) : '🎉 #1'}
        </span>
      </div>

      {/* 리더보드 */}
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto px-4 py-2">
        <div className="flex flex-col gap-2">
          {list.map((m) => (
            <motion.div
              key={m.id}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              data-demo-id={m.you ? 'my-rank-row' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 shadow-sm',
                m.you ? 'bg-emerald-50 ring-2 ring-emerald-300' : 'bg-white',
              )}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold tabular-nums text-white"
                style={{ background: m.rank <= 3 ? MEDAL[m.rank - 1] : '#d4d4d8' }}
              >
                {m.rank}
              </span>
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                style={{ background: m.you ? FINDLE_GREEN : '#a1a1aa' }}
              >
                {initials(m.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-900">
                  <span className="truncate">{m.name}</span>
                  {m.you && (
                    <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{pick(STR.you, lang)}</span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-[10.5px] text-orange-400">
                  <Flame className="h-3 w-3" /> {m.streak}
                  {pick(STR.dayStreakShort, lang)}
                </span>
              </span>
              <motion.span
                key={m.xp}
                initial={m.you ? { scale: 1.25, color: FINDLE_GREEN } : false}
                animate={{ scale: 1 }}
                className="shrink-0 text-[14px] font-extrabold tabular-nums"
                style={{ color: m.rank <= 3 ? '#f59e0b' : '#3f3f46' }}
              >
                {m.xp.toLocaleString('en-US')}
                <span className="ml-0.5 text-[10px] font-medium text-zinc-400">XP</span>
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 순위 상승 배너 */}
      <AnimatePresence>
        {s.rankUp && (
          <motion.div
            data-demo-id="rankup-banner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12.5px] font-bold text-white"
            style={{ background: FINDLE_GREEN }}
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
            {fmt(pick(STR.rankUp, lang), { from: s.rankUp.from, to: s.rankUp.to })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 퀴즈 풀기 버튼 */}
      <div className="shrink-0 px-4 pb-2 pt-1">
        <button
          data-demo-id="study-btn"
          onClick={() => s.study()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white"
          style={{ background: FINDLE_GREEN }}
        >
          <Sparkles className="h-4 w-4" /> {pick(STR.studyBtn, lang)}
        </button>
      </div>

      <FindleBottomNav active="ranks" />

      {/* 뱃지 언락 오버레이 */}
      <AnimatePresence>
        {s.badgeOpen && (
          <motion.div
            data-demo-id="badge-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="w-full max-w-xs rounded-3xl bg-white px-6 py-7 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-[40px] ring-4 ring-amber-200"
              >
                {TOP3_BADGE.emoji}
              </motion.div>
              <h3 className="mt-3 text-[18px] font-extrabold text-zinc-900">{pick(TOP3_BADGE.title, lang)}</h3>
              <p className="mt-1 text-[12.5px] text-zinc-500">{pick(TOP3_BADGE.desc, lang)}</p>
              <button
                data-demo-id="badge-cta"
                onClick={() => s.closeBadge()}
                className="mt-5 h-10 w-full rounded-2xl text-[13px] font-bold text-white"
                style={{ background: FINDLE_GREEN }}
              >
                {pick(STR.badgeCta, lang)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
