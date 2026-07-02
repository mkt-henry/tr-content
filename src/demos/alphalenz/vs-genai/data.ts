import type { L } from '../_shared/i18n';
import { QA, type Answer } from '../alpha-chat/data';

/** 히어로 질문 — alpha-chat QA[0]과 동일 */
export const QUESTION: L = QA[0].question;

/** 우측 AlphaLenz 답변 — alpha-chat 삼성전자 Answer 재사용 */
export const ALPHA_ANSWER: L<Answer> = QA[0].answer;

/**
 * 좌측 범용 AI 답변 텍스트.
 * 톤: 공손한 한계 고백. 실시간/최신 수치 없음, 출처 없음, 구체 수치 회피.
 * 실명(특정 AI 서비스) 미사용.
 */
export const GENERIC_ANSWER: L<string> = {
  ko: '삼성전자는 글로벌 반도체·스마트폰 시장에서 손꼽히는 대형 기업으로, 메모리 반도체와 파운드리, 소비자 가전 등 다양한 사업을 영위하고 있습니다. 다만 저는 학습 데이터의 기준 시점 이후 실적이나 주가 정보를 갖고 있지 않아, 최신 매출·영업이익·주가 등 구체적인 수치는 확인해 드리기 어렵습니다. 정확한 최근 실적은 공식 공시(DART) 또는 금융 정보 서비스를 직접 참고하시기 바랍니다.',
  en: "Samsung Electronics is one of the world's largest companies in semiconductors, smartphones, and consumer electronics, with major businesses spanning memory chips, foundry services, and household devices. However, my knowledge has a training cutoff, so I'm unable to confirm the latest revenue figures, operating profit, or share price. For accurate up-to-date results, please refer directly to official filings or a financial data service.",
};

/**
 * 좌측 패널 하단 캐비엇 칩 문구.
 * 지식 컷오프·실시간 데이터 부재·출처 없음을 간결하게 표시.
 */
export const GENERIC_CAVEAT: L<string> = {
  ko: '학습 데이터 기준 · 실시간 데이터·출처 없음',
  en: 'Training data only · No real-time data or sources',
};

/** 좌측 패널 라벨 — 실명 미사용 */
export const GENERIC_LABEL: L = {
  ko: '범용 AI 어시스턴트',
  en: 'General-purpose AI',
};
