import { Composition, Folder } from 'remotion';
import './styles.css';
import { DemoVideo, demoVideoSchema } from './DemoVideo';
import { FPS, HEIGHT, WIDTH } from './meta';
import { FINDLE_COMPOSITIONS } from './findleCompositions';
import { CardNewsReels, cardNewsReelsSchema } from './CardNewsReels';
import { REELS_DECKS } from './cardnewsReelsCompositions';
import { REELS_FPS, reelsTiming } from '../src/cardnews/reels';
import { getVariants } from '../src/cardnews/types';

const LANGS = ['ko', 'en'] as const;

/** 프로젝트 id별로 컴포지션을 묶는다 → Studio URL이 /<projectId>/<컴포지션id> */
const BY_PROJECT = FINDLE_COMPOSITIONS.reduce<Record<string, typeof FINDLE_COMPOSITIONS>>((acc, c) => {
  (acc[c.projectId] ??= []).push(c);
  return acc;
}, {});

export const RemotionRoot: React.FC = () => {
  // 프로젝트 폴더로 그룹핑 → Studio URL이 /<projectId>/<컴포지션id>. 언어별 컴포지션 분리(lang prop만 다름).
  return (
    <>
      {Object.entries(BY_PROJECT).map(([projectId, comps]) => (
        <Folder key={projectId} name={projectId}>
          {comps.flatMap((c) =>
            LANGS.map((lang) => (
              <Composition
                key={`${c.name}-${c.variantId}-${lang}`}
                id={`${c.name}-${c.variantId}-${lang}`}
                component={DemoVideo}
                schema={demoVideoSchema}
                durationInFrames={c.durationInFrames}
                fps={FPS}
                width={WIDTH}
                height={HEIGHT}
                defaultProps={{
                  featureId: c.featureId,
                  variantId: c.variantId,
                  lang,
                  // 프레임 옵션 — Studio 우측 패널에서 토글. 웹앱 데모는 브라우저 크롬 기본 ON.
                  browserChrome: c.chrome,
                  device: 'desktop' as const,
                  phoneFrame: true,
                }}
              />
            )),
          )}
        </Folder>
      ))}

      {/* 카드뉴스 릴스 — macro 슬라이드는 영어 고정이라 언어별 분리를 하지 않는다(Findle과 다른 점) */}
      <Folder name="cardnews">
        {REELS_DECKS.flatMap((deck) => {
          const v = getVariants(deck).find((x) => x.kind === 'reels');
          if (!v || v.slides.length === 0) {
            console.warn(`[cardnews:reels] ${deck.id} — reels variant 없음 또는 슬라이드 0장, 컴포지션 등록 생략`);
            return [];
          }
          const timing = reelsTiming(v.slides, v.seconds);
          return [
            <Composition
              key={deck.id}
              id={`reels-${deck.id}`}
              component={CardNewsReels}
              schema={cardNewsReelsSchema}
              durationInFrames={timing.totalFrames}
              fps={REELS_FPS}
              width={v.width}
              height={v.height}
              defaultProps={{ deckId: deck.id }}
            />,
          ];
        })}
      </Folder>
    </>
  );
};
