import { forwardRef } from 'react';
import type { Lang, Slide as SlideT } from '../../cardnews/types';
import { Chart, TONE } from './charts';

const SIZE = 1080;
const PAD = 84;
/** 시스템 상존 세리프 — 리서치 노트의 권위. PNG 내보내기(폰트 미임베드)에서도 일관 렌더 */
/** 라틴=팔라티노/조지아, 한글=명조(나눔명조→바탕/애플명조)로 폴백 — 모두 시스템 상존 */
const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, 'Times New Roman', 'Nanum Myeongjo', 'Noto Serif KR', Batang, AppleMyungjo, ui-serif, serif";
const MONO = 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace';
const PAPER = '#ece7db';
const DIM = 'rgba(236,231,219,0.70)';
const FAINT = 'rgba(236,231,219,0.42)';
const HAIRLINE = 'rgba(236,231,219,0.14)';
const text: React.CSSProperties = { wordBreak: 'keep-all', overflowWrap: 'break-word' };
const pad2 = (n: number) => String(n).padStart(2, '0');

/** 인쇄된 리서치 노트처럼 — 네임플레이트 / 본문 / 출처 푸터 */
function Frame({ children, accent, brand, meta, source, n, total }: {
  children: React.ReactNode; accent: string; brand: string; meta: string;
  source?: string; n: number; total: number;
}) {
  return (
    <div style={{
      width: SIZE, height: SIZE, padding: PAD, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', borderRadius: 0,
      background: 'linear-gradient(180deg,#0e1118 0%,#0a0c11 100%)',
      border: '1px solid rgba(236,231,219,0.10)', color: PAPER, fontFamily: SERIF,
    }}>
      {/* 네임플레이트 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 20, borderBottom: `1px solid ${HAIRLINE}` }}>
        <span style={{ fontFamily: MONO, fontSize: 23, letterSpacing: '0.24em', fontWeight: 700, color: '#d8d2c4' }}>
          {brand.toUpperCase()} <span style={{ color: accent }}>RESEARCH</span>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 21, letterSpacing: '0.12em', color: FAINT }}>{meta}</span>
      </div>

      {/* 본문 — 세로 중앙 */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '44px 0' }}>
        {children}
      </div>

      {/* 출처 푸터 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 20, borderTop: `1px solid ${HAIRLINE}` }}>
        <span style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.1em', color: FAINT }}>SOURCE · {source ?? brand.toLowerCase()}</span>
        <span style={{ fontFamily: MONO, fontSize: 21, letterSpacing: '0.08em', color: DIM, fontWeight: 600 }}>{pad2(n + 1)} / {pad2(total)}</span>
      </div>
    </div>
  );
}

/** 섹션 라벨 — 골드 틱 + 모노 스몰캡스 */
const Eyebrow = ({ children, accent }: { children: React.ReactNode; accent: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
    <span style={{ width: 22, height: 2, background: accent }} />
    <span style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, fontWeight: 600 }}>{children}</span>
  </div>
);

const head: React.CSSProperties = { ...text, fontFamily: SERIF, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.16, margin: 0, color: PAPER };
const prose: React.CSSProperties = { ...text, fontFamily: SERIF, fontWeight: 400, lineHeight: 1.5, color: DIM };

/** 1080px 고정 슬라이드 */
export const Slide = forwardRef<HTMLDivElement, {
  slide: SlideT; lang: Lang; index: number; total: number; accent: string;
  brand?: string; meta?: string; source?: string;
}>(({ slide: s, lang, index, total, accent, brand = 'AlphaLenz', meta = '', source }, ref) => {
  let body: React.ReactNode;

  switch (s.type) {
    case 'cover':
      body = (
        <div>
          <span style={{ display: 'block', width: 54, height: 2, background: accent, marginBottom: 36 }} />
          <h1 style={{ ...head, fontSize: 66, lineHeight: 1.14 }}>{s.headline[lang]}</h1>
          {s.chart && <div style={{ marginTop: 40 }}><Chart spec={s.chart} lang={lang} /></div>}
          <div style={{ marginTop: 44, paddingTop: 22, borderTop: `1px solid ${HAIRLINE}`, fontFamily: MONO, fontSize: 24, letterSpacing: '0.08em', color: accent }}>{s.tag[lang]}</div>
        </div>
      );
      break;
    case 'thesis':
      body = (<>
        <Eyebrow accent={accent}>{s.eyebrow[lang]}</Eyebrow>
        <h2 style={{ ...head, fontSize: 56 }}>{s.headline[lang]}</h2>
        <p style={{ ...prose, fontSize: 36, marginTop: 30 }}>{s.body[lang]}</p>
      </>);
      break;
    case 'contrast':
      body = (<>
        <Eyebrow accent={accent}>{s.eyebrow[lang]}</Eyebrow>
        {s.headline && <h2 style={{ ...head, fontSize: 48, marginBottom: 6 }}>{s.headline[lang]}</h2>}
        {[s.left, s.right].map((b, i) => (
          <div key={i} style={{ marginTop: 28, paddingLeft: 28, borderLeft: `3px solid ${TONE[b.tone]}` }}>
            <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12, color: TONE[b.tone] }}>{b.label[lang]}</div>
            <div style={{ ...text, fontFamily: SERIF, fontSize: 35, lineHeight: 1.4, color: PAPER }}>{b.text[lang]}</div>
          </div>
        ))}
      </>);
      break;
    case 'data':
      body = (<>
        <Eyebrow accent={accent}>{s.eyebrow[lang]}</Eyebrow>
        <h2 style={{ ...head, fontSize: 50 }}>{s.headline[lang]}</h2>
        <Chart spec={s.chart} lang={lang} />
        {s.note && <p style={{ ...prose, fontSize: 32, marginTop: 30 }}>{s.note[lang]}</p>}
      </>);
      break;
    case 'context':
      body = (<>
        <Eyebrow accent={accent}>{s.eyebrow[lang]}</Eyebrow>
        <h2 style={{ ...head, fontSize: 50 }}>{s.headline[lang]}</h2>
        <Chart spec={{ kind: 'statChips', items: s.stats }} lang={lang} />
        {s.note && <p style={{ ...prose, fontSize: 32, marginTop: 28 }}>{s.note[lang]}</p>}
      </>);
      break;
    case 'action':
      body = (<>
        <Eyebrow accent={accent}>{s.eyebrow[lang]}</Eyebrow>
        <h2 style={{ ...head, fontSize: 52 }}>{s.headline[lang]}</h2>
        {s.chart && <Chart spec={s.chart} lang={lang} />}
        {s.note && <p style={{ ...prose, fontSize: 32, marginTop: 32 }}>{s.note[lang]}</p>}
      </>);
      break;
    case 'list':
      body = (<>
        <Eyebrow accent={accent}>{s.eyebrow[lang]}</Eyebrow>
        {s.headline && <h2 style={{ ...head, fontSize: 44 }}>{s.headline[lang]}</h2>}
        <div style={{ marginTop: 26, borderTop: `1px solid ${HAIRLINE}` }}>
          {s.items.map((it, i) => (
            <div key={i} style={{ ...text, display: 'flex', gap: 26, alignItems: 'baseline', padding: '24px 0', borderBottom: `1px solid ${HAIRLINE}`, fontFamily: SERIF, fontSize: 34, lineHeight: 1.35, color: PAPER }}>
              <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: accent, flexShrink: 0 }}>{pad2(i + 1)}</span>
              <span>{it[lang]}</span>
            </div>
          ))}
        </div>
        {s.note && <p style={{ ...prose, fontSize: 30, marginTop: 28 }}>{s.note[lang]}</p>}
      </>);
      break;
    case 'cta':
      body = (
        <div>
          <span style={{ display: 'block', width: 54, height: 2, background: accent, marginBottom: 36 }} />
          <h2 style={{ ...head, fontSize: 56 }}>{s.headline[lang]}</h2>
          <p style={{ ...prose, fontSize: 36, marginTop: 28 }}>{s.body[lang]}</p>
          {s.url && <div style={{ marginTop: 40, paddingTop: 22, borderTop: `1px solid ${HAIRLINE}`, fontFamily: MONO, fontSize: 27, letterSpacing: '0.06em', color: accent }}>→ {s.url}</div>}
        </div>
      );
      break;
  }

  return (
    <div ref={ref}>
      <Frame accent={accent} brand={brand} meta={meta} source={source} n={index} total={total}>
        {body}
      </Frame>
    </div>
  );
});
Slide.displayName = 'Slide';

/** 화면 표시용 — 1080px 슬라이드를 display px로 축소 */
export function ScaledSlide(props: {
  slide: SlideT; lang: Lang; index: number; total: number; accent: string;
  brand?: string; meta?: string; source?: string; display: number;
}) {
  const { display, ...rest } = props;
  const scale = display / SIZE;
  return (
    <div style={{ width: display, height: display, overflow: 'hidden', borderRadius: 6, boxShadow: '0 24px 70px rgba(0,0,0,.55)' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: SIZE, height: SIZE }}>
        <Slide {...rest} />
      </div>
    </div>
  );
}
