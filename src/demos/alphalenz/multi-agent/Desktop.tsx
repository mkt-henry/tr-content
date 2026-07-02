import { motion } from 'framer-motion';
import { Play, Loader2, ShieldCheck, Users, MessageCircleQuestion } from 'lucide-react';
import { FocusPanel } from './FocusPanel';
import type { DemoComponentProps } from '../../../registry/types';
import { TopBar } from '../_shared/Chrome';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { CountUp } from '../../../ui/CountUp';
import { cn } from '../../../lib/cn';
import { useAgents } from './state';
import { AgentGraph } from './AgentGraph';
import { QUESTION, STR, AGENT_COUNT, CONFIDENCE, INSIGHT, INSIGHT_VERDICT } from './data';

/** 사용자 질문 + 분석 시작 버튼 */
function QuestionBar() {
  const { phase, start } = useAgents();
  const lang = useLang();
  const running = phase !== 'idle';
  const done = phase === 'done';
  return (
    <div className="flex items-center gap-3 rounded-[4px] border px-4 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
      <MessageCircleQuestion className="h-4 w-4 shrink-0" style={{ color: CONSOLE.accent }} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>{pick(STR.question, lang)}</p>
        <p className="truncate text-[14px] font-medium" style={{ color: CONSOLE.text }}>{pick(QUESTION, lang)}</p>
      </div>
      <button
        data-demo-id="run-btn"
        onClick={() => start('orchestrate')}
        disabled={running}
        className={cn(
          'flex items-center gap-1.5 rounded-[4px] px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
          running ? 'text-zinc-500' : 'text-white',
        )}
        style={{ background: running ? 'rgba(255,255,255,0.05)' : CONSOLE.accent }}
      >
        {running && !done ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        {running ? pick(done ? STR.done : STR.running, lang) : pick(STR.run, lang)}
      </button>
    </div>
  );
}

/** 병렬 에이전트 카운터 */
function CountBadge() {
  const { countActive } = useAgents();
  const lang = useLang();
  return (
    <div className="flex items-center gap-3 rounded-[4px] border px-4 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-[4px]" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
        <Users className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="font-mono text-[22px] font-semibold leading-none" style={{ color: CONSOLE.text }}>
          <CountUp value={AGENT_COUNT} play={countActive} duration={1.6} />
        </p>
        <p className="mt-0.5 text-[10.5px]" style={{ color: CONSOLE.textMicro }}>{pick(STR.agentsActive, lang)}</p>
      </div>
      <p className="ml-auto max-w-[180px] text-right text-[10.5px] leading-snug" style={{ color: CONSOLE.textMicro }}>
        {pick(STR.tagline, lang)}
      </p>
    </div>
  );
}

/** 최종 인사이트 카드 */
function InsightCard() {
  const { phase } = useAgents();
  const lang = useLang();
  if (phase !== 'done') return null;
  return (
    <motion.div
      data-demo-id="result-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[4px] border p-4"
      style={{ borderColor: CONSOLE.accentBorder, background: CONSOLE.accentFill }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-[3px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
          {pick(STR.insightTitle, lang)}
        </span>
        <span className="flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(94,156,131,0.15)', color: CONSOLE.done }}>
          <ShieldCheck className="h-3 w-3" /> {pick(STR.verified, lang)}
        </span>
        <span className="ml-auto text-[10.5px]" style={{ color: CONSOLE.textDim }}>
          {pick(STR.confidence, lang)}{' '}
          <span className="font-mono font-semibold" style={{ color: CONSOLE.accent }}>
            <CountUp value={CONFIDENCE} play duration={1} />%
          </span>
        </span>
      </div>
      <p className="text-[15px] font-semibold" style={{ color: CONSOLE.text }}>{pick(INSIGHT_VERDICT, lang)}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: CONSOLE.textDim }}>{pick(INSIGHT, lang)}</p>
    </motion.div>
  );
}

export function Desktop(_: DemoComponentProps) {
  return (
    <div className="flex h-full flex-col" style={{ background: CONSOLE.bg, color: CONSOLE.text }}>
      <TopBar activeTab={1} search={STR.search} />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_440px] gap-3 p-3">
        <div className="flex min-h-0 flex-col gap-3">
          <QuestionBar />
          <div className="min-h-0 flex-1">
            <AgentGraph />
          </div>
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <CountBadge />
          <FocusPanel className="flex-1" />
          <InsightCard />
        </div>
      </div>
    </div>
  );
}
