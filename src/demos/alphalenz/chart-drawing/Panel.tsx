import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, PlayCircle } from 'lucide-react';
import { useChart } from './state';
import { STR, type DrawStep, type Ticker } from './data';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

/** 종목 헤더바 — 차트 위 종목 메타 */
export function TickerHeader({ ticker }: { ticker: Ticker }) {
  const lang = useLang();
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-[12px] font-bold text-violet-200">
        {ticker.symbol.slice(0, 2)}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-zinc-100">{pick(ticker.name, lang)}</span>
          <span className="font-mono text-[10.5px] text-zinc-500">
            {ticker.exchange}:{ticker.symbol}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[15px] font-semibold text-zinc-100">{ticker.price}</span>
          <span className={cn('text-[11px] font-medium', ticker.positive ? 'text-emerald-400' : 'text-rose-400')}>
            {pick(ticker.change, lang)}
          </span>
        </div>
      </div>
      <span className="ml-auto flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {pick(STR.livePrice, lang)} · {pick(STR.timeframe, lang)}
      </span>
    </div>
  );
}

/** 우측 AI 분석 패널 — 인디케이터 + 단계별 코멘트 stagger */
export function AnalysisPanel({ steps, compact }: { steps: DrawStep[]; compact?: boolean }) {
  const { step, analyzing, done } = useChart();
  const lang = useLang();
  const visible = steps.slice(0, step);

  return (
    <div className={cn('flex h-full flex-col rounded-xl border p-4', compact && 'p-3.5')} style={{ borderColor: AL.border, background: AL.cardBg }}>
      {/* 인디케이터 */}
      <div className="flex items-center gap-2 pb-3">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <span className="text-[12.5px] font-semibold text-zinc-200">{pick(STR.panelTitle, lang)}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {done ? (
            <span className="flex items-center gap-1 text-[10.5px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {pick(STR.drawingDone, lang)}
            </span>
          ) : analyzing ? (
            <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400 shadow-[0_0_8px_2px_rgba(124,92,255,0.6)]" />
              {pick(STR.analyzing, lang)}
            </span>
          ) : (
            <span className="text-[10.5px] text-zinc-600">idle</span>
          )}
        </span>
      </div>

      <div className="h-px w-full" style={{ background: AL.border }} />

      {/* 코멘트 스택 */}
      <div className="demo-scroll mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {!analyzing && step === 0 && (
          <p className="px-1 pt-6 text-center text-[11.5px] leading-relaxed text-zinc-600">{pick(STR.idleHint, lang)}</p>
        )}
        <AnimatePresence>
          {visible.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-lg border p-2.5"
              style={{ borderColor: `${s.color}33`, background: `${s.color}0d` }}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[10.5px] font-semibold" style={{ color: s.color }}>
                  {pick(s.label, lang)}
                </span>
                <span className="ml-auto font-mono text-[9px] text-zinc-600">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-zinc-300">{pick(s.comment, lang)}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 진행 중 다음 단계 셔터 */}
        {analyzing && !done && step < steps.length && (
          <div className="flex items-center gap-2 px-1 py-1.5 text-[11px] text-zinc-500">
            <span className="shimmer h-2 w-2 rounded-full bg-violet-500/60" />
            <span className="shimmer">{pick(steps[step].label, lang)}…</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** 분석 실행 트리거 버튼 */
export function AnalyzeButton({ onStart, full }: { onStart: () => void; full?: boolean }) {
  const { analyzing } = useChart();
  const lang = useLang();
  return (
    <button
      data-demo-id="analyze-btn"
      onClick={onStart}
      disabled={analyzing}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-[12.5px] font-semibold transition-all',
        full && 'w-full',
        analyzing
          ? 'cursor-default border-violet-500/20 bg-violet-500/[0.06] text-violet-300/60'
          : 'border-violet-400/40 bg-violet-500/15 text-violet-200 hover:bg-violet-500/25',
      )}
    >
      <PlayCircle className="h-4 w-4" />
      {pick(STR.analyzeBtn, lang)}
    </button>
  );
}
