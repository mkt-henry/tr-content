import type { OriginalScreenId } from './original.generated';

export interface OriginalScreenMeta {
  id: OriginalScreenId;
  /** 원본 문서의 화면 캡션 그대로 */
  caption: string;
  /** 원본 문서에서 이 화면이 속한 유저군 */
  segment: string;
  /** 원본 문서의 검토 코멘트 그대로 */
  note: string;
}

export const ORIGINAL_META: OriginalScreenMeta[] = [
  {
    id: '1a',
    caption: '트레이딩 데스크 — 손익과 주문 버튼을 최상단으로',
    segment: '원자재 투자자',
    note: '혜택·퀴즈 모듈을 더보기로 내리고, 홈 상단 프로모 배너를 제거했습니다. 매수 버튼이 첫 화면에 노출되므로 재매수까지의 탭 수가 4 → 1로 줄어듭니다.',
  },
  {
    id: '1b',
    caption: '워치리스트 — 홈 자체가 시세판, 주문은 고정 바로',
    segment: '원자재 투자자',
    note: '홈을 보유 자산 하나의 시세 화면으로 만들고, 주문은 화면 하단 고정 바로 항상 닿게 하는 안입니다.',
  },
  {
    id: '1c',
    caption: '오늘 할 일 — 남은 포인트를 진행률로',
    segment: '앱테크 유저',
    note: '평가금액 0원 카드와 시세 그리드를 빼고, 흩어져 있던 적립 모듈을 하나의 진행률로 묶었습니다. 첫 진입 탭은 혜택이지만 홈에서도 같은 순서를 보여줍니다. 전환 훅은 스크롤 중반 한 번만 노출합니다.',
  },
  {
    id: '1d',
    caption: '금 조각 모으기 — 포인트를 자산 게이지로',
    segment: '앱테크 유저',
    note: '포인트를 g 단위 자산으로 환산해 보여주는 안입니다. 적립 행동이 그대로 투자 계좌 잔고로 쌓이므로 별도 전환 설득이 필요 없지만, 자동 전환 토글의 약관·과세 확인이 필요합니다.',
  },
  {
    id: '1e',
    caption: '브리핑 퍼스트 — 알파렌즈를 홈으로 승격',
    segment: '시세·뉴스 관심층',
    note: '읽으러 온 유저에게는 읽는 화면을 첫 화면으로 줍니다. 브리핑 중간에 “이 뉴스로 움직인 자산” 블록 하나만 거래 진입점으로 두어, 뉴스 소비가 매수로 이어지게 합니다. 다크는 이 탭에만 적용됩니다.',
  },
  {
    id: '1f',
    caption: '뉴스 타임라인 — 상단 칩을 섹터로 교체',
    segment: '시세·뉴스 관심층',
    note: '상단 자산 칩을 섹터·테마 칩으로 바꾸고, 홈을 읽을거리 타임라인으로 구성한 안입니다.',
  },
];

export function metaOf(id: OriginalScreenId): OriginalScreenMeta {
  return ORIGINAL_META.find((m) => m.id === id) ?? ORIGINAL_META[0];
}
