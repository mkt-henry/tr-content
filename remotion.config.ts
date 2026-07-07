import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

// 데모 컴포넌트는 Tailwind v4로 스타일된다 — Remotion 번들러에 Tailwind 처리를 연결.
Config.overrideWebpackConfig((currentConfig) => enableTailwind(currentConfig));

Config.setVideoImageFormat('jpeg');
Config.setConcurrency(1); // 시나리오 엔진이 프레임 순차 진행에 의존 → 단일 탭 렌더
