import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Grid3X3, Loader2, Plus, CheckCircle2, Cpu } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useMatrix, key } from './state';
import { DOCUMENTS, COLUMNS, CELLS, MODEL_CHIP, STR, extractedSummary, addColumnLabel } from './data';
import { CitationBadge, CitationPopover } from '../../../ui/Citation';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

export function Desktop(_: DemoComponentProps) {
  const m = useMatrix();
  const lang = useLang();
  const nextColId = m.nextColumn();
  const nextCol = COLUMNS.find((c) => c.id === nextColId);
  const totalCells = DOCUMENTS.length * COLUMNS.length;
  const doneCells = Object.values(m.cellStatus).filter((s) => s === 'done').length;
  const allDone = doneCells === totalCells;
  const popCell = m.popover ? CELLS[m.popover.docId]?.[m.popover.colId] : null;
  const popDoc = m.popover ? DOCUMENTS.find((d) => d.id === m.popover!.docId) : null;

  return (
    <div className="flex h-full bg-[#111014] text-zinc-200">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 툴바 */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
            <Grid3X3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[13.5px] font-semibold text-zinc-100">
              {pick(STR.appTitle, lang)}{' '}
              <span className="ml-1 text-[10px] font-normal text-zinc-500">{pick(STR.byline, lang)}</span>
            </h2>
          </div>
          {/* V7 스타일 모델 칩 */}
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-zinc-400">
            <Cpu className="h-3 w-3 text-brass-400" /> {pick(MODEL_CHIP, lang)}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <AnimatePresence>
              {allDone && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {extractedSummary(lang, DOCUMENTS.length, totalCells)}
                </motion.span>
              )}
            </AnimatePresence>
            {!allDone && doneCells > 0 && (
              <span className="font-mono text-[11px] text-zinc-500">
                {doneCells}/{totalCells} {pick(STR.extractProgress, lang)}
              </span>
            )}
            <button
              data-demo-id="add-col-btn"
              onClick={() => m.addColumn()}
              disabled={!nextCol}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium transition-all',
                nextCol
                  ? 'bg-brass-500 text-ink-950 shadow-[0_6px_20px_-6px_rgba(192,141,82,0.6)] hover:bg-brass-400'
                  : 'bg-white/[0.05] text-zinc-600',
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              {nextCol ? addColumnLabel(lang, pick(nextCol.label, lang)) : pick(STR.allColumnsAdded, lang)}
            </button>
          </div>
        </header>

        {/* 그리드 */}
        <div className="demo-scroll min-h-0 flex-1 overflow-auto p-5">
          <div className="min-w-fit overflow-hidden rounded-xl border border-white/[0.08]">
            {/* 헤더 행 */}
            <div className="flex border-b border-white/[0.08] bg-white/[0.03]">
              <div className="w-60 shrink-0 border-r border-white/[0.08] px-3.5 py-2.5 text-[11px] font-medium text-zinc-500">
                {pick(STR.documents, lang)} ({DOCUMENTS.length})
              </div>
              <AnimatePresence>
                {m.activeColumns.map((colId) => (
                  <motion.div
                    key={colId}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 188 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0 overflow-hidden border-r border-white/[0.08] last:border-r-0"
                  >
                    <div className="w-[188px] px-3.5 py-2.5 text-[11px] font-medium text-brass-300">
                      {(() => {
                        const col = COLUMNS.find((c) => c.id === colId);
                        return col ? pick(col.label, lang) : null;
                      })()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 문서 행들 */}
            {DOCUMENTS.map((doc) => (
              <div key={doc.id} className="flex border-b border-white/[0.06] last:border-b-0">
                <div className="flex w-60 shrink-0 items-center gap-2 border-r border-white/[0.08] px-3.5 py-3">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[10.5px] text-zinc-300">{doc.fileName}</p>
                    <p className="text-[9.5px] text-zinc-600">{doc.type}</p>
                  </div>
                </div>
                {m.activeColumns.map((colId) => {
                  const status = m.cellStatus[key(doc.id, colId)] ?? 'empty';
                  const cell = CELLS[doc.id]?.[colId];
                  const active = m.popover?.docId === doc.id && m.popover?.colId === colId;
                  return (
                    <div
                      key={colId}
                      className={cn(
                        'w-[188px] shrink-0 border-r border-white/[0.06] px-3.5 py-3 transition-colors last:border-r-0',
                        active && 'bg-brass-400/[0.08]',
                      )}
                    >
                      {status === 'empty' && <span className="text-[11px] text-zinc-700">—</span>}
                      {status === 'extracting' && (
                        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <Loader2 className="h-3 w-3 animate-spin text-brass-400" /> {pick(STR.extracting, lang)}
                        </span>
                      )}
                      {status === 'done' && cell && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-wrap items-center gap-1.5"
                        >
                          <button
                            data-demo-id={`cell-${doc.id}-${colId}`}
                            onClick={() => m.openPopover(doc.id, colId)}
                            className="text-left text-[12px] font-medium text-zinc-100 hover:text-brass-200"
                          >
                            {pick(cell.value, lang)}
                          </button>
                          <CitationBadge label={`[${cell.citation}]`} onClick={() => m.openPopover(doc.id, colId)} active={active} />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
                {m.activeColumns.length === 0 && (
                  <div className="flex items-center px-4 text-[11px] text-zinc-700">{pick(STR.emptyHint, lang)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 원문 인용 패널 (V7 스타일 페이지 미리보기 포함) */}
      <CitationPopover
        citation={
          popCell && popDoc
            ? { snippet: popCell.snippet, source: `${popCell.citation}, ${popDoc.fileName}`, highlightAt: popCell.highlightAt }
            : null
        }
        onClose={() => m.closePopover()}
        title={lang === 'ko' ? '원문 인용' : 'Source citation'}
      />
    </div>
  );
}
