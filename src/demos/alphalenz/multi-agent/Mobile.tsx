import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, ShieldCheck, Users, MessageCircleQuestion } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { MobileBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { CountUp } from '../../../ui/CountUp';
import { cn } from '../../../lib/cn';
import { useAgents } from './state';
import { AgentGraph } from './AgentGraph';
import { QUESTION, STR, AGENT_COUNT, CONFIDENCE, INSIGHT, INSIGHT_VERDICT } from './data';

export function Mobile(_: DemoComponentProps) {
  const { phase, countActive, logs, start } = useAgents();
  const lang = useLang();
  const running = phase !== 'idle';
  const done = phase === 'done';

  return (
    <div className="flex h-full flex-col" style={{ background: AL.appBg, color: '#e4e4e7' }}>
      <MobileBar title={pick(STR.logTitle, lang)} />
      <div className="demo-scroll flex-1 space-y-3 overflow-y-auto p-3">
        {/* 질문 + 버튼 */}
        <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: AL.border, background: AL.cardBg }}>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
            <MessageCircleQuestion className="h-3.5 w-3.5 text-violet-400" /> {pick(STR.question, lang)}
          </p>
          <p className="mt-1 text-[14px] font-medium text-zinc-100">{pick(QUESTION, lang)}</p>
          <button
            data-demo-id="run-btn"
            onClick={() => start('parallel')}
            disabled={running}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-semibold transition-colors',
              running ? 'bg-white/[0.05] text-zinc-500' : 'bg-violet-500 text-white',
            )}
          >
            {running && !done ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? pick(done ? STR.done : STR.running, lang) : pick(STR.run, lang)}
          </button>
        </div>

        {/* 카운터 */}
        <div className="flex items-center gap-3 rounded-xl border px-3.5 py-3" style={{ borderColor: AL.border, background: AL.cardBg }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-mono text-[20px] font-semibold leading-none text-zinc-100">
              <CountUp value={AGENT_COUNT} play={countActive} duration={1.6} />
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">{pick(STR.agentsActive, lang)}</p>
          </div>
          <p className="ml-auto max-w-[140px] text-right text-[10px] leading-snug text-zinc-500">{pick(STR.tagline, lang)}</p>
        </div>

        {/* 그래프 (compact) */}
        <AgentGraph compact />

        {/* 인사이트 카드 */}
        {phase === 'done' && (
          <motion.div
            data-demo-id="result-card"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border p-3.5"
            style={{
              borderColor: AL.accentRing,
              background: 'linear-gradient(160deg, rgba(124,92,255,0.12), rgba(124,92,255,0.03))',
              boxShadow: '0 0 40px -12px rgba(124,92,255,0.5)',
            }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-200">
                {pick(STR.insightTitle, lang)}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                <ShieldCheck className="h-3 w-3" /> {pick(STR.verified, lang)}
              </span>
              <span className="ml-auto text-[10px] text-zinc-400">
                {pick(STR.confidence, lang)}{' '}
                <span className="font-mono font-semibold text-violet-200">
                  <CountUp value={CONFIDENCE} play duration={1} />%
                </span>
              </span>
            </div>
            <p className="text-[14px] font-semibold text-zinc-100">{pick(INSIGHT_VERDICT, lang)}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">{pick(INSIGHT, lang)}</p>
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
                className="flex items-start gap-2 text-[12px] text-zinc-300"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <span className="leading-snug">{line}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
