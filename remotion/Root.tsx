import { Composition, Folder } from 'remotion';
import './styles.css';
import { DemoVideo } from './DemoVideo';
import { FPS, HEIGHT, WIDTH } from './meta';
import { FINDLE_COMPOSITIONS } from './findleCompositions';

const LANGS = ['ko', 'en'] as const;

export const RemotionRoot: React.FC = () => {
  // 프로젝트 폴더로 그룹핑 → Studio URL이 /findle/<컴포지션id>. 언어별 컴포지션 분리(lang prop만 다름).
  return (
    <Folder name="findle">
      {FINDLE_COMPOSITIONS.flatMap((c) =>
        LANGS.map((lang) => (
          <Composition
            key={`${c.name}-${c.variantId}-${lang}`}
            id={`${c.name}-${c.variantId}-${lang}`}
            component={DemoVideo}
            durationInFrames={c.durationInFrames}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{ featureId: c.featureId, variantId: c.variantId, lang }}
          />
        )),
      )}
    </Folder>
  );
};
