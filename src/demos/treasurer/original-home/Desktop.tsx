import type { DemoComponentProps } from '../../../registry/types';
import { metaOf } from './data';
import { OriginalScreen, useOriginalScreenId } from './screens';

/** 데스크탑 = 원본 문서의 검토 코멘트 패널 + 원본 화면 그대로 */
export function Desktop(_: DemoComponentProps) {
  const meta = metaOf(useOriginalScreenId());

  return (
    <div className="flex h-full items-stretch bg-[#0a1220] text-[#aebccf]">
      {/* 좌측 — 원본 문서에 적힌 그대로 */}
      <div className="flex flex-1 flex-col justify-center px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#7aa3e6]">
          Treasurer · Adaptive Home · {meta.id}
        </p>
        <h1 className="mt-4 max-w-md text-[38px] font-semibold leading-tight tracking-tight text-white">
          {meta.caption}
        </h1>
        <div className="mt-6 inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[12px] text-[#eaf0f9]">
          {meta.segment}
        </div>
        <p className="mt-8 max-w-md text-[14px] leading-relaxed text-[#8fa2ba]">{meta.note}</p>
      </div>

      {/* 우측 — 원본 화면 */}
      <div className="flex w-[470px] shrink-0 items-center justify-center pr-12">
        <div className="h-[94%] w-full">
          <OriginalScreen />
        </div>
      </div>
    </div>
  );
}
