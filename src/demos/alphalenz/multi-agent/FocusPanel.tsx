import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, Cpu } from 'lucide-react';
import { useAgents } from './state';
import { FOCUS_SCRIPTS, STAGE_FOCUS, groupById, mutedTick, type FocusScript } from './data';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/**
 * 포커스(클로즈업) 패널 — 콘솔 팔레트.
 * - agent 포커스: 4요소(thinking 타이핑 / tool call / 미니 산출물 / 근거 체인).
 * - stage 포커스: Orchestrator 단계 요약.
 */

/** 한 글자씩 타이핑 — key가 바뀌면 처음부터 재생. done은 완료 여부 */
function useTypewriter(text: string, cps = 48): { out: string; done: boolean } {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 1000 / cps);
    return () => clearInterval(id);
  }, [text, cps]);
  return { out, done: out.length >= text.length };
}

/** 미니 스파크라인 */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const span = data.length - 1 || 1;
  const pts = data.map((v, i) => `${(i / span) * 100},${26 - ((v - min) / range) * 22 - 2}`).join(' ');
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="h-6 w-full">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  const C = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const color = trend === 'down' ? CONSOLE.down : CONSOLE.done;
  return <C className="h-3.5 w-3.5" style={{ color }} />;
}

/** 콘솔 카드 래퍼 */
function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[3px] border', className)} style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
      {children}
    </div>
  );
}

/** 대문자 마이크로 라벨 */
function Micro({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>
      {children}
    </p>
  );
}

/** agent 포커스 — 4요소 */
function AgentFocus({ script }: { script: FocusScript }) {
  const lang = useLang();
  const group = groupById(script.groupId);
  const tick = mutedTick(group?.color ?? CONSOLE.accent);
  const { out: typed, done: typedDone } = useTypewriter(pick(script.thinking, lang));

  return (
    <div className="flex h-full flex-col gap-2.5">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <span className="h-3 w-[2px]" style={{ background: tick }} />
        <p className="text-[12.5px] font-semibold" style={{ color: CONSOLE.text }}>
          {group ? pick(group.label, lang) : ''}
          <span style={{ color: CONSOLE.textMicro }}> › </span>
          {group ? pick(group.subs[script.subIndex], lang) : ''}
        </p>
        <span
          className="ml-auto rounded-[3px] px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide"
          style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}
        >
          {pick({ ko: '실행중', en: 'Working' }, lang)}
        </span>
      </div>

      {/* ① thinking 토큰 스트림 */}
      <Panel className="px-3 py-2.5">
        <p className="min-h-[2.6em] text-[12px] leading-relaxed" style={{ color: CONSOLE.textDim }}>
          {typed}
          {!typedDone && (
            <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse" style={{ background: CONSOLE.accent }} />
          )}
        </p>
      </Panel>

      {/* ② tool call */}
      <Panel className="p-2.5">
        <Micro>
          <Terminal className="h-3 w-3" /> {pick({ ko: '데이터 호출', en: 'Tool calls' }, lang)}
        </Micro>
        <div className="mt-1.5 space-y-1">
          {script.tools.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.32 }}
              className="flex items-center gap-1.5 font-mono text-[11px]"
              style={{ color: CONSOLE.textDim }}
            >
              <span style={{ color: CONSOLE.accent }}>▸</span>
              <span className="truncate">{t}</span>
            </motion.div>
          ))}
        </div>
      </Panel>

      {/* ③ 중간 산출물 */}
      <Panel className="p-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Micro>{pick(script.metric.label, lang)}</Micro>
            <p className="flex items-center gap-1 font-mono text-[17px] font-semibold leading-tight" style={{ color: CONSOLE.text }}>
              {script.metric.value}
              <TrendIcon trend={script.metric.trend} />
            </p>
          </div>
          <div className="w-24">
            <Spark data={script.spark} color={CONSOLE.accent} />
          </div>
        </div>
        <span
          className="mt-1.5 inline-block rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium"
          style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}
        >
          {pick(script.signal, lang)}
        </span>
      </Panel>

      {/* ④ 근거 체인 */}
      <Panel className="mt-auto p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {script.evidence.sources.map((s) => (
            <span
              key={pick(s, 'en')}
              className="rounded-[3px] px-1.5 py-0.5 font-mono text-[10px]"
              style={{ background: 'rgba(255,255,255,0.04)', color: CONSOLE.textDim }}
            >
              {pick(s, lang)}
            </span>
          ))}
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: CONSOLE.done }}>
          <ShieldCheck className="h-3 w-3" />
          {pick(
            { ko: `${script.evidence.crossChecks}개 소스 교차확인`, en: `Cross-checked across ${script.evidence.crossChecks} sources` },
            lang,
          )}
        </p>
      </Panel>
    </div>
  );
}

/** stage 포커스 — Orchestrator 단계 요약 */
function StageFocusView({ stage }: { stage: 'routing' | 'verifying' | 'synthesis' }) {
  const lang = useLang();
  const s = STAGE_FOCUS[stage];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-11 w-11 items-center justify-center rounded-[4px]"
        style={{ background: CONSOLE.accentFill, color: CONSOLE.accent, border: `1px solid ${CONSOLE.accentBorder}` }}
      >
        <Cpu className="h-5 w-5" />
      </motion.div>
      <p className="text-[13.5px] font-semibold" style={{ color: CONSOLE.text }}>{pick(s.title, lang)}</p>
      <p className="max-w-[280px] text-[12px] leading-relaxed" style={{ color: CONSOLE.textDim }}>{pick(s.body, lang)}</p>
    </div>
  );
}

/** idle 안내 */
function IdleView() {
  const lang = useLang();
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-[12px] leading-relaxed" style={{ color: CONSOLE.textMicro }}>
      {pick(
        { ko: '분석 시작을 누르면 각 에이전트의 사고 과정이 여기에 표시됩니다.', en: "Press Run to stream each agent's reasoning here." },
        lang,
      )}
    </div>
  );
}

/** focus 키 문자열 — AnimatePresence 전환 트리거 */
function focusKey(focus: ReturnType<typeof useAgents.getState>['focus']): string {
  if (!focus) return 'idle';
  return focus.kind === 'agent' ? `agent:${focus.groupId}:${focus.subIndex}` : `stage:${focus.stage}`;
}

export function FocusPanel({ className }: { className?: string }) {
  const focus = useAgents((s) => s.focus);
  const lang = useLang();
  const key = focusKey(focus);

  let body: React.ReactNode;
  if (!focus) body = <IdleView />;
  else if (focus.kind === 'stage') body = <StageFocusView stage={focus.stage} />;
  else {
    const script = FOCUS_SCRIPTS.find((s) => s.groupId === focus.groupId && s.subIndex === focus.subIndex);
    body = script ? <AgentFocus script={script} /> : <IdleView />;
  }

  return (
    <div
      className={cn('flex min-h-0 flex-col rounded-[4px] border p-3.5', className)}
      style={{ borderColor: CONSOLE.hair, background: CONSOLE.panel }}
    >
      <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>
        <Cpu className="h-3.5 w-3.5" style={{ color: CONSOLE.accent }} /> {pick({ ko: '에이전트 포커스', en: 'Agent focus' }, lang)}
      </p>
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
