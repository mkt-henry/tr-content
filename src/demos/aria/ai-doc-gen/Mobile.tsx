import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Presentation,
  X,
  Sparkles,
  CheckCircle2,
  Loader2,
  FilePlus2,
  Menu,
} from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useDocGen } from './state';
import { ATTACHED_FILE, MATRIX_NAME, SLIDES, STR } from './data';
import { SlideCard, SlidePlaceholder } from './slides';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

export function Mobile(_: DemoComponentProps) {
  const s = useDocGen();
  const lang = useLang();
  const generating = s.phase === 'outline' || s.phase === 'slides';

  return (
    <div className="flex h-full flex-col bg-[#131216] text-zinc-200">
      {/* 앱 바 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <Menu className="h-4.5 w-4.5 text-zinc-500" />
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-100">{pick(STR.draftPanelTitle, lang)}</h2>
          <p className="text-[10px] text-zinc-500">{pick(MATRIX_NAME, lang)}</p>
        </div>
        <div className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-[12px] font-bold text-ink-950">
          A
        </div>
      </header>

      <div className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto p-4">
        {s.phase === 'idle' || s.phase === 'outline' ? (
          <div className="flex flex-col gap-4">
            {/* 문서 / 프레젠테이션 토글 */}
            <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
              <SegBtn
                id="doc-type-document"
                active={s.docType === 'document'}
                onClick={() => s.setDocType('document')}
                icon={FileText}
                label={pick(STR.typeDocument, lang)}
              />
              <SegBtn
                id="doc-type-presentation"
                active={s.docType === 'presentation'}
                onClick={() => s.setDocType('presentation')}
                icon={Presentation}
                label={pick(STR.typePresentation, lang)}
              />
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03]">
              <div className="m-3 rounded-lg border border-dashed border-white/15 p-2.5">
                <div
                  data-demo-id="attached-file"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] text-zinc-300"
                >
                  <FilePlus2 className="h-3 w-3 text-brass-400" />
                  {pick(ATTACHED_FILE, lang)}
                  <X className="h-3 w-3 text-zinc-500" />
                </div>
              </div>
              <textarea
                data-demo-id="prompt-input"
                value={s.prompt}
                onChange={(e) => s.setPrompt(e.target.value)}
                placeholder={pick(STR.promptPlaceholder, lang)}
                className="h-24 w-full resize-none bg-transparent px-3.5 pb-3.5 text-[13px] leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            {/* 개요 진행 */}
            {s.phase === 'outline' && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-[12px] text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brass-400" />
                  {s.statusText}
                </div>
                <ol className="space-y-1.5">
                  {s.outline.map((line, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] text-zinc-300"
                    >
                      <span className="font-mono text-[9px] text-brass-400/80">{String(i + 1).padStart(2, '0')}</span>
                      {line}
                    </motion.li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center gap-2 text-[12px] text-zinc-400">
              {s.phase !== 'done' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brass-400" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
              {s.statusText}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SLIDES.slice(0, s.slideCount).map((sl, i) => (
                <SlideCard key={i} index={i} title={pick(sl.title, lang)} sub={pick(sl.sub, lang)} kind={sl.kind} />
              ))}
              {s.phase === 'slides' &&
                Array.from({ length: SLIDES.length - s.slideCount }).map((_, i) => <SlidePlaceholder key={`p${i}`} />)}
            </div>
          </div>
        )}
      </div>

      {/* 하단 CTA */}
      {(s.phase === 'idle' || s.phase === 'outline') && (
        <div className="border-t border-white/[0.06] p-4">
          <button
            data-demo-id="generate-btn"
            onClick={() => s.generate()}
            disabled={!s.prompt || generating}
            className={cn(
              'flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all',
              s.prompt && !generating
                ? 'bg-brass-500 text-ink-950 shadow-[0_8px_24px_-8px_rgba(192,141,82,0.6)]'
                : 'bg-white/[0.05] text-zinc-600',
            )}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? pick(STR.generating, lang) : pick(STR.generateOutline, lang)}
          </button>
        </div>
      )}

      <AnimatePresence>
        {s.phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-4 py-2 text-[12px] font-medium text-emerald-400 backdrop-blur">
              <CheckCircle2 className="h-4 w-4" /> {pick(STR.draftDone, lang)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SegBtn({
  id,
  active,
  onClick,
  icon: Icon,
  label,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  label: string;
}) {
  return (
    <button
      data-demo-id={id}
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-[12px] font-medium transition-all',
        active ? 'bg-white/[0.12] text-zinc-100' : 'text-zinc-500',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
