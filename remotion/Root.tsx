import { Composition, Folder } from 'remotion';
import './styles.css';
import { DemoVideo } from './DemoVideo';
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from './meta';

export const RemotionRoot: React.FC = () => {
  return (
    // 프로젝트별 폴더로 그룹핑 → Studio URL이 /findle/<컴포지션id> 형태가 된다.
    // (컴포지션 id 자체는 그대로라 CLI 렌더는 영향 없음)
    // 언어별로 컴포지션을 분리한다 — 같은 프레임 드라이버에 lang prop만 달리 준다.
    // UI 문구는 useLang/pick으로 이미 이중언어라 실제로 한/영 다른 영상이 렌더된다.
    <Folder name="findle">
      <Composition
        id="daily-quiz-narrated-ko"
        component={DemoVideo}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ lang: 'ko' as const }}
      />
      <Composition
        id="daily-quiz-narrated-en"
        component={DemoVideo}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ lang: 'en' as const }}
      />
    </Folder>
  );
};
