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

/** 실제 슬립/특약 원문 페이지처럼 보이는 인용 미리보기 — 조항 문맥 속에서 구절을 형광펜 하이라이트 */
export function PagePreview({
  snippet,
  page,
  source,
  clauseDemoId,
  pageDemoId,
}: {
  snippet: string;
  /** 페이지 라벨 (예: p.3) */
  page: string;
  /** 출처 문자열 (예: "p.3, Korean_Property_Cat_Slip_2026.pdf") */
  source: string;
  /** 하이라이트된 조항 단락에 부여할 data-demo-id (좁은 강조용) */
  clauseDemoId?: string;
  /** PDF 페이지 전체에 부여할 data-demo-id (전체 페이지 강조용) */
  pageDemoId?: string;
}) {
  const file = source.split(',').slice(1).join(',').trim();
  return (
    <div
      data-demo-id={pageDemoId}
      className="overflow-hidden rounded-md bg-[#f6f4ec] shadow-[0_10px_34px_-10px_rgba(0,0,0,0.7)] ring-1 ring-black/15"
    >
      {/* 문서 헤더 */}
      <div className="flex items-center justify-between border-b border-black/[0.08] bg-[#ece8dc] px-4 py-2">
        <span className="truncate font-serif text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#7c7159]">
          {file || 'Reinsurance Slip'}
        </span>
        <span className="shrink-0 pl-2 font-mono text-[9px] text-[#a2977e]">{page}</span>
      </div>
      {/* 본문 — 실제 조항 텍스트(세리프) */}
      <div
        className="space-y-2.5 px-5 py-4 text-[10.5px] leading-[1.7] text-[#33301f]"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <p className="text-[8.5px] font-semibold uppercase tracking-[0.1em] text-[#8c8168]">Terms &amp; Conditions</p>
        <p className="text-justify text-[#615a45]">
          In consideration of the premium and subject to the terms, clauses and conditions contained herein, the
          Reinsurer hereby agrees to indemnify the Reinsured as follows:
        </p>
        <p data-demo-id={clauseDemoId} className="text-justify">
          <ClauseText snippet={snippet} />
        </p>
        <p className="text-justify text-[#615a45]">
          All other terms, conditions and exclusions remain as per the original policy wording, which shall prevail in
          the event of any conflict herewith.
        </p>
      </div>
      {/* 푸터 */}
      <div className="flex items-center justify-between border-t border-black/[0.08] bg-[#ece8dc] px-4 py-1.5">
        <span className="font-mono text-[8px] text-[#a2977e]">{page}</span>
        <span className="font-serif text-[8px] italic text-[#a2977e]">Original document</span>
      </div>
    </div>
  );
}

/** 크림색 문서 페이지 위 하이라이트 — **...** 구간을 형광펜 마커로 렌더 */
function ClauseText({ snippet }: { snippet: string }) {
  const parts = snippet.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-[1px] bg-[#f6e58a] px-0.5 text-[#33301f] shadow-[0_0_0_1px_rgba(190,160,50,0.4)]"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
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
  title = '원문 인용',
  demoId,
}: {
  citation: CitationContent | null;
  onClose: () => void;
  className?: string;
  /** 헤더 라벨 — 데모의 현재 언어에 맞게 전달 */
  title?: string;
  /** 자동 재생 카메라가 이 패널로 줌인할 수 있게 하는 data-demo-id */
  demoId?: string;
}) {
  return (
    <AnimatePresence>
      {citation && (
        <motion.aside
          data-demo-id={demoId}
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
            <span className="text-[12px] font-medium text-zinc-200">{title}</span>
            <button onClick={onClose} className="ml-auto text-zinc-500 hover:text-zinc-200">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
            <PagePreview
              snippet={citation.snippet}
              page={citation.source.split(',')[0] ?? ''}
              source={citation.source}
              clauseDemoId={demoId ? `${demoId}-clause` : undefined}
              pageDemoId={demoId ? `${demoId}-page` : undefined}
            />
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
