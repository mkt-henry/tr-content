import { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { DemoVideo } from '../../remotion/DemoVideo';
import { FPS, HEIGHT, WIDTH } from '../../remotion/meta';
import type { Lang } from '../demos/findle/_shared/i18n';

/**
 * Remotion findle 데모를 브라우저에서 재생하는 공유 Player 래퍼.
 * 자동재생 unstick 로직(프레임 0 초기 버퍼링 정지 → seekTo(1)로 깨운 뒤 play, 3초 후 포기)을 포함.
 * StudioLite(전용 페이지)에서 사용한다. featureId/variantId로 데모를, lang으로 언어를 고정.
 */
export function DemoPlayer({
  featureId,
  variantId,
  lang,
  durationInFrames,
  autoPlay = true,
  className,
}: {
  featureId: string;
  variantId: string;
  lang?: Lang;
  durationInFrames: number;
  autoPlay?: boolean;
  className?: string;
}) {
  const playerRef = useRef<PlayerRef>(null);
  useEffect(() => {
    if (!autoPlay) return;
    const iv = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      if (p.getCurrentFrame() > 1) {
        clearInterval(iv);
        return;
      }
      p.seekTo(1);
      p.play();
    }, 200);
    const stop = setTimeout(() => clearInterval(iv), 3000);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
    };
  }, [autoPlay]);
  return (
    <Player
      ref={playerRef}
      component={DemoVideo}
      inputProps={{ featureId, variantId, ...(lang ? { lang } : {}) }}
      durationInFrames={durationInFrames}
      fps={FPS}
      compositionWidth={WIDTH}
      compositionHeight={HEIGHT}
      style={{ width: '100%' }}
      className={className}
      controls
      autoPlay={autoPlay}
      loop
      acknowledgeRemotionLicense
    />
  );
}
