import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, ShieldCheck, Sparkles, Users, MessageCircleQuestion } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { TopBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
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
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: AL.border, background: AL.cardBg }}
    >
      <MessageCircleQuestion className="h-4 w-4 shrink-0 text-violet-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">{pick(STR.question, lang)}</p>
        <p className="truncate text-[14px] font-medium text-zinc-100">{pick(QUESTION, lang)}</p>
      </div>
      <button
        data-demo-id="run-btn"
        onClick={() => start('orchestrate')}
        disabled={running}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
          running ? 'bg-white/[0.05] text-zinc-500' : 'bg-violet-500 text-white hover:bg-violet-400',
        )}
      >
        {running && !done ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        {running ? pick(done ? STR.done : STR.running, lang) : pick(STR.run, lang)}
      </button>
    </div>
  );
}

/** 병렬 에이전트 카운터 + 카피 */
function CountBadge() {
  const { countActive } = useAgents();
  const lang = useLang();
  return (
    <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: AL.border, background: AL.cardBg }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
        <Users className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="font-mono text-[22px] font-semibold leading-none text-zinc-100">
          <CountUp value={AGENT_COUNT} play={countActive} duration={1.6} />
        </p>
        <p className="mt-0.5 text-[10.5px] text-zinc-500">{pick(STR.agentsActive, lang)}</p>
      </div>
      <p className="ml-auto max-w-[180px] text-right text-[10.5px] leading-snug text-zinc-500">
        {pick(STR.tagline, lang)}
      </p>
    </div>
  );
}

/** 추론 진행 로그 */
function LogPanel() {
  const { logs } = useAgents();
  const lang = useLang();
  return (
    <div className="flex min-h-0 flex-col rounded-xl border p-4" style={{ borderColor: AL.border, background: AL.cardBg }}>
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        <Sparkles className="h-3.5 w-3.5 text-violet-400" /> {pick(STR.logTitle, lang)}
      </p>
      <div className="demo-scroll flex-1 space-y-2 overflow-y-auto">
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
        {logs.length === 0 && (
          <p className="text-[12px] text-zinc-600">{pick({ ko: '분석 시작을 누르면 추론 과정이 표시됩니다.', en: 'Press Run to stream the reasoning trace.' }, lang)}</p>
        )}
      </div>
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
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border p-4"
      style={{
        borderColor: AL.accentRing,
        background: 'linear-gradient(160deg, rgba(124,92,255,0.12), rgba(124,92,255,0.03))',
        boxShadow: '0 0 40px -12px rgba(124,92,255,0.5)',
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-200">
          {pick(STR.insightTitle, lang)}
        </span>
        <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
          <ShieldCheck className="h-3 w-3" /> {pick(STR.verified, lang)}
        </span>
        <span className="ml-auto text-[10.5px] text-zinc-400">
          {pick(STR.confidence, lang)}{' '}
          <span className="font-mono font-semibold text-violet-200">
            <CountUp value={CONFIDENCE} play duration={1} />%
          </span>
        </span>
      </div>
      <p className="text-[15px] font-semibold text-zinc-100">{pick(INSIGHT_VERDICT, lang)}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-300">{pick(INSIGHT, lang)}</p>
    </motion.div>
  );
}

export function Desktop(_: DemoComponentProps) {
  return (
    <div className="flex h-full flex-col" style={{ background: AL.appBg, color: '#e4e4e7' }}>
      <TopBar activeTab={1} search={STR.search} />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px] gap-3 p-3">
        {/* 좌: 질문 + 그래프 */}
        <div className="flex min-h-0 flex-col gap-3">
          <QuestionBar />
          <div className="min-h-0 flex-1">
            <AgentGraph />
          </div>
        </div>
        {/* 우: 카운터 + 로그 + 인사이트 */}
        <div className="flex min-h-0 flex-col gap-3">
          <CountBadge />
          <div className="min-h-0 flex-1">
            <LogPanel />
          </div>
          <InsightCard />
        </div>
      </div>
    </div>
  );
}
