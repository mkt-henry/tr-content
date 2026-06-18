import type { Scenario } from '../../../engine/types';
import { getLang, pick } from '../_shared/i18n';
import { useRenewalReport } from './state';
import { SPOTLIGHT } from './data';

const st = () => useRenewalReport.getState();

/**
 * 줌1: 근거 자료 직접 선택 → 줌아웃 후 보고서 자동 생성 → 검토 →
 * 줌2: 수신자 맞춤 이메일 자동 작성 → 검토 후 발송 → 발송 완료
 */
export const renewalReportScenario: Scenario = {
  id: 'renewal-report-flow',
  steps: [
    { kind: 'wait', ms: 2400 }, // 연동 소스에서 자료 로드 완료 대기 (로드 ~1.9s + 버퍼)
    // [줌1] 로드된 자료 중 특정 파일을 직접 선택
    {
      kind: 'cursor',
      target: 'source-toggle-slip',
      ms: 700,
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'click',
      target: 'source-toggle-slip',
      run: () => st().toggleSource('slip'),
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'cursor',
      target: 'source-toggle-lossrun',
      ms: 600,
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'click',
      target: 'source-toggle-lossrun',
      run: () => st().toggleSource('lossrun'),
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'cursor',
      target: 'source-toggle-quotes',
      ms: 600,
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'click',
      target: 'source-toggle-quotes',
      run: () => st().toggleSource('quotes'),
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    { kind: 'wait', ms: 900 }, // 선택 결과 보기
    // [줌아웃] 보고서 생성 — 줌 없이 전체가 자동 생성되는 모습
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
    { kind: 'wait', ms: 5200 }, // 분석 + 섹션 8개 스트리밍
    // 생성된 보고서를 위에서부터 훑어 내려가며 검토 (줌 없음)
    { kind: 'cursor', target: 'report-panel', ms: 600 },
    { kind: 'scroll', target: 'report-panel', to: 'top', ms: 900 },
    { kind: 'wait', ms: 1400 }, // 표지 + Executive Summary
    { kind: 'scroll', target: 'report-panel', toId: 'section-lossrun', ms: 1300 },
    { kind: 'wait', ms: 1500 }, // 손해실적 차트
    { kind: 'scroll', target: 'report-panel', toId: 'section-structure', ms: 1100 },
    { kind: 'wait', ms: 1400 }, // 프로그램 구조도
    { kind: 'scroll', target: 'report-panel', toId: 'section-panel', ms: 1100 },
    { kind: 'wait', ms: 1300 }, // 재보험사 패널 + 등급
    { kind: 'scroll', target: 'report-panel', to: 'bottom', ms: 1300 },
    { kind: 'wait', ms: 1300 }, // 변경 + 결론
    // CTA → 전달 이메일 모달 오픈
    { kind: 'cursor', target: 'email-cta', ms: 700 },
    { kind: 'click', target: 'email-cta', run: () => st().openEmailModal() },
    { kind: 'wait', ms: 800 }, // 모달 등장
    // 수신자 선택 — 출재사(cedent)
    { kind: 'cursor', target: 'recipient-cedent', ms: 800 },
    { kind: 'click', target: 'recipient-cedent', run: () => st().selectRecipient('cedent') },
    { kind: 'wait', ms: 2500 }, // 의도 분석 → 이메일 스트리밍 시작 (email-body 등장)
    // [줌2] 수신자 맞춤 이메일이 자동 작성되는 부분
    {
      kind: 'cursor',
      target: 'email-body',
      ms: 700,
      zoom: true,
      caption: () => pick(SPOTLIGHT.email, getLang()),
    },
    { kind: 'wait', ms: 3500 }, // 본문 스트리밍 완료 (emailStatus done)
    // [마무리] 줌아웃 후 검토 후 발송 → 발송 중 → 발송 완료
    { kind: 'cursor', target: 'email-send', ms: 700 },
    { kind: 'click', target: 'email-send', run: () => st().send() },
    { kind: 'wait', ms: 2200 }, // 발송 중 → 발송 완료 노출
  ],
};
