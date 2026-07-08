import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

// 데모 컴포넌트는 Tailwind v4로 스타일된다 — Remotion 번들러에 Tailwind 처리를 연결.
Config.overrideWebpackConfig((currentConfig) => enableTailwind(currentConfig));

Config.setVideoImageFormat('jpeg');
Config.setConcurrency(1); // 시나리오 엔진이 프레임 순차 진행에 의존 → 단일 탭 렌더

// 정적 배포된 Studio(tr-content.vercel.app/studio)에서 브라우저 내 렌더 버튼을 활성화한다.
// 서버(headless Chrome)가 없는 정적 호스팅이라 서버사이드 렌더는 불가 → 클라이언트 사이드 렌더로 대체.
Config.setExperimentalClientSideRenderingEnabled(true);
