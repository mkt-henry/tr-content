import { motion } from 'framer-motion';
import { Check, Cpu } from 'lucide-react';
import { useAgents, type Phase, type WorkerStatus } from './state';
import { GROUPS, SUB_META, mutedTick } from './data';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang, type L } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/**
 * 멀티에이전트 DAG — Palantir그레이드 콘솔.
 * - 톱다운 DAG: Orchestrator → 5 그룹 → 서브 에이전트.
 * - 커넥터는 1px div(직교). 곡선/글로우/입자 없음.
 * - 상태(대기/실행/완료)로만 색 부여, 단일 인디고 액센트.
 */

const ORCH = { x: 50, y: 9 };
const BUS_Y = 22;
const GROUP_Y = 32;
const SUB_Y0 = 49;
const SUB_DY = 14;

/** 그룹 열의 가로 위치(%) — data.x(0~1)를 8~92로 매핑 */
function groupX(x: number): number {
  return 8 + x * 84;
}

/** Orchestrator 단계 서브라벨 */
const ORCH_SUB: Record<Phase, L> = {
  idle: { ko: '대기', en: 'STANDBY' },
  routing: { ko: '라우팅', en: 'ROUTING' },
  working: { ko: '실행 · 16 에이전트', en: 'RUNNING · 16 AGENTS' },
  verifying: { ko: '교차검증', en: 'CROSS-VERIFY' },
  done: { ko: '합성 완료', en: 'SYNTHESIZED' },
};

function statusOf(workers: Record<string, WorkerStatus>, groupId: string, n: number): WorkerStatus {
  let working = 0;
  let done = 0;
  for (let i = 0; i < n; i++) {
    const s = workers[`${groupId}:${i}`];
    if (s === 'working') working++;
    else if (s === 'done') done++;
  }
  if (done === n) return 'done';
  if (working > 0 || done > 0) return 'working';
  return 'idle';
}

