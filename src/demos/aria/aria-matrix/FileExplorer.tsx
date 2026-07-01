import { motion } from 'framer-motion';
import { FileText, Folder, HardDrive, Star } from 'lucide-react';
import { useMatrix } from './state';
import { DOCUMENTS, FILE_META, STR } from './data';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/** Windows 탐색기 "열기" 다이얼로그 재현 — explorerOpen일 때 오버레이로 마운트 */
export function FileExplorer() {
  const m = useMatrix();
  const lang = useLang();
  const selected = DOCUMENTS.filter((d) => m.selectedFiles.includes(d.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-[76%] w-[74%] flex-col overflow-hidden rounded-lg border border-black/20 bg-[#f3f3f3] text-[#1f1f1f] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        {/* 제목표시줄 */}
        <div className="flex items-center gap-2 border-b border-black/10 bg-[#e7e7e7] px-3 py-2">
          <Folder className="h-3.5 w-3.5 text-[#c8a24a]" />
          <span className="text-[12px] font-medium">{pick(STR.explorerTitle, lang)}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* 사이드바 (장식) */}
          <div className="w-40 shrink-0 space-y-1 border-r border-black/10 bg-[#eaeaea] p-2 text-[11px] text-[#444]">
            <div className="flex items-center gap-1.5 rounded px-2 py-1">
              <Star className="h-3 w-3" /> {pick(STR.explorerFavorites, lang)}
            </div>
            <div className="flex items-center gap-1.5 rounded bg-[#d7e6fb] px-2 py-1 text-[#1f1f1f]">
              <Folder className="h-3 w-3" /> {pick(STR.explorerFolder, lang)}
            </div>
            <div className="flex items-center gap-1.5 rounded px-2 py-1">
              <HardDrive className="h-3 w-3" /> {pick(STR.explorerThisPc, lang)}
            </div>
          </div>

          {/* 파일 리스트 */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center border-b border-black/10 bg-[#f7f7f7] px-3 py-1.5 text-[10.5px] font-medium text-[#666]">
              <span className="flex-1">{pick(STR.explorerColName, lang)}</span>
              <span className="w-28 shrink-0">{pick(STR.explorerColModified, lang)}</span>
              <span className="w-24 shrink-0">{pick(STR.explorerColType, lang)}</span>
              <span className="w-16 shrink-0 text-right">{pick(STR.explorerColSize, lang)}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {DOCUMENTS.map((doc) => {
                const sel = m.selectedFiles.includes(doc.id);
                const meta = FILE_META[doc.id];
                return (
                  <button
                    key={doc.id}
                    data-demo-id={`file-${doc.id}`}
                    onClick={() => m.toggleFileSelect(doc.id)}
                    className={cn(
                      'flex w-full items-center px-3 py-1.5 text-left text-[11.5px]',
                      sel ? 'bg-[#cfe4fb]' : 'hover:bg-[#eef2f7]',
                    )}
                  >
                    <span className="flex flex-1 items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#c0392b]" />
                      <span className="truncate">{doc.fileName}</span>
                    </span>
                    <span className="w-28 shrink-0 text-[#666]">{meta.modified}</span>
                    <span className="w-24 shrink-0 text-[#666]">{pick(STR.explorerPdfType, lang)}</span>
                    <span className="w-16 shrink-0 text-right text-[#666]">{meta.size}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하단: 파일 이름 + 열기 */}
        <div className="flex items-center gap-2 border-t border-black/10 bg-[#efefef] px-3 py-2.5">
          <span className="text-[11px] text-[#555]">{pick(STR.explorerFileName, lang)}</span>
          <div className="min-w-0 flex-1 truncate rounded border border-black/15 bg-white px-2 py-1 text-[11px] text-[#333]">
            {selected.map((d) => `"${d.fileName}"`).join(' ')}
          </div>
          <button
            data-demo-id="explorer-open-btn"
            onClick={() => m.confirmUpload()}
            disabled={selected.length === 0}
            className={cn(
              'shrink-0 rounded px-4 py-1.5 text-[11.5px] font-medium',
              selected.length > 0 ? 'bg-[#0b6bcb] text-white hover:bg-[#0a5fb3]' : 'bg-[#dcdcdc] text-[#999]',
            )}
          >
            {pick(STR.explorerOpen, lang)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
