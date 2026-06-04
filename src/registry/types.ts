import type { ComponentType } from 'react';
import type { Scenario } from '../engine/types';

export type DeviceMode = 'desktop' | 'mobile';

/** 데모별 배경. CSS 그라디언트로 시작하고, kind:'image'로 한 줄 교체 가능 */
export type DemoBackground =
  | {
      kind: 'gradient';
      /** background CSS 값 (멀티 레이어 radial-gradient 등) */
      css: string;
      /** 분위기용 blur blob 레이어 (Tailwind 클래스) */
      blobs?: string[];
    }
  | { kind: 'image'; src: string; overlay?: string };

export interface DemoComponentProps {
  device: DeviceMode;
}

/** 한 기능의 한 변형 = 버전 × 소구점 */
export interface DemoVariant {
  id: string;
  label: string;
  version?: string;
  sellingPoint?: string;
  background: DemoBackground;
  scenario: Scenario;
  /** 브라우저 프레임 주소창에 표시할 URL */
  url?: string;
}

/** 하나의 기능 = 갤러리 카드 하나. demos/<name>/index.ts 에서 default export */
export interface FeatureDefinition {
  id: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  /** 갤러리 카드 액센트 컬러 */
  accent: string;
  Desktop: ComponentType<DemoComponentProps>;
  /** 없으면 Desktop을 모바일 뷰포트에 렌더 */
  Mobile?: ComponentType<DemoComponentProps>;
  /** 데모 store 초기화 — 재생/리셋 시 호출 */
  resetState: () => void;
  variants: DemoVariant[];
}
