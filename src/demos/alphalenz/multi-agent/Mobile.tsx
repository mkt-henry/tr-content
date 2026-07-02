import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, ShieldCheck, Users, MessageCircleQuestion } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { MobileBar } from '../_shared/Chrome';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { CountUp } from '../../../ui/CountUp';
import { cn } from '../../../lib/cn';
import { useAgents } from './state';
import { AgentGraph } from './AgentGraph';
import { FocusPanel } from './FocusPanel';
import { QUESTION, STR, AGENT_COUNT, CONFIDENCE, INSIGHT, INSIGHT_VERDICT } from './data';

export function Mobile(_: DemoComponentProps) {
  const { phase, countActive, logs, start } = useAgents();
  const lang = useLang();
  const running = phase !== 'idle';
  const done = phase === 'done';

  return (
    <div className="flex h-full flex-col" style={{ background: CONSOLE.bg, color: CONSOLE.text }}>
      <MobileBar title={pick(STR.logTitle, lang)} />
      <div className="demo-scroll flex-1 space-y-3 overflow-y-auto p-3">
        {/* 질문 + 버튼 */}
        <div className="rounded-[4px] border px-3.5 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>
            <MessageCircleQuestion className="h-3.5 w-3.5" style={{ color: CONSOLE.accent }} /> {pick(STR.question, lang)}
          </p>
          <p className="mt-1 text-[14px] font-medium" style={{ color: CONSOLE.text }}>{pick(QUESTION, lang)}</p>
          <button
            data-demo-id="run-btn"
            onClick={() => start('parallel')}
            disabled={running}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-1.5 rounded-[4px] py-2.5 text-[13px] font-semibold transition-colors',
              running ? 'text-zinc-500' : 'text-white',
            )}
            style={{ background: running ? 'rgba(255,255,255,0.05)' : CONSOLE.accent }}
          >
            {running && !done ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? pick(done ? STR.done : STR.running, lang) : pick(STR.run, lang)}
          </button>
        </div>

        {/* 카운터 */}
        <div className="flex items-center gap-3 rounded-[4px] border px-3.5 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px]" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-mono text-[20px] font-semibold leading-none" style={{ color: CONSOLE.text }}>
              <CountUp value={AGENT_COUNT} play={countActive} duration={1.6} />
            </p>
            <p className="mt-0.5 text-[10px]" style={{ color: CONSOLE.textMicro }}>{pick(STR.agentsActive, lang)}</p>
          </div>
          <p className="ml-auto max-w-[140px] text-right text-[10px] leading-snug" style={{ color: CONSOLE.textMicro }}>{pick(STR.tagline, lang)}</p>
        </div>

        {/* 그래프 (compact) */}
        <AgentGraph compact />

        {/* 포커스 패널 */}
        <FocusPanel className="min-h-[280px]" />

        {/* 인사이트 카드 */}
        {phase === 'done' && (
          <motion.div
            data-demo-id="result-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[4px] border p-3.5"
            style={{ borderColor: CONSOLE.accentBorder, background: CONSOLE.accentFill }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-[3px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
                {pick(STR.insightTitle, lang)}
              </span>
              <span className="flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(94,156,131,0.15)', color: CONSOLE.done }}>
                <ShieldCheck className="h-3 w-3" /> {pick(STR.verified, lang)}
              </span>
              <span className="ml-auto text-[10px]" style={{ color: CONSOLE.textDim }}>
                {pick(STR.confidence, lang)}{' '}
                <span className="font-mono font-semibold" style={{ color: CONSOLE.accent }}>
                  <CountUp value={CONFIDENCE} play duration={1} />%
                </span>
              </span>
            </div>
            <p className="text-[14px] font-semibold" style={{ color: CONSOLE.text }}>{pick(INSIGHT_VERDICT, lang)}</p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: CONSOLE.textDim }}>{pick(INSIGHT, lang)}</p>
          </motion.div>
        )}

        {/* 로그 */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {logs.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-start gap-2 text-[12px]"
                style={{ color: CONSOLE.textDim }}
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CONSOLE.accent }} />
                <span className="leading-snug">{line}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
