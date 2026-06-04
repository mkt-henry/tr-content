import { useEffect, useRef } from 'react';
import { Handshake } from 'lucide-react';
import type { DemoComponentProps } from '../../registry/types';
import { useMatch } from './state';
import { RiskCard, CandidateList, EmailPanel } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const selectedId = useMatch((s) => s.selectedId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  // 이메일 생성 시작 시 해당 섹션으로 스크롤
  useEffect(() => {
    if (selectedId) emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedId]);

  return (
    <div className="flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <Handshake className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-[13px] font-semibold text-zinc-100">재보험사 매칭</h2>
      </header>

      <div ref={scrollRef} className="demo-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <RiskCard compact />
        <div>
          <p className="mb-2.5 text-[11px] font-medium text-zinc-500">재보험사 후보 · 적합도 순</p>
          <CandidateList compact />
        </div>
        {selectedId && (
          <div ref={emailRef} className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#141318]">
            <div className="h-[420px]">
              <EmailPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