/** 1px 수직 커넥터 */
function VLine({ x, y1, y2, active }: { x: number; y1: number; y2: number; active: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y1}%`,
        height: `${y2 - y1}%`,
        width: 1,
        transform: 'translateX(-0.5px)',
        background: active ? CONSOLE.accent : CONSOLE.line,
        opacity: active ? 0.7 : 1,
        transition: 'background-color 0.35s, opacity 0.35s',
      }}
    />
  );
}

/** 1px 수평 커넥터 (pulse=교차검증 점멸) */
function HLine({ x1, x2, y, active, pulse }: { x1: number; x2: number; y: number; active: boolean; pulse?: boolean }) {
  const common = {
    left: `${Math.min(x1, x2)}%`,
    top: `${y}%`,
    width: `${Math.abs(x2 - x1)}%`,
    height: 1,
    transform: 'translateY(-0.5px)',
  } as const;
  if (pulse) {
    return (
      <motion.div
        className="absolute"
        style={{ ...common, background: CONSOLE.accent }}
        initial={{ opacity: 0.15 }}
        animate={{ opacity: [0.15, 0.7, 0.25] }}
        transition={{ duration: 1.3, repeat: Infinity }}
      />
    );
  }
  return (
    <div
      className="absolute"
      style={{
        ...common,
        background: active ? CONSOLE.accent : CONSOLE.line,
        opacity: active ? 0.7 : 1,
        transition: 'background-color 0.35s, opacity 0.35s',
      }}
    />
  );
}

type CardKind = 'orch' | 'group' | 'sub';

interface CardProps {
  x: number;
  y: number;
  kind: CardKind;
  title: string;
  meta?: string;
  status: WorkerStatus;
  tick: string;
  focused?: boolean;
  dimmed?: boolean;
}

function StatusGlyph({ status }: { status: WorkerStatus }) {
  if (status === 'done') return <Check className="h-3 w-3" strokeWidth={2.5} style={{ color: CONSOLE.done }} />;
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ background: status === 'working' ? CONSOLE.accent : '#52525b' }}
    />
  );
}

/** 사각 노드 카드 — 좌측 틱 + 상태 글리프 + 모노 메타 */
function Card({ x, y, kind, title, meta, status, tick, focused, dimmed }: CardProps) {
  const active = status !== 'idle';
  const working = status === 'working';
  const isOrch = kind === 'orch';
  const width = isOrch ? 156 : kind === 'group' ? 120 : 108;
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width,
        zIndex: focused ? 20 : 2,
        borderRadius: 3,
        border: `1px solid ${focused || active ? CONSOLE.accentBorder : CONSOLE.hair}`,
        background: active ? CONSOLE.accentFill : CONSOLE.card,
        boxShadow: focused ? `0 0 0 1px ${CONSOLE.accent}` : 'none',
      }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: dimmed ? 0.45 : 1, scale: focused ? 1.04 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 좌측 그룹 틱 */}
      <span className="absolute left-0 top-0 h-full" style={{ width: 2, background: tick }} />
      {/* 실행중 상단 프로그레스 */}
      {working && (
        <motion.span
          className="absolute left-0 top-0 h-[1.5px]"
          style={{ background: CONSOLE.accent }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
        />
      )}
      <div className="flex flex-col gap-0.5 py-1.5 pl-3 pr-2.5">
        <div className="flex items-center gap-1.5">
          {isOrch ? <Cpu className="h-3 w-3" style={{ color: CONSOLE.accent }} /> : <StatusGlyph status={status} />}
          <span
            className={cn(
              'truncate',
              isOrch ? 'text-[10px] font-semibold uppercase' : kind === 'group' ? 'text-[11px] font-medium' : 'text-[10px]',
            )}
            style={{ color: active || isOrch ? CONSOLE.text : CONSOLE.textDim, letterSpacing: isOrch ? '0.08em' : undefined }}
          >
            {title}
          </span>
          {meta && kind === 'group' && (
            <span className="ml-auto font-mono text-[9px]" style={{ color: CONSOLE.textMicro }}>
              {meta}
            </span>
          )}
        </div>
        {meta && kind !== 'group' && (
          <span className="font-mono text-[8.5px] uppercase tracking-wide" style={{ color: CONSOLE.textMicro }}>
            {meta}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function AgentGraph({ compact = false }: { compact?: boolean }) {
  const { phase, workers, focus } = useAgents();
  const lang = useLang();
  const focusKey: string | null = focus?.kind === 'agent' ? `${focus.groupId}:${focus.subIndex}` : null;
  const running = phase !== 'idle';
  const gx = GROUPS.map((g) => groupX(g.x));
  const busX1 = gx[0];
  const busX2 = gx[gx.length - 1];

  return (
    <div
      className={cn('relative w-full overflow-hidden', compact ? 'h-[300px]' : 'h-full min-h-[360px]')}
      style={{ borderRadius: 4, border: `1px solid ${CONSOLE.hair}`, background: CONSOLE.panel }}
    >
      {/* 커넥터: orch drop + bus */}
      <VLine x={ORCH.x} y1={ORCH.y + 4} y2={BUS_Y} active={running} />
      <HLine x1={busX1} x2={busX2} y={BUS_Y} active={running} />

      {/* 커넥터: 그룹 드롭 + 스파인 */}
      {GROUPS.map((g, gi) => {
        const gStatus = statusOf(workers, g.id, g.subs.length);
        const lastSubY = SUB_Y0 + (g.subs.length - 1) * SUB_DY;
        return (
          <div key={`conn-${g.id}`}>
            <VLine x={gx[gi]} y1={BUS_Y} y2={GROUP_Y - 4} active={running} />
            <VLine x={gx[gi]} y1={GROUP_Y + 4} y2={lastSubY} active={gStatus !== 'idle'} />
          </div>
        );
      })}

      {/* 교차검증 헤어라인 (인접 그룹 열 사이) */}
      {(phase === 'verifying' || phase === 'done') &&
        GROUPS.slice(0, -1).map((g, gi) => (
          <HLine key={`cv-${g.id}`} x1={gx[gi]} x2={gx[gi + 1]} y={SUB_Y0 - 7} active pulse={phase === 'verifying'} />
        ))}

      {/* Orchestrator */}
      <Card
        x={ORCH.x}
        y={ORCH.y}
        kind="orch"
        title={pick({ ko: '오케스트레이터', en: 'ORCHESTRATOR' }, lang)}
        meta={pick(ORCH_SUB[phase], lang)}
        status={phase === 'idle' ? 'idle' : phase === 'done' ? 'done' : 'working'}
        tick={CONSOLE.accent}
        dimmed={focusKey !== null}
      />

      {/* 그룹 + 서브 카드 */}
      {GROUPS.map((g, gi) => {
        const gStatus = statusOf(workers, g.id, g.subs.length);
        const dc = g.subs.reduce((n, _, i) => (workers[`${g.id}:${i}`] === 'done' ? n + 1 : n), 0);
        const tick = mutedTick(g.color);
        return (
          <div key={g.id}>
            <Card
              x={gx[gi]}
              y={GROUP_Y}
              kind="group"
              title={pick(g.label, lang)}
              meta={`${dc}/${g.subs.length}`}
              status={gStatus}
              tick={tick}
              dimmed={focusKey !== null}
            />
            {g.subs.map((sub, i) => {
              const st = workers[`${g.id}:${i}`] ?? 'idle';
              const lat = SUB_META[`${g.id}:${i}`]?.latencyMs;
              const meta =
                st === 'done' && lat
                  ? `lat ${(lat / 1000).toFixed(1)}s`
                  : st === 'working'
                    ? pick({ ko: '실행중', en: 'running' }, lang)
                    : '—';
              return (
                <Card
                  key={i}
                  x={gx[gi]}
                  y={SUB_Y0 + i * SUB_DY}
                  kind="sub"
                  title={pick(sub, lang)}
                  meta={meta}
                  status={st}
                  tick={tick}
                  focused={focusKey === `${g.id}:${i}`}
                  dimmed={focusKey !== null && focusKey !== `${g.id}:${i}`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
