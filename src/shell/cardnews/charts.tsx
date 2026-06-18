import type { ChartSpec, Lang, Tone } from '../../cardnews/types';

/** 채도를 낮춘 리서치 톤 데이터 색 — 의미는 유지, 네온은 배제 */
export const TONE: Record<Tone, string> = {
  up: '#5f9e80',
  down: '#c2554e',
  gold: '#c2a35a',
  cyan: '#5b94a8',
  neutral: '#8f8a7c',
};

const MONO = 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace';
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', 'Nanum Myeongjo', 'Noto Serif KR', Batang, AppleMyungjo, ui-serif, serif";
const PAPER = '#ece7db';
const HAIRLINE = 'rgba(236,231,219,0.14)';

export function Chart({ spec, lang }: { spec: ChartSpec; lang: Lang }) {
  if (spec.kind === 'divergenceBar') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 38 }}>
        {spec.rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span style={{ width: 230, fontFamily: SERIF, fontSize: 34, color: 'rgba(236,231,219,0.82)', flexShrink: 0 }}>{r.name[lang]}</span>
            <div style={{ flex: 1, height: 36, background: 'rgba(236,231,219,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r.pct}%`, background: TONE[r.tone], borderRadius: 2 }} />
            </div>
            <span style={{ width: 210, textAlign: 'right', fontFamily: MONO, fontWeight: 700, fontSize: 34, color: TONE[r.tone], fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{r.value}</span>
          </div>
        ))}
      </div>
    );
  }
  if (spec.kind === 'areaSpark') {
    const w = 920, h = 320;
    const max = Math.max(...spec.points), min = Math.min(...spec.points);
    const denom = (spec.points.length - 1) || 1;
    const pts = spec.points.map((v, i) => {
      const x = (i / denom) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const last = pts[pts.length - 1]?.split(',').map(Number) ?? [w, h];
    const color = spec.tone === 'up' ? TONE.up : TONE.down;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200, marginTop: 28 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-${spec.tone}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.20" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={`url(#spark-${spec.tone})`} />
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r="9" fill={color} />
      </svg>
    );
  }
  if (spec.kind === 'donut') {
    const total = spec.segments.reduce((a, s) => a + s.weight, 0) || 1;
    const C = 2 * Math.PI * 110;
    const lead = spec.segments.reduce((a, b) => (b.weight > a.weight ? b : a), spec.segments[0]);
    let offset = 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 60, marginTop: 42 }}>
        <div style={{ position: 'relative', width: 270, height: 270, flexShrink: 0 }}>
          <svg viewBox="0 0 280 280" style={{ width: 270, height: 270 }}>
            <circle cx="140" cy="140" r="110" fill="none" stroke="rgba(236,231,219,0.06)" strokeWidth="34" />
            {spec.segments.map((s, i) => {
              const len = (s.weight / total) * C;
              const el = (
                <circle key={i} cx="140" cy="140" r="110" fill="none" stroke={TONE[s.tone]} strokeWidth="34"
                  strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset} transform="rotate(-90 140 140)" strokeLinecap="butt" />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 54, fontWeight: 700, color: TONE[lead.tone] }}>{Math.round((lead.weight / total) * 100)}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {spec.segments.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: SERIF, fontSize: 36, color: PAPER }}>
              <span style={{ width: 16, height: 16, background: TONE[s.tone], flexShrink: 0 }} />
              <span>{s.label[lang]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // statChips → 데이터 테이블
  return (
    <div style={{ marginTop: 36, borderTop: `1px solid ${HAIRLINE}` }}>
      {spec.items.map((it, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '24px 2px', borderBottom: `1px solid ${HAIRLINE}` }}>
          <span style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(236,231,219,0.6)' }}>{it.label[lang]}</span>
          <span style={{ fontFamily: MONO, fontSize: 46, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: it.tone ? TONE[it.tone] : PAPER }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}
