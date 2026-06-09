import { motion } from 'framer-motion';
import { useChart } from './state';
import { PRICE_SERIES, PRICE_MIN, PRICE_MAX, type DrawStep } from './data';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';

/**
 * 가격 차트 + AI 드로잉 오버레이.
 * - 가격은 SVG path(면적+라인)로 직접 그린다(recharts 캔들 회피).
 * - 드로잉 요소는 같은 viewBox 좌표계 위에 framer-motion으로 순차 등장:
 *   motion.line/path의 pathLength 0→1, motion.rect opacity/scale.
 * 좌표계: viewBox 0 0 1000 420. x는 인덱스, y는 가격.
 */

const VW = 1000;
const VH = 420;
const PAD_T = 24;
const PAD_B = 28;

const N = PRICE_SERIES.length;
const span = PRICE_MAX - PRICE_MIN;

function xAt(i: number): number {
  return (i / (N - 1)) * VW;
}
function yAt(price: number): number {
  const t = (price - PRICE_MIN) / span;
  return PAD_T + (1 - t) * (VH - PAD_T - PAD_B);
}

/** 부드러운 가격 라인 path (Catmull-Rom 근사 → 베지어) */
function buildPath(): { line: string; area: string } {
  const pts = PRICE_SERIES.map((p) => ({ x: xAt(p.i), y: yAt(p.price) }));
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  const area = `${line} L ${VW} ${VH} L 0 ${VH} Z`;
  return { line, area };
}

const { line: LINE_PATH, area: AREA_PATH } = buildPath();

/** 드로잉 기하 좌표 (가격 기준) */
const SUPPORT_Y = yAt(196);
const RESIST_Y = yAt(232);
// 추세선: 컵 바닥 저점(idx24) → 손잡이 저점(idx41)
const TREND_X1 = xAt(24);
const TREND_Y1 = yAt(196);
const TREND_X2 = xAt(51);
const TREND_Y2 = yAt(238);
// 유동성 박스: $224~232, idx 32~48
const LIQ_X = xAt(32);
const LIQ_W = xAt(48) - xAt(32);
const LIQ_Y = yAt(232);
const LIQ_H = yAt(224) - yAt(232);
// 패턴 화살표 종점 (마지막 돌파)
const PAT_X = xAt(49);
const PAT_Y = yAt(238);

const drawTransition = { duration: 1.0, ease: [0.22, 1, 0.36, 1] as const };

