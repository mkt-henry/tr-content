import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Grid3X3, Loader2, CheckCircle2, Cpu, UploadCloud } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useMatrix, key } from './state';
import { DOCUMENTS, COLUMNS, CELLS, MODEL_CHIP, STR, extractedSummary } from './data';
import { CitationBadge, CitationPopover } from '../../../ui/Citation';
import { FileExplorer } from './FileExplorer';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Desktop(_: DemoComponentProps) {
  const m = useMatrix();
  const lang = useLang();
  const docs = DOCUMENTS.filter((d) => m.uploadedDocs.includes(d.id));
  const totalCells = docs.length * COLUMNS.length;
  const doneCells = Object.values(m.cellStatus).filter((s) => s === 'done').length;
  const allDone = m.phase === 'done';
  const popCell = m.popover ? CELLS[m.popover.docId]?.[m.popover.colId] : null;
  const popDoc = m.popover ? DOCUMENTS.find((d) => d.id === m.popover!.docId) : null;

  return (
    <div className="relative flex h-full bg-[#111014] text-zinc-200">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 툴바 */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
            <Grid3X3 className="h-4 w-4" />
          </div>
          <h2 className="flex items-baseline text-[13.5px] font-semibold text-zinc-100">
            {pick(STR.appTitle, lang)}
            <span className="ml-1.5 flex items-center gap-1 text-[10px] font-normal text-zinc-500">
              <AriaWordmark className="h-2.5" /> by AlphaLenz
            </span>
          </h2>
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
                  <CheckCircle2 className="h-3.5 w-3.5" /> {extractedSummary(lang, docs.length, totalCells)}
                </motion.span>
              )}
            </AnimatePresence>
            {m.phase === 'analyzing' && (
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin text-brass-400" />
                {doneCells}/{totalCells} {pick(STR.extractProgress, lang)}
              </span>
            )}
          </div>
        </header>

        {/* 본문 */}
        {m.phase === 'idle' ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8">
            <button
              data-demo-id="upload-btn"
              onClick={() => m.openExplorer()}
              className="flex w-[70%] max-w-xl flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] px-8 py-14 transition-colors hover:border-brass-400/50 hover:bg-white/[0.04]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brass-500/15 text-brass-300">
                <UploadCloud className="h-8 w-8" />
              </div>
              <span className="text-[15px] font-semibold text-zinc-100">{pick(STR.uploadCta, lang)}</span>
              <span className="text-[12px] text-zinc-500">{pick(STR.uploadHint, lang)}</span>
            </button>
          </div>
        ) : (
          <div className="demo-scroll min-h-0 flex-1 overflow-auto p-5">
            <div className="min-w-fit overflow-hidden rounded-xl border border-white/[0.08]">
              {/* 헤더 행 */}
              <div className="flex border-b border-white/[0.08] bg-white/[0.03]">
                <div className="w-60 shrink-0 border-r border-white/[0.08] px-3.5 py-2.5 text-[11px] font-medium text-zinc-500">
                  {pick(STR.documents, lang)} ({docs.length})
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
              {docs.map((doc) => {
                const prog = m.uploadProgress[doc.id] ?? 0;
                const uploading = m.phase === 'uploading' && prog < 1;
                return (
                  <div key={doc.id} className="flex border-b border-white/[0.06] last:border-b-0">
                    <div className="flex w-60 shrink-0 items-center gap-2 border-r border-white/[0.08] px-3.5 py-3">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[10.5px] text-zinc-300">{doc.fileName}</p>
                        <p className="text-[9.5px] text-zinc-600">{doc.type}</p>
                      </div>
                    </div>

                    {/* 업로드 중: 진행 바 */}
                    {uploading && (
                      <div className="flex flex-1 items-center gap-2 px-3.5 py-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            className="h-full rounded-full bg-brass-400"
                            animate={{ width: `${prog * 100}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">{Math.round(prog * 100)}%</span>
                      </div>
                    )}

                    {/* 업로드 완료 후: 셀 */}
                    {!uploading &&
                      m.activeColumns.map((colId) => {
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

                    {/* 분석 대기(열이 아직 없음) */}
                    {!uploading && m.activeColumns.length === 0 && (
                      <div className="flex flex-1 items-center px-4 text-[11px] text-zinc-600">
                        <Loader2 className="mr-2 h-3 w-3 animate-spin text-brass-400" /> {pick(STR.analyzing, lang)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 원문 인용 패널 */}
      <CitationPopover
        citation={
          popCell && popDoc
            ? { snippet: popCell.snippet, source: `${popCell.citation}, ${popDoc.fileName}`, highlightAt: popCell.highlightAt }
            : null
        }
        onClose={() => m.closePopover()}
        title={lang === 'ko' ? '원문 인용' : 'Source citation'}
      />

      {/* 파일 탐색기 오버레이 */}
      <AnimatePresence>{m.explorerOpen && <FileExplorer />}</AnimatePresence>
    </div>
  );
}
