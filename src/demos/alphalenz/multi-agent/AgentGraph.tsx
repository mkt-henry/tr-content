import { motion } from 'framer-motion';
import { Check, Loader2, Cpu } from 'lucide-react';
import { useAgents, type Phase, type WorkerStatus } from './state';
import { GROUPS, ORCHESTRATOR_COLOR, STR } from './data';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/**
 * 노드 그래프.
 * - 좌표계는 0~100 정규화 → SVG/절대배치 div 모두 % 로 환산해 동일 좌표 공유.
 * - 엣지는 SVG path(곡선)로 그리고 framer-motion pathLength 펄스 + 흐르는 dash.
 * - 노드는 그래프 위에 절대배치 div (퍼플 Orchestrator / 그룹색 워커).
 */

// Orchestrator 위치 (정규화 좌표, 그래프 영역 0~100 기준)
const ORCH = { x: 50, y: 11 };
// 워커 그룹 노드 y (서브 노드는 그 아래)
const GROUP_Y = 42;
const SUB_Y0 = 64; // 첫 서브 노드 y
const SUB_DY = 12; // 서브 노드 간 간격

/** 그룹 노드의 정규화 x — data.x(0~1)를 8~92 범위로 매핑 */
function groupX(x: number): number {
  return 8 + x * 84;
}

interface EdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  active: boolean;
  flow: boolean;
  delay?: number;
}

/** 부드러운 베지어 엣지 + 펄스/흐름 애니메이션 */
function Edge({ x1, y1, x2, y2, color, active, flow, delay = 0 }: EdgeProps) {
  const my = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
  return (
    <g>
      {/* 베이스 라인 */}
      <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.4} />
      {/* 활성 라인 — 그려지는 펄스 */}
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={active ? 0.7 : 0}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={active ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.6, delay, ease: 'easeInOut' }}
      />
      {/* 데이터 흐름 dash */}
      {flow && (
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={0.9}
          strokeLinecap="round"
          strokeDasharray="2 6"
          initial={{ strokeDashoffset: 0, opacity: 0 }}
          animate={{ strokeDashoffset: [-0, -16], opacity: 0.9 }}
          transition={{ strokeDashoffset: { duration: 1, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.3 } }}
        />
      )}
    </g>
  );
}

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

/** 그래프 영역에 표시할 phase별 엣지 활성 규칙 */
function edgesActive(phase: Phase): { route: boolean; flow: boolean } {
  return {
    route: phase === 'routing' || phase === 'working' || phase === 'verifying' || phase === 'done',
    flow: phase === 'routing' || phase === 'working',
  };
}

export function AgentGraph({ compact = false }: { compact?: boolean }) {
  const { phase, workers } = useAgents();
  const lang = useLang();
  const { route, flow } = edgesActive(phase);

  return (
    <div className={cn('relative w-full overflow-hidden rounded-xl border', compact ? 'h-[300px]' : 'h-full min-h-[360px]')}
      style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      {/* 엣지 레이어 */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {/* Orchestrator → 각 그룹 */}
        {GROUPS.map((g, gi) => (
          <Edge
            key={`og-${g.id}`}
            x1={ORCH.x}
            y1={ORCH.y + 6}
            x2={groupX(g.x)}
            y2={GROUP_Y - 5}
            color={g.color}
            active={route}
            flow={flow}
            delay={gi * 0.08}
          />
        ))}
        {/* 그룹 → 서브 노드 */}
        {GROUPS.map((g) =>
          g.subs.map((_, i) => (
            <Edge
              key={`gs-${g.id}-${i}`}
              x1={groupX(g.x)}
              y1={GROUP_Y + 4}
              x2={groupX(g.x)}
              y2={SUB_Y0 + i * SUB_DY}
              color={g.color}
              active={phase === 'working' || phase === 'verifying' || phase === 'done'}
              flow={phase === 'working'}
              delay={i * 0.05}
            />
          )),
        )}
        {/* 크로스 검증 — 인접 그룹 서브노드 간 가로 연결 (verifying/done) */}
        {(phase === 'verifying' || phase === 'done') &&
          GROUPS.slice(0, -1).map((g, gi) => (
            <motion.line
              key={`cross-${g.id}`}
              x1={groupX(g.x)}
              y1={SUB_Y0}
              x2={groupX(GROUPS[gi + 1].x)}
              y2={SUB_Y0}
              stroke={ORCHESTRATOR_COLOR}
              strokeWidth={0.5}
              strokeDasharray="1.5 2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.8, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: gi * 0.12 }}
            />
          ))}
      </svg>

      {/* Orchestrator 노드 */}
      <Node
        x={ORCH.x}
        y={ORCH.y}
        color={ORCHESTRATOR_COLOR}
        label={pick(STR.orchestrator, lang)}
        status={phase === 'idle' ? 'idle' : phase === 'done' ? 'done' : 'working'}
        big
        icon={<Cpu className="h-3.5 w-3.5" />}
      />

      {/* 워커 그룹 + 서브 노드 */}
      {GROUPS.map((g) => {
        const gStatus = statusOf(workers, g.id, g.subs.length);
        return (
          <div key={g.id}>
            <Node x={groupX(g.x)} y={GROUP_Y} color={g.color} label={pick(g.label, lang)} status={gStatus} />
            {g.subs.map((sub, i) => (
              <Node
                key={i}
                x={groupX(g.x)}
                y={SUB_Y0 + i * SUB_DY}
                color={g.color}
                label={pick(sub, lang)}
                status={workers[`${g.id}:${i}`] ?? 'idle'}
                small
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

interface NodeProps {
  x: number;
  y: number;
  color: string;
  label: string;
  status: WorkerStatus;
  big?: boolean;
  small?: boolean;
  icon?: React.ReactNode;
}

/** 절대배치 노드 — % 좌표는 SVG viewBox(0~100)와 동일 좌표계 */
function Node({ x, y, color, label, status, big, small, icon }: NodeProps) {
  const active = status !== 'idle';
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={cn(
          'flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium backdrop-blur-sm transition-all duration-300',
          big ? 'px-3 py-1.5 text-[12px]' : small ? 'px-2 py-0.5 text-[9.5px]' : 'px-2.5 py-1 text-[10.5px]',
        )}
        style={{
          borderColor: active ? color : 'rgba(255,255,255,0.12)',
          background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
          color: active ? '#f4f4f5' : '#a1a1aa',
          boxShadow: active ? `0 0 16px -4px ${color}` : 'none',
        }}
      >
        {/* 상태 인디케이터 */}
        {icon ?? (
          <span className="flex h-3 w-3 items-center justify-center">
            {status === 'working' && <Loader2 className="h-3 w-3 animate-spin" style={{ color }} />}
            {status === 'done' && <Check className="h-3 w-3" style={{ color }} />}
            {status === 'idle' && <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />}
          </span>
        )}
        <span className="truncate">{label}</span>
      </div>
    </motion.div>
  );
}
