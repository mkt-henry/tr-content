import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileText, Languages, Loader2 } from 'lucide-react';
import { CitationBadge } from '../../ui/Citation';
import { useSummary } from './state';
import { CLAUSES, SUMMARY_ITEMS, DOC_NAME } from './data';
import { cn } from '../../lib/cn';

/** 좌측 영문 원문 패널 — 하이라이트된 구절로 자동 스크롤 */
export function SourcePanel({ compact }: { compact?: boolean }) {
  const highlighted = useSummary((s) => s.highlightedClauseId);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!highlighted || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-clause-id="${highlighted}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlighted]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <FileText className="h-3.5 w-3.5 text-zinc-500" />
        <span className="truncate font-mono text-[11px] text-zinc-400">{DOC_NAME}</span>
        <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">EN</span>
      </div>
      <div ref={containerRef} className={cn('demo-scroll min-h-0 flex-1 overflow-y-auto p-5', compact && 'p-4')}>
        <p className="mb-5 text-center font-mono text-[11px] tracking-wider text-zinc-500">
          SLIP — PROPERTY PER RISK EXCESS OF LOSS
        </p>
        <div className="space-y-5">
          {CLAUSES.map((c) => {
            const active = highlighted === c.id;
            return (
              <div
                key={c.id}
                data-clause-id={c.id}
                data-demo-id={`src-${c.id}`}
                className={cn(
                  'rounded-lg p-3 transition-all duration-300',
                  active ? 'bg-brass-400/[0.12] ring-1 ring-brass-400/40' : 'bg-transparent',
                )}
              >
                <p className={cn('font-mono text-[10px] font-semibold tracking-wider', active ? 'text-brass-300' : 'text-zinc-500')}>
                  {c.section}
                </p>
                <p className={cn('mt-1.5 font-mono text-[11.5px] leading-relaxed', active ? 'text-zinc-200' : 'text-zinc-400')}>
                  {c.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 우측 한국어 요약 패널 — 카드 스트리밍 생성 */
export function SummaryPanel({ compact, onCardSelect }: { compact?: boolean; onCardSelect?: () => void }) {
  const s = useSummary();

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <Languages className="h-3.5 w-3.5 text-brass-400" />
        <span className="text-[12px] font-medium text-zinc-200">구조화 요약</span>
        <span className="rounded bg-brass-500/15 px-1.5 py-0.5 font-mono text-[9px] text-brass-300">KO</span>
        <AnimatePresence>
          {s.phase === 'done' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
            >
              <CheckCircle2 className="h-3 w-3" /> 7개 항목 · 원문 100% 인용 연결
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className={cn('demo-scroll min-h-0 flex-1 overflow-y-auto p-4', compact && 'p-3')}>
        {s.phase === 'idle' ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brass-500/15 text-brass-300">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-zinc-300">영문 슬립을 한국어로 구조화합니다</p>
              <p className="mt-1 text-[11.5px] text-zinc-500">모든 요약 항목이 원문 구절과 연결됩니다</p>
            </div>
            <button
              data-demo-id="summarize-btn"
              onClick={() => s.generate()}
              className="flex h-10 items-center gap-2 rounded-xl bg-brass-500 px-5 text-[13px] font-semibold text-ink-950 shadow-[0_8px_24px_-8px_rgba(192,141,82,0.6)] hover:bg-brass-400"
            >
              요약 생성
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {SUMMARY_ITEMS.map((item) => {
              const status = s.cardStatus[item.id];
              const text = s.cardText[item.id] ?? '';
              const active = s.highlightedClauseId === item.clauseId && status !== 'pending';
              return (
                <motion.div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  data-demo-id={`card-${item.id}`}
                  initial={false}
                  animate={{ opacity: status === 'pending' ? 0.35 : 1 }}
                  onClick={() => {
                    s.highlight(item.clauseId);
                    onCardSelect?.();
                  }}
                  onMouseEnter={() => status === 'done' && s.highlight(item.clauseId)}
                  className={cn(
                    'block w-full cursor-pointer rounded-xl border p-3.5 text-left transition-all duration-300',
                    active
                      ? 'border-brass-400/50 bg-brass-400/[0.08] shadow-[0_0_24px_-8px_rgba(217,173,120,0.4)]'
                      : 'border-white/[0.07] bg-white/[0.03]',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium text-zinc-500">{item.label}</p>
                    {status === 'streaming' && <Loader2 className="h-3 w-3 animate-spin text-brass-400" />}
                    {status === 'done' && <CitationBadge label={`[${item.citation}]`} />}
                  </div>
                  {status === 'pending' ? (
                    <div className="shimmer mt-2 h-3.5 w-2/3 rounded" />
                  ) : (
                    <p className={cn('mt-1.5 text-[13px] leading-relaxed text-zinc-200', status === 'streaming' && 'stream-caret')}>
                      {text}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
