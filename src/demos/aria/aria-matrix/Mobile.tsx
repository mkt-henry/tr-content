import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, FileText, Grid3X3, Loader2, UploadCloud } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useMatrix, key } from './state';
import { DOCUMENTS, COLUMNS, CELLS, STR } from './data';
import { CitationBadge, SnippetText } from '../../../ui/Citation';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/** 모바일: OS 탐색기 대신 하단 시트로 파일 선택, 이후 아코디언 카드 자동 채움 */
export function Mobile(_: DemoComponentProps) {
  const m = useMatrix();
  const lang = useLang();
  const docs = DOCUMENTS.filter((d) => m.uploadedDocs.includes(d.id));
  const [openDoc, setOpenDoc] = useState<string | null>(null);

  // 첫 업로드 문서 자동 펼침
  useEffect(() => {
    if (docs.length && !openDoc) setOpenDoc(docs[0].id);
  }, [docs, openDoc]);

  return (
    <div className="relative flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <Grid3X3 className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-[13px] font-semibold text-zinc-100">{pick(STR.appTitle, lang)}</h2>
        {m.phase === 'analyzing' && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-brass-400" />}
      </header>

      {m.phase === 'idle' ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <button
            data-demo-id="upload-btn"
            onClick={() => m.openExplorer()}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] px-6 py-12"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brass-500/15 text-brass-300">
              <UploadCloud className="h-7 w-7" />
            </div>
            <span className="text-[14px] font-semibold text-zinc-100">{pick(STR.uploadCta, lang)}</span>
            <span className="text-center text-[11px] text-zinc-500">{pick(STR.uploadHint, lang)}</span>
          </button>
        </div>
      ) : (
        <div className="demo-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {docs.map((doc) => {
            const open = openDoc === doc.id;
            const prog = m.uploadProgress[doc.id] ?? 0;
            const uploading = m.phase === 'uploading' && prog < 1;
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
                  {uploading ? (
                    <span className="font-mono text-[10px] text-zinc-500">{Math.round(prog * 100)}%</span>
                  ) : (
                    <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
                  )}
                </button>

                {uploading && (
                  <div className="px-3.5 pb-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div className="h-full rounded-full bg-brass-400" animate={{ width: `${prog * 100}%` }} />
                    </div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {!uploading && open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="space-y-2 border-t border-white/[0.06] px-3.5 py-3">
                        {m.activeColumns.length === 0 && (
                          <p className="flex items-center gap-2 text-[11px] text-zinc-600">
                            <Loader2 className="h-3 w-3 animate-spin text-brass-400" /> {pick(STR.analyzing, lang)}
                          </p>
                        )}
                        {m.activeColumns.map((colId) => {
                          const status = m.cellStatus[key(doc.id, colId)] ?? 'empty';
                          const cell = CELLS[doc.id]?.[colId];
                          const popped = m.popover?.docId === doc.id && m.popover?.colId === colId;
                          return (
                            <div key={colId}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10.5px] text-zinc-500">
                                  {(() => {
                                    const col = COLUMNS.find((c) => c.id === colId);
                                    return col ? pick(col.label, lang) : null;
                                  })()}
                                </span>
                                {status === 'extracting' && <Loader2 className="h-3 w-3 animate-spin text-brass-400" />}
                                {status === 'done' && cell && (
                                  <span className="flex items-center gap-1.5 text-right">
                                    <button
                                      data-demo-id={`cell-${doc.id}-${colId}`}
                                      onClick={() => (popped ? m.closePopover() : m.openPopover(doc.id, colId))}
                                      className="text-[12px] font-medium text-zinc-100"
                                    >
                                      {pick(cell.value, lang)}
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
      )}

      {/* 하단 시트 파일 선택 */}
      <AnimatePresence>
        {m.explorerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/10 bg-[#17161a] p-4"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
              <p className="mb-3 text-[13px] font-semibold text-zinc-100">{pick(STR.sheetTitle, lang)}</p>
              <div className="space-y-1.5">
                {DOCUMENTS.map((doc) => {
                  const sel = m.selectedFiles.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      data-demo-id={`file-${doc.id}`}
                      onClick={() => m.toggleFileSelect(doc.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04]"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-300">{doc.fileName}</span>
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-md border',
                          sel ? 'border-brass-400 bg-brass-400 text-ink-950' : 'border-white/20',
                        )}
                      >
                        {sel && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                data-demo-id="explorer-open-btn"
                onClick={() => m.confirmUpload()}
                disabled={m.selectedFiles.length === 0}
                className={cn(
                  'mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold',
                  m.selectedFiles.length ? 'bg-brass-500 text-ink-950' : 'bg-white/[0.05] text-zinc-600',
                )}
              >
                <UploadCloud className="h-4 w-4" /> {pick(STR.sheetUpload, lang)}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
