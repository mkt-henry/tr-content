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

/** 언어별 텍스트 (ko/en 등) */
export type LangText = Record<string, string>;

/** 데모 영상의 배포용 게시 카피 한 블록 (유튜브 제목/설명·링크드인 본문 등) */
export interface DistributionPost {
  /** 플랫폼 — 칩 색·라벨 결정 */
  platform: 'youtube' | 'linkedin';
  /** 패널 섹션 라벨 (예: 제목 / 설명 / 본문) */
  label: LangText;
  /** 게시 본문 — 언어별로 자연스럽게 작성(직역 아님) */
  text: LangText;
  /** 글자 수 상한 힌트 (예: 유튜브 제목 100). 넘으면 카운터가 경고색 */
  limit?: number;
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
  /** true면 데스크탑 모드에서도 브라우저 크롬(주소창)을 숨김 — 모바일 앱을 폰 목업으로 소개하는 기능 설명 레이아웃용 */
  chromeless?: boolean;
  /** 데모 store 초기화 — 재생/리셋 시 호출 */
  resetState: () => void;
  /**
   * 영상 렌더에서 등장 애니메이션을 프레임 기반으로 돌리기 위한 opt-in (src/engine/videoClock).
   * 현재 데모 store 상태를 나타내는 문자열을 돌려주면, DemoVideo가 이 값이 바뀐 프레임을 기준점으로
   * VideoClock을 내려준다. 지정하지 않으면 기존 벽시계 애니메이션을 그대로 쓴다.
   */
  videoStateKey?: () => string;
  variants: DemoVariant[];
  /** 데모 영상 배포용 게시 카피(유튜브·링크드인). 있으면 컨트롤 바에 "게시 본문" 버튼 노출 */
  posts?: DistributionPost[];
}
