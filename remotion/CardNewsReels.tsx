import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { ReelsFrame } from '../src/shell/cardnews/ReelsFrame';
import { reelsTiming } from '../src/cardnews/reels';
import { getVariants } from '../src/cardnews/types';
import { getReelsDeck } from './cardnewsReelsCompositions';

export const cardNewsReelsSchema = z.object({ deckId: z.string() });

/** 카드뉴스 자체 호스팅 폰트 — public/fonts.
    remotion/styles.css는 이 @font-face를 담을 수 없다(webpack css-loader가 Vite public 경로를 못 읽음). */
const FACES = [
  { family: 'Space Grotesk', weight: '400', file: 'fonts/space-grotesk-latin-400-normal.woff2' },
  { family: 'Space Grotesk', weight: '500', file: 'fonts/space-grotesk-latin-500-normal.woff2' },
  { family: 'Space Grotesk', weight: '600', file: 'fonts/space-grotesk-latin-600-normal.woff2' },
  { family: 'Space Grotesk', weight: '700', file: 'fonts/space-grotesk-latin-700-normal.woff2' },
  { family: 'IBM Plex Mono', weight: '400', file: 'fonts/ibm-plex-mono-latin-400-normal.woff2' },
  { family: 'IBM Plex Mono', weight: '500', file: 'fonts/ibm-plex-mono-latin-500-normal.woff2' },
  { family: 'IBM Plex Mono', weight: '600', file: 'fonts/ibm-plex-mono-latin-600-normal.woff2' },
];

function useCardnewsFonts() {
  // 앱 임베드(Player)에선 index.css가 이미 로드 → 핸들을 만들지 않는다(StrictMode 고아 핸들 방지)
  const [handle] = useState<number | null>(() =>
    typeof document !== 'undefined'
      && FACES.every((f) => document.fonts?.check(`16px "${f.family}"`))
      ? null
      : delayRender('Loading cardnews fonts'),
  );

  useEffect(() => {
    if (handle === null) return;
    let cancelled = false;
    Promise.all(
      FACES.map(async (f) => {
        const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {
          weight: f.weight, style: 'normal',
        });
        await face.load();
        document.fonts.add(face);
      }),
    )
      .then(() => { if (!cancelled) continueRender(handle); })
      // 실패 시 continueRender를 부르지 않는다 → 렌더 타임아웃으로 실패.
      // 폴백 폰트로 조용히 렌더되면 산출물이 망가진 채 나오므로 실패시키는 게 맞다.
      .catch((err) => { console.error('[cardnews:reels] 폰트 로드 실패', err); });
    return () => { cancelled = true; };
  }, [handle]);
}

export const CardNewsReels: React.FC<z.infer<typeof cardNewsReelsSchema>> = ({ deckId }) => {
  useCardnewsFonts();
  const frame = useCurrentFrame();

  const deck = getReelsDeck(deckId);
  const variant = getVariants(deck).find((v) => v.kind === 'reels');
  if (!variant) throw new Error(`[cardnews:reels] ${deckId}에 kind:'reels' variant가 없다`);

  const timing = reelsTiming(variant.slides, variant.seconds);
  const meta = deck.date.replace(/-/g, '·');

  return (
    <AbsoluteFill style={{ background: '#0A0D11' }}>
      <ReelsFrame slides={variant.slides} timing={timing} frame={frame} meta={meta} />
    </AbsoluteFill>
  );
};
