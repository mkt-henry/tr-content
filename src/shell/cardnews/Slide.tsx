import { forwardRef } from 'react';
import type { Lang, Slide as SlideT } from '../../cardnews/types';
import { Chart, TONE } from './charts';

const SIZE = 1080;
const text: React.CSSProperties = { wordBreak: 'keep-all', overflowWrap: 'break-word' };

function Frame({ children, accent, bg }: { children: React.ReactNode; accent: string; bg?: string }) {
  return (
    <div style={{
      width: SIZE, height: SIZE, padding: 80, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden', borderRadius: 0,
      background: bg ?? 'linear-gradient(160deg,#11132a,#0a0b14)',
      border: `1px solid ${accent}38`, color: '#e8e9f2', fontFamily: 'system-ui, sans-serif',
    }}>{children}</div>
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 38, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a78bfa', fontWeight: 700 }}>{children}</div>
);
const Foot = ({ n, total }: { n: number; total: number }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 30, opacity: 0.55 }}>
    <div style={{ display: 'flex', gap: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i === n ? '#7c5cff' : 'rgba(255,255,255,.22)' }} />
      ))}
    </div>
    <span>{n + 1}/{total}</span>
  </div>
);

/** 1080px 고정 슬라이드 */
export const Slide = forwardRef<HTMLDivElement, {
  slide: SlideT; lang: Lang; index: number; total: number; accent: string;
}>(({ slide: s, lang, index, total, accent }, ref) => {
  const headlineGlow = 'radial-gradient(ellipse 90% 60% at 70% -10%,rgba(124,92,255,.28),transparent 60%),linear-gradient(160deg,#11132a,#0a0b14)';
  let body: React.ReactNode;

  switch (s.type) {
    case 'cover':
      body = (<>
        <div style={{ position: 'relative' }}><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h1 style={{ ...text, fontSize: 88, fontWeight: 800, lineHeight: 1.2, margin: '24px 0 0' }}>{s.headline[lang]}</h1></div>
        <div style={{ position: 'relative' }}>
          <span style={{ display: 'inline-block', fontSize: 34, fontWeight: 700, background: 'rgba(124,92,255,.16)', color: '#c4b5fd', padding: '16px 36px', borderRadius: 999 }}>{s.tag[lang]}</span>
          <div style={{ marginTop: 40 }}><Foot n={index} total={total} /></div>
        </div></>);
      break;
    case 'thesis':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 78, fontWeight: 800, lineHeight: 1.26, margin: '24px 0 0' }}>{s.headline[lang]}</h2>
          <p style={{ ...text, fontSize: 48, lineHeight: 1.5, opacity: 0.78, marginTop: 36 }}>{s.body[lang]}</p></div>
        <Foot n={index} total={total} /></>);
      break;
    case 'contrast':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          {s.headline && <h2 style={{ ...text, fontSize: 66, fontWeight: 800, margin: '20px 0 0' }}>{s.headline[lang]}</h2>}
          {[s.left, s.right].map((b, i) => (
            <div key={i} style={{ ...text, marginTop: 32, borderRadius: 36, padding: '40px 44px', fontSize: 44, lineHeight: 1.4,
              background: `${TONE[b.tone]}1a`, border: `2px solid ${TONE[b.tone]}44` }}>
              <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.9, marginBottom: 14, color: TONE[b.tone] }}>{b.label[lang]}</div>
              {b.text[lang]}
            </div>
          ))}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'data':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 66, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          <Chart spec={s.chart} lang={lang} />
          {s.note && <p style={{ ...text, fontSize: 44, lineHeight: 1.5, opacity: 0.78, marginTop: 36 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'context':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 66, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          <Chart spec={{ kind: 'statChips', items: s.stats }} lang={lang} />
          {s.note && <p style={{ ...text, fontSize: 44, lineHeight: 1.5, opacity: 0.78, marginTop: 32 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'action':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 72, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          {s.chart && <Chart spec={s.chart} lang={lang} />}
          {s.note && <p style={{ ...text, fontSize: 44, lineHeight: 1.5, opacity: 0.78, marginTop: 40 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'list':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          {s.headline && <h2 style={{ ...text, fontSize: 60, fontWeight: 800, margin: '20px 0 0' }}>{s.headline[lang]}</h2>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 32 }}>
            {s.items.map((it, i) => (
              <div key={i} style={{ ...text, fontSize: 44, lineHeight: 1.35, background: 'rgba(255,255,255,.06)', borderRadius: 32, padding: '28px 40px' }}>{it[lang]}</div>
            ))}
          </div>
          {s.note && <p style={{ ...text, fontSize: 42, lineHeight: 1.5, opacity: 0.78, marginTop: 32 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'cta':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 72, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          <p style={{ ...text, fontSize: 48, lineHeight: 1.5, opacity: 0.78, marginTop: 36 }}>{s.body[lang]}</p></div>
        <div>{s.url && <span style={{ display: 'inline-block', fontSize: 40, background: 'rgba(255,255,255,.06)', borderRadius: 28, padding: '24px 36px', color: '#a78bfa' }}>{s.url}</span>}
          <div style={{ marginTop: 36 }}><Foot n={index} total={total} /></div></div></>);
      break;
  }

  const bg = s.type === 'cover' || s.type === 'cta' ? headlineGlow : undefined;
  return <div ref={ref}><Frame accent={accent} bg={bg}>{body}</Frame></div>;
});
Slide.displayName = 'Slide';

/** 화면 표시용 — 1080px 슬라이드를 display px로 축소 */
export function ScaledSlide(props: { slide: SlideT; lang: Lang; index: number; total: number; accent: string; display: number }) {
  const { display, ...rest } = props;
  const scale = display / SIZE;
  return (
    <div style={{ width: display, height: display, overflow: 'hidden', borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: SIZE, height: SIZE }}>
        <Slide {...rest} />
      </div>
    </div>
  );
}

export { SIZE as SLIDE_SIZE };
