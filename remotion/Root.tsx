import { Composition, Folder } from 'remotion';
import './styles.css';
import { DemoVideo } from './DemoVideo';
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from './meta';

export const RemotionRoot: React.FC = () => {
  return (
    // 프로젝트별 폴더로 그룹핑 → Studio URL이 /findle/<컴포지션id> 형태가 된다.
    // (컴포지션 id 자체는 그대로라 CLI 렌더는 영향 없음)
    <Folder name="findle">
      <Composition
        id="daily-quiz-narrated"
        component={DemoVideo}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </Folder>
  );
};
