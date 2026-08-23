import { Layers, MousePointerClick, Users } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { SEGMENTS } from './data';
import { usePersonalizedTab } from './state';
import { AppScreens } from './screens';

/** 유저군별 맞춤 탭 첫 화면의 핵심 모듈 — 좌측 패널 라이브 스탯 */
const FIRST_MODULE: Record<string, string> = {
  commodity: '총자산 · 매수/매도',
  apptech: '오늘 받을 포인트',
  briefing: '오늘 브리핑',
};

/** 개인화 모듈을 홈에서 떼어냈을 때 재진입까지 필요한 탭 수 */
const TAPS: Record<string, string> = {
  commodity: '2탭',
  apptech: '2탭',
  briefing: '1탭',
};

/** 데스크탑 = 브랜드 패널 + 폰 컬럼 (트레져러는 모바일 앱) */
export function Desktop(_: DemoComponentProps) {
  const segment = usePersonalizedTab((s) => s.segment);
  const seg = SEGMENTS.find((s) => s.id === segment) ?? SEGMENTS[0];

  return (
    <div className="flex h-full items-stretch bg-[#0a1220] text-[#aebccf]">
      {/* 좌측 브랜드 패널 */}
      <div className="flex flex-1 flex-col justify-center px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#7aa3e6]">
          Treasurer · Adaptive Home · 맞춤 탭
        </p>
        <h1 className="mt-4 text-[42px] font-semibold leading-tight tracking-tight text-white">
          개인화를 홈에서 떼어내
          <br />
          <span className="text-[#7aa3e6]">별도 탭</span>으로
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[#8fa2ba]">
          홈은 세 유저군이 함께 쓰는 공통 진입점으로 되돌리고, 유저군별 재구성은 맞춤 탭 하나에서
          합니다. 모듈은 그대로 쓰고 순서·크기·톤만 달라집니다.
        </p>

        <div className="mt-10 flex gap-3">
          {[
            { icon: Users, label: '판별된 유저군', value: seg.label },
            { icon: Layers, label: '첫 모듈', value: FIRST_MODULE[segment] },
            { icon: MousePointerClick, label: '핵심 행동까지', value: TAPS[segment] },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-2 text-[#6f8197]">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px]">{label}</span>
              </div>
              <p className="mt-1.5 text-[18px] font-semibold text-[#eaf0f9]">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[12px] text-[#6f8197]">{seg.basis}</p>
      </div>

      {/* 우측 앱 컬럼 */}
      <div className="flex w-[420px] shrink-0 items-center justify-center pr-12">
        <div className="h-[92%] w-full overflow-hidden rounded-[2rem] shadow-2xl ring-8 ring-black/60">
          <AppScreens />
        </div>
      </div>
    </div>
  );
}
