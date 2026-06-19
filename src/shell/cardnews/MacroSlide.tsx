import { forwardRef } from 'react';
import type { MacroSlide as MacroSlideT, MacroTone, MacroViz, Rich } from '../../cardnews/types';

/* AlphaLenz Macro 핀테크 테마 — claude.ai/design 핸드오프(.dc.html) 충실 재현. 세로 1080×1350 */
export const MACRO_W = 1080;
export const MACRO_H = 1350;
const SANS = "'Space Grotesk', -apple-system, 'Segoe UI', sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace";
const MINT = '#4FD1A5';
const MTONE: Record<MacroTone, string> = { pos: '#46C98B', neg: '#EF5F6B', warn: '#E0A458', mint: '#4FD1A5' };

/** 인라인 강조 리치 텍스트 */
function R({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string'
          ? p
          : <b key={i} style={{ color: p.tone === 'white' || !p.tone ? '#fff' : MTONE[p.tone], fontWeight: p.tone && p.tone !== 'white' ? 600 : 700 }}>{p.t}</b>,
      )}
    </>
  );
}

const Brand = () => (
  <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: '0.04em' }}>AlphaLenz<span style={{ color: '#6A727C', fontWeight: 400 }}> Macro</span></div>
);

const SectionHead = ({ idx }: { idx: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
    <span style={{ fontFamily: MONO, fontSize: 17, color: MINT, letterSpacing: '0.14em' }}>{idx}</span>
    <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.09)' }} />
  </div>
);

const Dots = ({ n, max, size }: { n: number; max: number; size: number }) => (
  <span style={{ display: 'flex', gap: size >= 14 ? 7 : 5 }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} style={{ width: size, height: size, borderRadius: '50%', background: i < n ? MINT : '#2A3038' }} />
    ))}
  </span>
);

const h2: React.CSSProperties = { fontSize: 62, lineHeight: 1.0, fontWeight: 700, letterSpacing: '-0.025em', margin: 0, whiteSpace: 'pre-line' };

function Viz({ viz }: { viz: MacroViz }) {
  if (viz.kind === 'bars') {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 30 }}>
        {viz.heights.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: i === viz.heights.length - 1 ? MTONE[viz.tone] : '#3A4049', borderRadius: 2 }} />
        ))}
      </div>
    );
  }
  const from = viz.from ?? 0;
  return (
    <div style={{ height: 7, borderRadius: 4, background: '#222831', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: `${from}%`, top: 0, bottom: 0, width: `${viz.pct}%`, background: MTONE[viz.tone], borderRadius: 4 }} />
      {viz.marker === 'center' && <div style={{ position: 'absolute', left: '50%', top: -3, bottom: -3, width: 2, background: '#6A727C' }} />}
      {viz.marker === 'end' && <div style={{ position: 'absolute', left: '100%', top: -3, bottom: -3, width: 2, background: '#EF5F6B', transform: 'translateX(-2px)' }} />}
    </div>
  );
}

const base: React.CSSProperties = {
  width: MACRO_W, height: MACRO_H, background: '#0A0D11', color: '#ECEEF1', fontFamily: SANS,
  padding: '84px 76px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
};

