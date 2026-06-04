import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import { cn } from '../lib/cn';

/** [p.3] / [§4] 형태의 인용 배지 — AI 추출값 옆에 붙는 브론즈 마커 */
export function CitationBadge({
  label,
  onClick,
  active,
  demoId,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  demoId?: string;
}) {
  return (
    <button
      type="button"
      data-demo-id={demoId}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center rounded px-1 py-px font-mono text-[9.5px] font-medium transition-colors',
        active
          ? 'bg-brass-500/30 text-brass-200'
          : 'bg-brass-500/12 text-brass-400/90 hover:bg-brass-500/25 hover:text-brass-300',
      )}
    >
      {label}
    </button>
  );
}

export interface CitationContent {
  /** 원문 영문 스니펫. **굵은** 부분이 하이라이트 */
  snippet: string;
  source: string;
  /** 가짜 PDF 페이지 미리보기에서 하이라이트 박스의 세로 위치 (0~1) — V7 스타일 시각적 인용 */
  highlightAt?: number;
}

/** V7 스타일 시각적 인용 — 가짜 PDF 페이지 미니어처 + 하이라이트 영역 박스 */
export function PagePreview({ highlightAt = 0.4, page }: { highlightAt?: number; page: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#211f24] p-3">
      {/* 가짜 문서 줄들 */}
      <div className="space-y-1.5">
        {[92, 100, 96, 88, 100, 94, 60, 0, 90, 100, 97, 84, 100, 91, 72].map((w, i) => (
          <div key={i} className="h-1.5 rounded-sm bg-white/[0.08]" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* 하이라이트 영역 박스 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="absolute inset-x-2 rounded border-2 border-brass-400/80 bg-brass-400/15"
        style={{ top: `${highlightAt * 100}%`, height: '18%' }}
      />
      <span className="absolute bottom-1.5 right-2 font-mono text-[9px] text-zinc-500">{page}</span>
    </div>
  );
}

/** 원문 스니펫에서 **...** 구간을 하이라이트로 렌더 */
export function SnippetText({ snippet }: { snippet: string }) {
  const parts = snippet.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-brass-400/25 px-0.5 text-brass-100">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/** 셀/카드 클릭 시 나타나는 원문 인용 패널 */
export function CitationPopover({
  citation,
  onClose,
  className,
}: {
  citation: CitationContent | null;
  onClose: () => void;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {citation && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'flex w-80 shrink-0 flex-col border-l border-white/[0.08] bg-[#17161a]',
            className,
          )}
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <FileText className="h-3.5 w-3.5 text-brass-400" />
            <span className="text-[12px] font-medium text-zinc-200">원문 인용</span>
            <button onClick={onClose} className="ml-auto text-zinc-500 hover:text-zinc-200">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
            <PagePreview highlightAt={citation.highlightAt} page={citation.source.split(',')[0] ?? ''} />
            <p className="mt-4 font-mono text-[11.5px] leading-relaxed text-zinc-400">
              &ldquo;<SnippetText snippet={citation.snippet} />&rdquo;
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-zinc-500">
              <span className="h-1 w-1 rounded-full bg-brass-400" />
              {citation.source}
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
