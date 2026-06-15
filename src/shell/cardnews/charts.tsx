import type { ChartSpec, Lang, Tone } from '../../cardnews/types';

export const TONE: Record<Tone, string> = {
  up: '#34d399',
  down: '#f43f5e',
  gold: '#e3b341',
  cyan: '#22d3ee',
  neutral: '#a78bfa',
};

export function Chart({ spec, lang }: { spec: ChartSpec; lang: Lang }) {
  if (spec.kind === 'divergenceBar') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginTop: 40 }}>
        {spec.rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 44 }}>
            <span style={{ width: 220, opacity: 0.72, flexShrink: 0 }}>{r.name[lang]}</span>
            <div style={{ flex: 1, height: 66, background: 'rgba(255,255,255,.05)', borderRadius: 22, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r.pct}%`, background: TONE[r.tone], borderRadius: 22 }} />
            </div>
            <span style={{ width: 240, textAlign: 'right', fontWeight: 800, color: TONE[r.tone], fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{r.value}</span>
          </div>
        ))}
      </div>
    );
  }
  if (spec.kind === 'areaSpark') {
    const w = 920, h = 320;
    const max = Math.max(...spec.points), min = Math.min(...spec.points);
    const pts = spec.points.map((v, i) => {
      const x = (i / (spec.points.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const color = spec.tone === 'up' ? TONE.up : TONE.down;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200, marginTop: 24 }} preserveAspectRatio="none">
        <polyline points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={color} fillOpacity="0.15" />
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="8" />
      </svg>
    );
  }
  if (spec.kind === 'donut') {
    const total = spec.segments.reduce((a, s) => a + s.weight, 0);
    const C = 2 * Math.PI * 110;
    let offset = 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 48 }}>
        <svg viewBox="0 0 280 280" style={{ width: 280, height: 280 }}>
          {spec.segments.map((s, i) => {
            const len = (s.weight / total) * C;
            const el = (
              <circle key={i} cx="140" cy="140" r="110" fill="none" stroke={TONE[s.tone]} strokeWidth="42"
                strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset} transform="rotate(-90 140 140)" />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 44 }}>
          {spec.segments.map((s, i) => (
            <div key={i}><span style={{ color: TONE[s.tone] }}>●</span> {s.label[lang]}</div>
          ))}
        </div>
      </div>
    );
  }
  // statChips
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 40 }}>
      {spec.items.map((it, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,.05)', borderRadius: 28, padding: '28px 44px' }}>
          <span style={{ fontSize: 42, opacity: 0.72 }}>{it.label[lang]}</span>
          <span style={{ fontSize: 56, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: it.tone ? TONE[it.tone] : '#e8e9f2' }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}
