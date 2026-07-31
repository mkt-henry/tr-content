import type { AnySlide, MacroSlide as MacroSlideT } from '../../cardnews/types';
import { slideAtFrame, TRANSITION_FRAMES, type ReelsTiming } from '../../cardnews/reels';
import { MacroSlide } from './MacroSlide';

export const REELS_W = 1080;
export const REELS_H = 1920;

/** 카드 스케일 — 1080×1350 → 972×1215 */
const CARD_SCALE = 0.9;
const CARD_W = Math.round(1080 * CARD_SCALE);
const CARD_H = Math.round(1350 * CARD_SCALE);

const SANS = "'Space Grotesk', -apple-system, 'Segoe UI', sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace";
const MINT = '#4FD1A5';

export interface ReelsFrameProps {
  slides: AnySlide[];
  timing: ReelsTiming;
  /** 절대 프레임 — Remotion은 useCurrentFrame(), 뷰어는 Player가 넘긴다 */
  frame: number;
  /** 우상단 날짜 (예: '2026·07·27') */
  meta?: string;
}

/** 9:16 릴스 프레임 — 4:5 MacroSlide를 그대로 재활용하고 브랜드/진행바/CTA를 두른다.
    frame만으로 출력이 결정된다(렌더 결정론). Remotion API를 import하지 않는다. */
export function ReelsFrame({ slides, timing, frame, meta }: ReelsFrameProps) {
  const { index, local } = slideAtFrame(timing, frame);
  const slide = index >= 0 ? slides[index] : undefined;

  // 등장 전환 — ease-out cubic. CSS transition을 쓰지 않는다(프레임 결정론)
  const p = Math.min(1, Math.max(0, local / TRANSITION_FRAMES));
  const e = 1 - Math.pow(1 - p, 3);

  return (
    <div style={{
      width: REELS_W, height: REELS_H, background: '#0A0D11', color: '#ECEEF1',
      fontFamily: SANS, padding: '96px 54px 0', boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      textAlign: 'left',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(120% 60% at 100% 0%, rgba(79,209,165,0.10), transparent 55%)',
      }} />

      {/* 브랜드 + 날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '0.04em' }}>
          AlphaLenz<span style={{ color: '#6A727C', fontWeight: 400 }}> Macro</span>
        </div>
        {meta && <div style={{ fontFamily: MONO, fontSize: 24, color: '#6A727C', letterSpacing: '0.1em' }}>{meta}</div>}
      </div>

      {/* 진행 바 — 슬라이드 수만큼 세그먼트 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 34, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 7, flex: 1 }}>
          {slides.map((_, i) => (
            <span key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i <= index ? MINT : '#242A32',
            }} />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 24, color: '#6A727C', letterSpacing: '0.08em' }}>
          {index + 1} / {slides.length}
        </span>
      </div>

      {/* 카드 — 1장만 마운트. translateY + opacity로 등장 */}
      <div style={{
        marginTop: 60, width: CARD_W, height: CARD_H, borderRadius: 20, overflow: 'hidden',
        position: 'relative', opacity: e, transform: `translateY(${(1 - e) * 28}px)`,
      }}>
        {slide && (
          <div style={{ transform: `scale(${CARD_SCALE})`, transformOrigin: 'top left', width: 1080, height: 1350 }}>
            <MacroSlide slide={slide as MacroSlideT} meta={meta} />
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 44, fontFamily: MONO, fontSize: 26, color: MINT, letterSpacing: '0.1em', position: 'relative' }}>
        alpha-lenz.com →
      </div>
    </div>
  );
}
