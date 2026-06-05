import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { SourcePanel, SummaryPanel } from './panels';
import { useSummary } from './state';
import { cn } from '../../../lib/cn';

export function Mobile(_: DemoComponentProps) {
  const [tab, setTab] = useState<'summary' | 'source'>('summary');
  const phase = useSummary((s) => s.phase);

  // 생성 시작 시 요약 탭 유지, 리셋 시 요약 탭으로
  useEffect(() => {
    if (phase === 'idle') setTab('summary');
  }, [phase]);

  return (
    <div className="flex h-full flex-col bg-[#121114] text-zinc-200">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-[13px] font-semibold text-zinc-100">리스크 요약·번역</h2>
        {/* 탭 토글 */}
        <div className="ml-auto flex rounded-full border border-white/10 bg-white/[0.04] p-0.5">
          {(['summary', 'source'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                tab === t ? 'bg-white/[0.12] text-zinc-100' : 'text-zinc-500',
              )}
            >
              {t === 'summary' ? '요약' : '원문'}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {tab === 'source' ? (
          <SourcePanel compact />
        ) : (
          // 카드 탭 시 원문 탭으로 전환되며 해당 구절 하이라이트
          <SummaryPanel compact onCardSelect={() => setTab('source')} />
        )}
      </div>
    </div>
  );
}
