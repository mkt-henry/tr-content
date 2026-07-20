import { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { DemoVideo } from '../../remotion/DemoVideo';
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from '../../remotion/meta';
import type { Lang } from '../demos/findle/_shared/i18n';

/**
 * Remotion daily-quiz 데모를 브라우저에서 재생하는 공유 Player 래퍼.
 * 자동재생 unstick 로직(프레임 0 초기 버퍼링 정지 → seekTo(1)로 깨운 뒤 play, 3초 후 포기)을 포함.
 * StudioLite(전용 페이지)에서 사용한다.
 * lang 지정 시 해당 언어 컴포지션으로 고정, 미지정 시 앱 현재 언어 토글을 따른다.
 */
export function DemoPlayer({
  lang,
  autoPlay = true,
  className,
}: {
  lang?: Lang;
  autoPlay?: boolean;
  className?: string;
}) {
  const playerRef = useRef<PlayerRef>(null);
  useEffect(() => {
    if (!autoPlay) return;
    // Player는 프레임 0에서 초기 버퍼링으로 정지하는 경우가 있어, seek(1)로 한 번 unstick한 뒤 재생한다.
    // 프레임이 실제 전진할 때까지 재시도, 3초 후 포기(수동 재생 가능).
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
      inputProps={lang ? { lang } : {}}
      durationInFrames={DURATION_IN_FRAMES}
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
