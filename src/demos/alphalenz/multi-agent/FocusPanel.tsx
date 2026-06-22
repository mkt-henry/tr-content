import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, Cpu } from 'lucide-react';
import { useAgents } from './state';
import { FOCUS_SCRIPTS, STAGE_FOCUS, groupById, type FocusScript } from './data';
import { AL } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/**
 * 포커스(클로즈업) 패널.
 * - state.focus가 agent면 해당 FocusScript의 4요소를 카메라처럼 보여준다:
 *   ① thinking 토큰 스트림(타이핑) ② tool call ③ 미니 산출물 ④ 근거 체인.
 * - focus가 stage면 Orchestrator 단계 요약(분해/검증/합성)을 보여준다.
 */

/** 한 글자씩 타이핑 — key가 바뀌면(=포커스 전환) 처음부터 재생 */
function useTypewriter(text: string, cps = 48): string {
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
  return out;
}

/** 미니 스파크라인 (0~100 정규화, non-scaling stroke) */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 22 - 2}`)
    .join(' ');
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

function TrendIcon({ trend, color }: { trend: 'up' | 'down' | 'flat'; color: string }) {
  const C = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  return <C className="h-3.5 w-3.5" style={{ color }} />;
}

/** agent 포커스 — 4요소 */
function AgentFocus({ script }: { script: FocusScript }) {
  const lang = useLang();
  const group = groupById(script.groupId);
  const color = group?.color ?? AL.accent;
  // focus 키를 thinking 타이핑 재생 트리거로 사용
  const typed = useTypewriter(pick(script.thinking, lang));

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        <p className="text-[13px] font-semibold text-zinc-100">
          {group ? pick(group.label, lang) : ''}
          <span className="text-zinc-500"> › </span>
          {group ? pick(group.subs[script.subIndex], lang) : ''}
        </p>
        <span
          className="ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium"
          style={{ background: `${color}22`, color }}
        >
          {pick({ ko: '분석중', en: 'Working' }, lang)}
        </span>
      </div>

      {/* ① thinking 토큰 스트림 */}
      <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <p className="min-h-[2.6em] text-[12.5px] leading-relaxed text-zinc-300">
          {typed}
          <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse" style={{ background: color }} />
        </p>
      </div>

      {/* ② tool call / 데이터 소스 */}
      <div className="rounded-lg border p-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
          <Terminal className="h-3 w-3" /> {pick({ ko: '데이터 호출', en: 'Tool calls' }, lang)}
        </p>
        <div className="space-y-1">
          {script.tools.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.32 }}
              className="flex items-center gap-1.5 font-mono text-[11.5px] text-zinc-300"
            >
              <span style={{ color }}>▸</span>
              <span className="truncate">{t}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ③ 중간 산출물 */}
      <div className="rounded-lg border p-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{pick(script.metric.label, lang)}</p>
            <p className="flex items-center gap-1 font-mono text-[18px] font-semibold leading-tight text-zinc-100">
              {script.metric.value}
              <TrendIcon trend={script.metric.trend} color={script.metric.trend === 'down' ? AL.down : AL.up} />
            </p>
          </div>
          <div className="w-24">
            <Spark data={script.spark} color={color} />
          </div>
        </div>
        <span
          className="mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10.5px] font-medium"
          style={{ background: `${color}1f`, color }}
        >
          {pick(script.signal, lang)}
        </span>
      </div>

      {/* ④ 근거 체인 */}
      <div className="mt-auto rounded-lg border p-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex flex-wrap items-center gap-1.5">
          {script.evidence.sources.map((s) => (
            <span key={pick(s, 'en')} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-zinc-300">
              {pick(s, lang)}
            </span>
          ))}
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-medium text-emerald-300">
          <ShieldCheck className="h-3 w-3" />
          {pick(
            { ko: `${script.evidence.crossChecks}개 소스 교차확인`, en: `Cross-checked across ${script.evidence.crossChecks} sources` },
            lang,
          )}
        </p>
      </div>
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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: AL.accentSoft, color: AL.accent }}
      >
        <Cpu className="h-6 w-6" />
      </motion.div>
      <p className="text-[14px] font-semibold text-zinc-100">{pick(s.title, lang)}</p>
      <p className="max-w-[280px] text-[12px] leading-relaxed text-zinc-400">{pick(s.body, lang)}</p>
    </div>
  );
}

/** idle 안내 */
function IdleView() {
  const lang = useLang();
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-[12px] leading-relaxed text-zinc-600">
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
      className={cn('flex min-h-0 flex-col rounded-xl border p-3.5', className)}
      style={{ borderColor: AL.border, background: AL.cardBg }}
    >
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        <Cpu className="h-3.5 w-3.5 text-violet-400" /> {pick({ ko: '에이전트 포커스', en: 'Agent focus' }, lang)}
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