export const MacroSlide = forwardRef<HTMLDivElement, { slide: MacroSlideT; meta?: string }>(({ slide: s, meta }, ref) => {
  let inner: React.ReactNode;

  switch (s.type) {
    case 'm-cover':
      inner = (
        <div style={{ ...base, justifyContent: 'space-between' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 80% at 100% 0%, rgba(79,209,165,0.10), transparent 55%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <Brand />
            <div style={{ fontFamily: MONO, fontSize: 18, color: '#7A828C', letterSpacing: '0.04em' }}>{meta}</div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 16px', border: `1px solid rgba(79,209,165,0.35)`, borderRadius: 100, fontFamily: MONO, fontSize: 16, letterSpacing: '0.12em', color: MINT, marginBottom: 34 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: MINT, display: 'inline-block' }} />{s.kicker}
            </div>
            <h1 style={{ fontSize: 118, lineHeight: 0.94, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, whiteSpace: 'pre-line' }}>{s.title}</h1>
            <p style={{ fontSize: 31, lineHeight: 1.42, color: '#A2AAB4', maxWidth: 580, margin: '34px 0 0', fontWeight: 400 }}>{s.subtitle}</p>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {s.signals.map((sig, i) => (
                <div key={i} style={{ flex: 1, padding: '20px 24px', borderRadius: 14, background: '#12161C', border: `1px solid ${MTONE[sig.tone]}47`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 15, color: '#7A828C', letterSpacing: '0.1em' }}>{sig.side}</div>
                    <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.01em' }}>{sig.ticker}</div>
                  </div>
                  <div style={{ fontSize: 30, color: MTONE[sig.tone] }}>{sig.tone === 'neg' ? '↓' : '↑'}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, color: '#7A828C', letterSpacing: '0.08em' }}>CONVICTION</span>
                <Dots n={s.conviction} max={s.max} size={11} />
                <span style={{ fontFamily: MONO, fontSize: 16, color: '#ECEEF1', letterSpacing: '0.08em' }}>{s.convLabel}</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 16, color: '#7A828C', letterSpacing: '0.08em' }}>REGIME · <span style={{ color: '#E0A458' }}>{s.regime}</span></div>
            </div>
          </div>
        </div>
      );
      break;

    case 'm-call':
      inner = (
        <div style={base}>
          <SectionHead idx={s.idx} />
          <h2 style={{ ...h2, margin: '0 0 18px' }}>{s.title}</h2>
          <p style={{ fontSize: 28, lineHeight: 1.5, color: '#A2AAB4', margin: '0 0 48px', maxWidth: 620 }}>{s.subtitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, flex: 1 }}>
            {s.cards.map((c, i) => (
              <div key={i} style={{ padding: '38px 40px', borderRadius: 18, background: '#12161C', border: `1px solid ${MTONE[c.tone]}4d`, display: 'flex', alignItems: 'center', gap: 32 }}>
                <div style={{ width: 84, height: 84, borderRadius: 16, background: `${MTONE[c.tone]}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: MTONE[c.tone] }}>{c.arrow}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: 17, color: MTONE[c.tone], letterSpacing: '0.12em', marginBottom: 8 }}>{c.tag}</div>
                  <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.01em' }}>{c.headline}</div>
                  <div style={{ fontSize: 23, color: '#8A929B', marginTop: 6 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 26, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily: MONO, fontSize: 18, color: '#7A828C', letterSpacing: '0.1em' }}>CONVICTION</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Dots n={s.conviction} max={s.max} size={14} />
              <span style={{ fontSize: 26, fontWeight: 600 }}>{s.convText}</span>
            </div>
          </div>
        </div>
      );
      break;

    case 'm-narrative':
      inner = (
        <div style={base}>
          <SectionHead idx={s.idx} />
          <h2 style={{ ...h2, margin: '0 0 44px' }}>{s.title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
            <div style={{ padding: '34px 36px', borderRadius: 18, background: '#101319', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontFamily: MONO, fontSize: 16, color: '#E0A458', letterSpacing: '0.14em', marginBottom: 18 }}>▲ THE MARKET NARRATIVE</div>
              <p style={{ fontSize: 27, lineHeight: 1.46, color: '#D4D9DF', margin: 0 }}><R parts={s.narrative} /></p>
            </div>
            <div style={{ textAlign: 'center', fontSize: 30, color: '#5C646E', fontFamily: MONO, margin: '-6px 0' }}>↕</div>
            <div style={{ padding: '34px 36px', borderRadius: 18, background: '#12161C', border: '1px solid rgba(239,95,107,0.30)' }}>
              <div style={{ fontFamily: MONO, fontSize: 16, color: '#EF5F6B', letterSpacing: '0.14em', marginBottom: 18 }}>▼ THE MACRO REALITY</div>
              <p style={{ fontSize: 27, lineHeight: 1.46, color: '#D4D9DF', margin: 0 }}><R parts={s.reality} /></p>
            </div>
          </div>
          <div style={{ marginTop: 34, padding: '26px 32px', borderRadius: 14, background: 'linear-gradient(90deg, rgba(79,209,165,0.12), rgba(79,209,165,0.02))', borderLeft: `3px solid ${MINT}` }}>
            <p style={{ fontSize: 25, lineHeight: 1.4, margin: 0, color: '#ECEEF1' }}><R parts={s.verdict} /></p>
          </div>
        </div>
      );
      break;

    case 'm-data':
      inner = (
        <div style={base}>
          <SectionHead idx={s.idx} />
          <h2 style={{ ...h2, margin: '0 0 12px' }}>{s.title}</h2>
          <p style={{ fontSize: 24, color: '#8A929B', margin: '0 0 38px', fontFamily: MONO }}>{s.source}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, flex: 1 }}>
            {s.metrics.map((m, i) => (
              <div key={i} style={{ padding: '26px 28px', borderRadius: 16, background: '#12161C', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: MONO, fontSize: 16, color: '#8A929B', letterSpacing: '0.06em' }}>{m.code}</span>
                  <span style={{ fontSize: 19, color: MTONE[m.statusTone], fontFamily: MONO }}>{m.status}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 52, fontWeight: 600, lineHeight: 1, margin: '14px 0' }}>{m.value}</div>
                <Viz viz={m.viz} />
                <div style={{ fontSize: 18, color: '#7A828C', marginTop: 12 }}>{m.caption}</div>
              </div>
            ))}
          </div>
        </div>
      );
      break;

    case 'm-tensions':
      inner = (
        <div style={base}>
          <SectionHead idx={s.idx} />
          <h2 style={{ ...h2, margin: '0 0 38px' }}>{s.title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
            {s.items.map((it, i) => (
              <div key={i} style={{ padding: '30px 32px', borderRadius: 16, background: '#12161C', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600, color: '#2F3742', lineHeight: 0.9 }}>{it.n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 25, lineHeight: 1.4, marginBottom: 14 }}><R parts={it.text} /></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {it.tags.map((t, j) => (
                        <span key={j} style={{ fontFamily: MONO, fontSize: 15, color: '#9099A3', padding: '4px 11px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      break;

    case 'm-plan':
      inner = (
        <div style={base}>
          <SectionHead idx={s.idx} />
          <h2 style={{ ...h2, margin: '0 0 38px' }}>{s.title}</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
            <div style={{ flex: 1, padding: '28px 30px', borderRadius: 16, background: '#12161C', border: '1px solid rgba(70,201,139,0.28)' }}>
              <div style={{ fontFamily: MONO, fontSize: 16, color: '#46C98B', letterSpacing: '0.12em', marginBottom: 12 }}>ACTION</div>
              <div style={{ fontSize: 27, lineHeight: 1.35, fontWeight: 500 }}>{s.action}</div>
            </div>
            <div style={{ flex: 1, padding: '28px 30px', borderRadius: 16, background: '#12161C', border: '1px solid rgba(239,95,107,0.28)' }}>
              <div style={{ fontFamily: MONO, fontSize: 16, color: '#EF5F6B', letterSpacing: '0.12em', marginBottom: 12 }}>INVALIDATION</div>
              <div style={{ fontSize: 27, lineHeight: 1.35, fontWeight: 500 }}>{s.invalidation}</div>
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: '#8A929B', letterSpacing: '0.12em', margin: '22px 0 16px' }}>RISK FACTORS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {s.risks.map((r, i) => (
              <div key={i} style={{ padding: '24px 28px', borderRadius: 14, background: '#101319', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: MONO, fontSize: 15, color: '#E0A458', padding: '4px 10px', border: '1px solid rgba(224,164,88,0.35)', borderRadius: 6, whiteSpace: 'nowrap' }}>{r.tag}</span>
                <span style={{ fontSize: 23, lineHeight: 1.4, color: '#C7CDD4' }}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      );
      break;

    case 'm-cta':
      inner = (
        <div style={{ ...base, justifyContent: 'space-between' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(110% 70% at 0% 100%, rgba(79,209,165,0.10), transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <SectionHead idx={s.idx} />
            <h2 style={{ ...h2, fontSize: 58, lineHeight: 1.02, margin: '0 0 14px' }}>{s.title}</h2>
            <p style={{ fontSize: 25, color: '#A2AAB4', margin: '0 0 34px', maxWidth: 560 }}>{s.subtitle}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '30px 34px', borderRadius: 18, background: '#12161C', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ textAlign: 'center', paddingRight: 26, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontFamily: MONO, fontSize: 60, fontWeight: 600, color: MINT, lineHeight: 1 }}>{s.score}</div>
                <div style={{ fontSize: 16, color: '#7A828C', fontFamily: MONO, marginTop: 6 }}>OVERALL</div>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 28px' }}>
                {s.breakdown.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 19, color: '#9099A3' }}>{b.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: b.tone ? MTONE[b.tone] : '#ECEEF1' }}>{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ padding: '40px 44px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(79,209,165,0.16), rgba(79,209,165,0.03))', border: '1px solid rgba(79,209,165,0.30)' }}>
              <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.2, marginBottom: 14, whiteSpace: 'pre-line' }}>{s.ctaTitle}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 25, color: MINT, letterSpacing: '0.02em' }}>{s.url} <span style={{ fontSize: 22 }}>→</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 }}>
              <Brand />
              <div style={{ fontFamily: MONO, fontSize: 15, color: '#5C646E', maxWidth: 340, textAlign: 'right', lineHeight: 1.4 }}>{s.disclaimer}</div>
            </div>
          </div>
        </div>
      );
      break;

    case 'm-twitter': {
      const tw: React.CSSProperties = {
        width: 1920, height: 1080, background: '#0A0D11', color: '#ECEEF1', fontFamily: SANS,
        boxSizing: 'border-box', position: 'relative', overflow: 'hidden', display: 'flex',
      };
      inner = (
        <div style={tw}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(90% 120% at 100% 0%, rgba(79,209,165,0.10), transparent 55%)', pointerEvents: 'none' }} />

          {/* 좌측 — 히어로 + 콜 */}
          <div style={{ width: '53%', padding: '76px 64px 64px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Brand />
              <div style={{ fontFamily: MONO, fontSize: 17, color: '#7A828C', letterSpacing: '0.04em' }}>{meta}</div>
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 15px', border: '1px solid rgba(79,209,165,0.35)', borderRadius: 100, fontFamily: MONO, fontSize: 15, letterSpacing: '0.12em', color: MINT, marginBottom: 28 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: MINT, display: 'inline-block' }} />{s.kicker}
              </div>
              <h1 style={{ fontSize: 92, lineHeight: 0.96, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, whiteSpace: 'pre-line' }}>{s.title}</h1>
              <p style={{ fontSize: 27, lineHeight: 1.42, color: '#A2AAB4', maxWidth: 620, margin: '28px 0 0', fontWeight: 400 }}>{s.subtitle}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {s.signals.map((sig, i) => (
                  <div key={i} style={{ flex: 1, padding: '20px 24px', borderRadius: 14, background: '#12161C', border: `1px solid ${MTONE[sig.tone]}47`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 15, color: '#7A828C', letterSpacing: '0.1em' }}>{sig.side}</div>
                      <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.01em' }}>{sig.ticker}</div>
                    </div>
                    <div style={{ fontSize: 32, color: MTONE[sig.tone] }}>{sig.tone === 'neg' ? '↓' : '↑'}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ fontFamily: MONO, fontSize: 16, color: '#7A828C', letterSpacing: '0.08em' }}>CONVICTION</span>
                  <Dots n={s.conviction} max={s.max} size={11} />
                  <span style={{ fontFamily: MONO, fontSize: 16, color: '#ECEEF1', letterSpacing: '0.08em' }}>{s.convLabel}</span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 16, color: '#7A828C', letterSpacing: '0.08em' }}>REGIME · <span style={{ color: '#E0A458' }}>{s.regime}</span></div>
              </div>
            </div>
          </div>

          {/* 우측 — 데이터 + Verdict + CTA */}
          <div style={{ flex: 1, padding: '76px 80px 64px 64px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ fontFamily: MONO, fontSize: 16, color: '#EF5F6B', letterSpacing: '0.14em', marginBottom: 24 }}>▼ THE MACRO REALITY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, flex: 1 }}>
              {s.metrics.map((m, i) => (
                <div key={i} style={{ padding: '26px 28px', borderRadius: 16, background: '#12161C', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: MONO, fontSize: 16, color: '#8A929B', letterSpacing: '0.06em' }}>{m.code}</span>
                    <span style={{ fontSize: 18, color: MTONE[m.statusTone], fontFamily: MONO }}>{m.status}</span>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 50, fontWeight: 600, lineHeight: 1, margin: '12px 0' }}>{m.value}</div>
                  <Viz viz={m.viz} />
                  <div style={{ fontSize: 18, color: '#7A828C', marginTop: 12 }}>{m.caption}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22, padding: '22px 28px', borderRadius: 14, background: 'linear-gradient(90deg, rgba(79,209,165,0.12), rgba(79,209,165,0.02))', borderLeft: `3px solid ${MINT}` }}>
              <p style={{ fontSize: 23, lineHeight: 1.4, margin: 0, color: '#ECEEF1' }}><R parts={s.verdict} /></p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 22, color: MINT, letterSpacing: '0.02em' }}>{s.url} <span style={{ fontSize: 20 }}>→</span></div>
              <div style={{ fontFamily: MONO, fontSize: 14, color: '#5C646E', maxWidth: 360, textAlign: 'right', lineHeight: 1.4 }}>{s.disclaimer}</div>
            </div>
          </div>
        </div>
      );
      break;
    }
  }

  return <div ref={ref}>{inner}</div>;
});
MacroSlide.displayName = 'MacroSlide';
