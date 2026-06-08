import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CalendarClock, CheckCircle2, FileDown, Loader2, Sparkles, TrendingUp, History, Lightbulb, Share2 } from 'lucide-react';
import { CountUp } from '../../../ui/CountUp';
import { useRenewals } from './state';
import { RENEWALS, BRIEFING, TERMS_STATS, STR, type RenewalCard } from './data';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

export function DDayBadge({ dday }: { dday: number | null }) {
  const lang = useLang();
  if (dday === null) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> {pick(STR.done, lang)}
      </span>
    );
  }
  const tone =
    dday <= 5
      ? 'bg-rose-500/15 text-rose-400 animate-pulse'
      : dday <= 10
        ? 'bg-amber-500/15 text-amber-400'
        : 'bg-white/[0.07] text-zinc-400';
  return <span className={cn('rounded-full px-2 py-0.5 font-mono text-[10px] font-medium', tone)}>D-{dday}</span>;
}

export function RenewalCardItem({ card, index }: { card: RenewalCard; index: number }) {
  const { selectedCardId, selectCard } = useRenewals();
  const lang = useLang();
  const selected = selectedCardId === card.id;
  return (
    <motion.button
      type="button"
      data-demo-id={`renewal-${card.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => selectCard(selected ? null : card.id)}
      className={cn(
        'block w-full rounded-xl border p-3 text-left transition-all duration-300',
        selected
          ? 'border-brass-400/50 bg-brass-400/[0.07] shadow-[0_0_24px_-8px_rgba(217,173,120,0.4)]'
          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.15]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12px] font-semibold text-zinc-100">{card.title}</p>
        <DDayBadge dday={card.dday} />
      </div>
      <p className="mt-1 text-[10.5px] text-zinc-500">
        {pick(card.cedant, lang)} · {card.klass}
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-600">
        <Building2 className="h-3 w-3" /> {card.reinsurer}
      </p>
    </motion.button>
  );
}

const ITEM_ICONS: Record<string, typeof Building2> = {
  profile: Building2,
  trend: TrendingUp,
  terms: History,
  points: Lightbulb,
};

/** 미팅 브리핑 패널 (선택된 갱신 건 기준) */
export function BriefingPanel() {
  const s = useRenewals();
  const lang = useLang();
  const card = RENEWALS.find((c) => c.id === s.selectedCardId);
  if (!card) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-brass-400" />
          <span className="text-[12.5px] font-medium text-zinc-200">
            {pick(card.cedant, lang)} {card.title} — {pick(STR.briefingSuffix, lang)}
          </span>
          <span className="ml-auto">
            <DDayBadge dday={card.dday} />
          </span>
        </div>
      </div>

      <div className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto p-4">
        {s.briefPhase === 'idle' ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brass-500/15 text-brass-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[13.5px] font-medium text-zinc-300">{pick(STR.idleTitle, lang)}</p>
              <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-zinc-500">
                {pick(STR.idleBody, lang)}
              </p>
            </div>
            <button
              data-demo-id="brief-btn"
              onClick={() => s.generateBriefing()}
              className="flex h-10 items-center gap-2 rounded-xl bg-brass-500 px-5 text-[13px] font-semibold text-ink-950 shadow-[0_8px_24px_-8px_rgba(192,141,82,0.6)] hover:bg-brass-400"
            >
              <Sparkles className="h-4 w-4" /> {pick(STR.generateBtn, lang)}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {BRIEFING.map((item) => {
              const status = s.itemStatus[item.id];
              const text = s.itemText[item.id] ?? '';
              const Icon = ITEM_ICONS[item.id];
              return (
                <motion.div
                  key={item.id}
                  data-demo-id={`brief-${item.id}`}
                  initial={false}
                  animate={{ opacity: status === 'pending' ? 0.35 : 1 }}
                  className={cn(
                    'rounded-xl border p-3.5 transition-colors duration-300',
                    status === 'streaming' ? 'border-brass-400/40 bg-brass-400/[0.06]' : 'border-white/[0.07] bg-white/[0.03]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', status === 'done' ? 'text-brass-400' : 'text-zinc-500')} />
                    <p className="text-[11px] font-medium text-zinc-400">{pick(item.title, lang)}</p>
                    {status === 'streaming' && <Loader2 className="ml-auto h-3 w-3 animate-spin text-brass-400" />}
                    {status === 'done' && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                  {status === 'pending' ? (
                    <div className="shimmer mt-2 h-3.5 w-3/4 rounded" />
                  ) : (
                    <p
                      className={cn(
                        'mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-zinc-200',
                        status === 'streaming' && 'stream-caret',
                      )}
                    >
                      {text}
                    </p>
                  )}
                  {/* 지난 조건 카드: 스탯 칩 + 손해율 카운트업 */}
                  {item.id === 'terms' && status === 'done' && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5 grid grid-cols-3 gap-2">
                      {TERMS_STATS.map((stat) => (
                        <div key={stat.label.en} className="rounded-lg bg-white/[0.04] px-2.5 py-2 text-center">
                          <p className="text-[9.5px] text-zinc-500">{pick(stat.label, lang)}</p>
                          <p className="mt-0.5 font-mono text-[13px] font-semibold text-zinc-100">
                            {stat.countTo ? (
                              <>
                                <CountUp value={stat.countTo} duration={0.9} />%
                              </>
                            ) : (
                              pick(stat.value, lang)
                            )}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 푸터 */}
      <AnimatePresence>
        {s.briefPhase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex shrink-0 items-center gap-2 border-t border-white/[0.06] p-3.5"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {pick(STR.briefingDonePrefix, lang)}{' '}
              {card.dday !== null ? `D-${card.dday}` : pick(STR.done, lang)}
            </span>
            <button className="ml-auto flex h-8 items-center gap-1.5 rounded-lg bg-brass-500 px-3 text-[11.5px] font-semibold text-ink-950 shadow-[0_6px_20px_-6px_rgba(192,141,82,0.6)]">
              <FileDown className="h-3.5 w-3.5" /> PDF
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400">
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
