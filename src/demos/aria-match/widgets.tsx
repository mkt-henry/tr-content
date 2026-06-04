import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle2, Copy, Crown, Loader2, Mail, Send } from 'lucide-react';
import { CountUp } from '../../ui/CountUp';
import { useMatch } from './state';
import { CANDIDATES, RISK_SUMMARY } from './data';
import { cn } from '../../lib/cn';

export function RiskCard({ compact }: { compact?: boolean }) {
  const phase = useMatch((s) => s.phase);
  const analyze = useMatch((s) => s.analyze);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-500">분석 대상 리스크</p>
      <h3 className="mt-1.5 text-[14px] font-semibold text-zinc-100">{RISK_SUMMARY.title}</h3>
      <div className={cn('mt-3 grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-1')}>
        {RISK_SUMMARY.items.map((it) => (
          <div key={it.label} className="flex items-baseline justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
            <span className="text-[10.5px] text-zinc-500">{it.label}</span>
            <span className="font-mono text-[11.5px] text-zinc-200">{it.value}</span>
          </div>
        ))}
      </div>
      <button
        data-demo-id="analyze-btn"
        onClick={analyze}
        disabled={phase !== 'idle'}
        className={cn(
          'mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all',
          phase === 'idle'
            ? 'bg-brass-500 text-ink-950 shadow-[0_8px_24px_-8px_rgba(192,141,82,0.6)] hover:bg-brass-400'
            : 'bg-white/[0.05] text-zinc-600',
        )}
      >
        {phase === 'scoring' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {phase === 'idle' ? '재보험사 적합도 분석' : phase === 'scoring' ? '선호도 분석 중…' : '분석 완료'}
      </button>
    </div>
  );
}

export function CandidateList({ compact }: { compact?: boolean }) {
  const m = useMatch();
  const list = m.ranked ? [...CANDIDATES].sort((a, b) => b.score - a.score) : CANDIDATES;
  const topId = [...CANDIDATES].sort((a, b) => b.score - a.score)[0].id;

  return (
    <div className="space-y-2.5">
      {list.map((c) => {
        const revealed = !!m.revealed[c.id];
        const isTop = m.ranked && c.id === topId;
        const selected = m.selectedId === c.id;
        return (
          <motion.div
            key={c.id}
            layout
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'rounded-xl border p-3.5 transition-colors duration-300',
              isTop
                ? 'border-brass-400/50 bg-brass-400/[0.07] shadow-[0_0_28px_-8px_rgba(217,173,120,0.45)]'
                : 'border-white/[0.07] bg-white/[0.03]',
              !revealed && m.phase !== 'idle' && 'opacity-60',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  isTop ? 'bg-brass-500/25 text-brass-300' : 'bg-white/[0.06] text-zinc-400',
                )}
              >
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-zinc-100">
                  {c.name}
                  {isTop && <Crown className="h-3.5 w-3.5 text-brass-300" />}
                </p>
                <p className="text-[10.5px] text-zinc-500">{c.region}</p>
              </div>
              {/* 적합도 게이지 */}
              <div className="w-28 shrink-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-[9.5px] text-zinc-500">적합도</span>
                  <span className={cn('font-mono text-[15px] font-semibold', isTop ? 'text-brass-300' : 'text-zinc-200')}>
                    {revealed ? <CountUp value={c.score} duration={1} /> : '—'}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    className={cn('h-full rounded-full', isTop ? 'bg-brass-400' : 'bg-teal-500/70')}
                    initial={false}
                    animate={{ width: revealed ? `${c.score}%` : '0%' }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>
            {/* 근거 칩 */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.reasons.map((r, i) => (
                      <span key={i} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-zinc-400">
                        {r}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* 선택 버튼 */}
            <AnimatePresence>
              {m.ranked && isTop && !compact && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                  <button
                    data-demo-id={`select-${c.id}`}
                    onClick={() => m.select(c.id)}
                    className={cn(
                      'flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-semibold transition-all',
                      selected
                        ? 'bg-white/[0.06] text-zinc-400'
                        : 'bg-brass-500 text-ink-950 hover:bg-brass-400',
                    )}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {selected ? '이메일 작성 중' : '이 재보험사로 영업 이메일 작성'}
                  </button>
                </motion.div>
              )}
              {m.ranked && isTop && compact && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                  <button
                    data-demo-id={`select-${c.id}`}
                    onClick={() => m.select(c.id)}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-brass-500 text-[12px] font-semibold text-ink-950"
                  >
                    <Mail className="h-3.5 w-3.5" /> 영업 이메일 작성
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/** 영문 영업 이메일 초안 패널 */
export function EmailPanel() {
  const m = useMatch();
  if (!m.selectedId) return null;
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <Mail className="h-4 w-4 text-brass-400" />
        <span className="text-[12.5px] font-medium text-zinc-200">영업 이메일 초안</span>
        <AnimatePresence>
          {m.emailStatus === 'done' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
            >
              <CheckCircle2 className="h-3 w-3" /> 초안 완성 · 검토 후 발송
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
        <div className="rounded-lg bg-white/[0.03] px-3.5 py-2.5">
          <p className="text-[9.5px] uppercase tracking-wider text-zinc-600">To</p>
          <p className="mt-0.5 font-mono text-[11.5px] text-zinc-300">m.keller@swissre.com · Property Cat APAC</p>
        </div>
        <div className="mt-2.5 rounded-lg bg-white/[0.03] px-3.5 py-2.5">
          <p className="text-[9.5px] uppercase tracking-wider text-zinc-600">Subject</p>
          <p className={cn('mt-0.5 text-[12px] font-medium text-zinc-100', m.emailStatus === 'streaming' && !m.emailBody && 'stream-caret')}>
            {m.emailSubject}
          </p>
        </div>
        <div
          data-demo-id="email-body"
          className={cn(
            'mt-2.5 whitespace-pre-wrap rounded-lg bg-white/[0.03] px-3.5 py-3 text-[11.5px] leading-relaxed text-zinc-300',
            m.emailStatus === 'streaming' && m.emailBody && 'stream-caret',
          )}
        >
          {m.emailBody}
        </div>
      </div>
      <div className="flex shrink-0 gap-2 border-t border-white/[0.06] p-3.5">
        <button
          data-demo-id="email-send"
          className={cn(
            'flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-[12px] font-semibold transition-all',
            m.emailStatus === 'done' ? 'bg-brass-500 text-ink-950 shadow-[0_6px_20px_-6px_rgba(192,141,82,0.6)]' : 'bg-white/[0.05] text-zinc-600',
          )}
        >
          <Send className="h-3.5 w-3.5" /> 검토 후 발송
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:bg-white/[0.06]">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