export function ChartCanvas({ steps }: { steps: DrawStep[] }) {
  const { step, analyzing } = useChart();
  const lang = useLang();
  const on = (s: number) => step >= s;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.015)' }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="cd-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AL.accent} stopOpacity={0.32} />
            <stop offset="55%" stopColor={AL.accent} stopOpacity={0.08} />
            <stop offset="100%" stopColor={AL.accent} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cd-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor={AL.cyan} />
          </linearGradient>
        </defs>

        {/* 그리드 */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={0} x2={VW} y1={PAD_T + t * (VH - PAD_T - PAD_B)} y2={PAD_T + t * (VH - PAD_T - PAD_B)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        ))}

        {/* 가격 면적 + 라인 */}
        <motion.path d={AREA_PATH} fill="url(#cd-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path
          d={LINE_PATH}
          fill="none"
          stroke="url(#cd-line)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />

        {/* 4. 유동성 구간 (먼저 깔리도록 라인 다음 박스) */}
        {on(4) && (
          <motion.rect
            x={LIQ_X}
            y={LIQ_Y}
            width={LIQ_W}
            height={LIQ_H}
            rx={4}
            fill={AL.cyan}
            fillOpacity={0.12}
            stroke={AL.cyan}
            strokeWidth={1}
            strokeOpacity={0.5}
            strokeDasharray="5 4"
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={drawTransition}
            style={{ transformOrigin: `${LIQ_X + LIQ_W / 2}px ${LIQ_Y + LIQ_H / 2}px` }}
          />
        )}

        {/* 1. 지지선 */}
        {on(1) && (
          <motion.line
            x1={0}
            x2={VW}
            y1={SUPPORT_Y}
            y2={SUPPORT_Y}
            stroke={AL.up}
            strokeWidth={1.75}
            strokeDasharray="2 0"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={drawTransition}
          />
        )}

        {/* 2. 저항선 */}
        {on(2) && (
          <motion.line
            x1={0}
            x2={VW}
            y1={RESIST_Y}
            y2={RESIST_Y}
            stroke={AL.down}
            strokeWidth={1.75}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={drawTransition}
          />
        )}

        {/* 3. 추세선 (퍼플 점선) */}
        {on(3) && (
          <motion.line
            x1={TREND_X1}
            y1={TREND_Y1}
            x2={TREND_X2}
            y2={TREND_Y2}
            stroke={AL.accent}
            strokeWidth={2}
            strokeDasharray="8 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={drawTransition}
          />
        )}

        {/* 5. 패턴 화살표 */}
        {on(5) && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <motion.path
              d={`M ${PAT_X - 120} ${PAT_Y - 90} Q ${PAT_X - 50} ${PAT_Y - 95}, ${PAT_X - 8} ${PAT_Y - 16}`}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={2.25}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <path d={`M ${PAT_X - 8} ${PAT_Y - 16} l -13 0 l 9 11 z`} fill="#a78bfa" />
          </motion.g>
        )}
      </svg>

      {/* 라벨 칩 — % 기반 절대 위치 (텍스트는 SVG 밖 div로) */}
      {/* 1 지지 */}
      <ChipAt show={on(1)} leftPct={3} topPct={(SUPPORT_Y / VH) * 100} step={steps[0]} lang={lang} anchor="below" />
      {/* 2 저항 */}
      <ChipAt show={on(2)} leftPct={3} topPct={(RESIST_Y / VH) * 100} step={steps[1]} lang={lang} anchor="above" />
      {/* 3 추세 */}
      <ChipAt show={on(3)} leftPct={(TREND_X1 / VW) * 100} topPct={(TREND_Y1 / VH) * 100} step={steps[2]} lang={lang} anchor="below" />
      {/* 4 유동성 */}
      <ChipAt show={on(4)} leftPct={((LIQ_X + LIQ_W) / VW) * 100} topPct={(LIQ_Y / VH) * 100} step={steps[3]} lang={lang} anchor="above" />
      {/* 5 패턴 */}
      <ChipAt show={on(5)} leftPct={((PAT_X - 130) / VW) * 100} topPct={((PAT_Y - 105) / VH) * 100} step={steps[4]} lang={lang} anchor="pattern" demoId="pattern-anchor" />

      {/* 스캔 라인 (드로잉 중 강조) */}
      {analyzing && step < 5 && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-px"
          style={{ background: `linear-gradient(to bottom, transparent, ${AL.accent}, transparent)`, boxShadow: `0 0 16px 2px ${AL.accentRing}` }}
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  );
}

function ChipAt({
  show,
  leftPct,
  topPct,
  step,
  lang,
  anchor,
  demoId,
}: {
  show: boolean;
  leftPct: number;
  topPct: number;
  step: DrawStep;
  lang: 'ko' | 'en';
  anchor: 'above' | 'below' | 'pattern';
  demoId?: string;
}) {
  if (!show) return null;
  const dy = anchor === 'above' ? '-130%' : anchor === 'below' ? '20%' : '0%';
  const isPattern = anchor === 'pattern';
  return (
    <motion.div
      data-demo-id={demoId}
      className="pointer-events-none absolute"
      style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: `translateY(${dy})` }}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <span
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap backdrop-blur-sm"
        style={{
          color: step.color,
          background: 'rgba(8,9,18,0.78)',
          border: `1px solid ${step.color}55`,
          boxShadow: isPattern ? `0 0 22px -4px ${step.color}` : undefined,
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: step.color }} />
        {pick(step.label, lang)}
      </span>
    </motion.div>
  );
}
