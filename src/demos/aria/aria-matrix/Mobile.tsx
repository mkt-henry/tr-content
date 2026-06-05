import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Grid3X3, Loader2, Plus } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useMatrix, key } from './state';
import { DOCUMENTS, COLUMNS, CELLS } from './data';
import { CitationBadge, SnippetText } from '../../../ui/Citation';
import { cn } from '../../../lib/cn';

/** 모바일: 행렬 대신 문서별 아코디언 카드 */
export function Mobile(_: DemoComponentProps) {
  const m = useMatrix();
  const [openDoc, setOpenDoc] = useState<string | null>(DOCUMENTS[0].id);
  const nextCol = COLUMNS.find((c) => c.id === m.nextColumn());

  return (
    <div className="flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <Grid3X3 className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-[13px] font-semibold text-zinc-100">문서 비교 Matrix</h2>
      </header>

      <div className="demo-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {DOCUMENTS.map((doc) => {
          const open = openDoc === doc.id;
          return (
            <div key={doc.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <button
                onClick={() => setOpenDoc(open ? null : doc.id)}
                className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
              >
                <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[10.5px] text-zinc-300">{doc.fileName}</p>
                  <p className="text-[9.5px] text-zinc-600">{doc.type}</p>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 border-t border-white/[0.06] px-3.5 py-3">
                      {m.activeColumns.length === 0 && (
                        <p className="text-[11px] text-zinc-600">열을 추가하면 ARIA가 자동 추출합니다</p>
                      )}
                      {m.activeColumns.map((colId) => {
                        const status = m.cellStatus[key(doc.id, colId)] ?? 'empty';
                        const cell = CELLS[doc.id]?.[colId];
                        const popped = m.popover?.docId === doc.id && m.popover?.colId === colId;
                        return (
                          <div key={colId}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10.5px] text-zinc-500">
                                {COLUMNS.find((c) => c.id === colId)?.label}
                              </span>
                              {status === 'extracting' && <Loader2 className="h-3 w-3 animate-spin text-brass-400" />}
                              {status === 'done' && cell && (
                                <span className="flex items-center gap-1.5 text-right">
                                  <button
                                    data-demo-id={`cell-${doc.id}-${colId}`}
                                    onClick={() => (popped ? m.closePopover() : m.openPopover(doc.id, colId))}
                                    className="text-[12px] font-medium text-zinc-100"
                                  >
                                    {cell.value}
                                  </button>
                                  <CitationBadge
                                    label={`[${cell.citation}]`}
                                    active={popped}
                                    onClick={() => (popped ? m.closePopover() : m.openPopover(doc.id, colId))}
                                  />
                                </span>
                              )}
                              {status === 'empty' && <span className="text-[11px] text-zinc-700">—</span>}
                            </div>
                            {/* 인라인 원문 인용 */}
                            <AnimatePresence>
                              {popped && cell && (
                                <motion.p
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-1.5 overflow-hidden rounded-lg bg-black/30 px-3 py-2 font-mono text-[10px] leading-relaxed text-zinc-400"
                                >
                                  &ldquo;<SnippetText snippet={cell.snippet} />&rdquo;
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <button
          data-demo-id="add-col-btn"
          onClick={() => m.addColumn()}
          disabled={!nextCol}
          className={cn(
            'flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all',
            nextCol ? 'bg-brass-500 text-ink-950' : 'bg-white/[0.05] text-zinc-600',
          )}
        >
          <Plus className="h-4 w-4" />
          {nextCol ? `열 추가: ${nextCol.label}` : '모든 열 추가됨'}
        </button>
      </div>
    </div>
  );
}
