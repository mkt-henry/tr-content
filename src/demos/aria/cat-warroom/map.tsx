import { motion } from 'framer-motion';
import { useLang, pick } from '../_shared/i18n';
import { CITIES, EVENT, EXPOSURES, SEVERITY_META } from './data';
import type { Phase } from './state';

/** 단순화된 한반도 윤곽 — 디자인용 근사 path */
const KOREA_PATH =
  'M148,18 L172,26 L196,20 L218,34 L226,58 L218,80 L236,96 L230,120 L250,134 L246,158 L264,174 L258,198 L276,218 L270,242 L284,260 L276,278 L262,288 L246,282 L234,294 L218,288 L202,298 L184,292 L170,300 L156,290 L146,272 L136,250 L128,226 L120,200 L114,174 L108,148 L102,122 L100,96 L110,70 L124,46 L136,30 Z';

const pathD = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

export function WarroomMap({ phase, revealedIds }: { phase: Phase; revealedIds: number[] }) {
  const lang = useLang();
  const active = phase !== 'idle';
  const landfall = EVENT.path[EVENT.path.length - 1];

  return (
    <svg viewBox="0 0 400 480" className="h-full w-full" role="img" aria-label="exposure map">
      {/* 바다 그리드 */}
      <defs>
        <pattern id="sea-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
        </pattern>
        <radialGradient id="impact-fill">
          <stop offset="0%" stopColor="rgba(244,63,94,0.16)" />
          <stop offset="100%" stopColor="rgba(244,63,94,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="480" fill="url(#sea-grid)" />

      {/* 한반도 + 제주 */}
      <path d={KOREA_PATH} fill="#161c26" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <ellipse cx="160" cy="352" rx="16" ry="9" fill="#161c26" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

      {/* 도시 라벨 */}
      {CITIES.map((c, i) => (
        <g key={i}>
          <circle cx={c.pos.x} cy={c.pos.y} r="2" fill="rgba(255,255,255,0.25)" />
          <text x={c.pos.x + 6} y={c.pos.y + 3} fontSize="9" fill="rgba(255,255,255,0.3)">
            {pick(c.name, lang)}
          </text>
        </g>
      ))}

      {active && (
        <>
          {/* 영향권 */}
          <motion.circle
            cx={landfall.x}
            cy={landfall.y}
            r={EVENT.impactRadius}
            fill="url(#impact-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
          />
          <motion.circle
            cx={landfall.x}
            cy={landfall.y}
            r={EVENT.impactRadius}
            fill="none"
            stroke="rgba(244,63,94,0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0.55], scale: 1 }}
            transition={{ duration: 1.6, delay: 1.2 }}
            style={{ transformOrigin: `${landfall.x}px ${landfall.y}px` }}
          />

          {/* 태풍 경로 */}
          <motion.path
            d={pathD(EVENT.path)}
            fill="none"
            stroke="#fb7185"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />

          {/* 태풍 마커 — 경로 끝에서 회전 */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${landfall.x}px ${landfall.y}px` }}
            >
              <circle cx={landfall.x} cy={landfall.y} r="11" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeDasharray="14 9" />
            </motion.g>
            <circle cx={landfall.x} cy={landfall.y} r="4" fill="#fb7185" />
          </motion.g>
        </>
      )}

      {/* 노출 마커 — 점등 순서대로 */}
      {EXPOSURES.filter((e) => revealedIds.includes(e.id)).map((e) => (
        <motion.g key={e.id} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.circle
            cx={e.pos.x}
            cy={e.pos.y}
            r="9"
            fill="none"
            stroke={SEVERITY_META[e.severity].dot}
            strokeWidth="1.5"
            initial={{ opacity: 0.8, scale: 0.5 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
            style={{ transformOrigin: `${e.pos.x}px ${e.pos.y}px` }}
          />
          <circle cx={e.pos.x} cy={e.pos.y} r="4.5" fill={SEVERITY_META[e.severity].dot} stroke="#0c1014" strokeWidth="1.5" />
        </motion.g>
      ))}
    </svg>
  );
}
