import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Plus,
  FileSearch,
  Zap,
  History,
  CircleHelp,
  FileText,
  Presentation,
  X,
  Sparkles,
  Table2,
  FilePlus2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useDocGen } from './state';
import { ATTACHED_FILE, TEMPLATES, MATRIX_NAME, DRAFT_TAB, SLIDES, STR } from './data';
import { SlideCard, SlidePlaceholder } from './slides';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

export function Desktop(_: DemoComponentProps) {
  const s = useDocGen();
  const lang = useLang();
  const generating = s.phase === 'outline' || s.phase === 'slides';

  return (
    <div className="flex h-full bg-[#131216] text-zinc-200">
      {/* 아이콘 레일 */}
      <aside className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-white/[0.06] py-4">
        <RailIcon icon={LayoutGrid} active />
        <button className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-400 hover:text-zinc-100">
          <Plus className="h-4 w-4" />
        </button>
        <RailIcon icon={FileSearch} />
        <RailIcon icon={Zap} />
        <RailIcon icon={History} />
        <div className="flex-1" />
        <RailIcon icon={CircleHelp} />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass-500/90 text-[13px] font-bold text-ink-950">
          A
        </div>
      </aside>

      {/* 초안 만들기 패널 */}
      <section className="flex w-72 shrink-0 flex-col border-r border-white/[0.06]">
        <header className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-[14px] font-semibold text-zinc-100">{pick(STR.draftPanelTitle, lang)}</h2>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 demo-scroll">
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

          {/* 첨부 + 프롬프트 */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03]">
            <div className="m-3 rounded-lg border border-dashed border-white/15 p-3">
              <div
                data-demo-id="attached-file"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] text-zinc-300"
              >
                <FilePlus2 className="h-3 w-3 text-brass-400" />
                {pick(ATTACHED_FILE, lang)}
                <X className="h-3 w-3 text-zinc-500" />
              </div>
              <div className="mt-2.5 flex items-end gap-1 opacity-50">
                {[20, 32, 26, 40, 34].map((h, i) => (
                  <div key={i} className="w-3 rounded-sm bg-white/20" style={{ height: h * 0.5 }} />
                ))}
              </div>
            </div>
            <textarea
              data-demo-id="prompt-input"
              value={s.prompt}
              onChange={(e) => s.setPrompt(e.target.value)}
              placeholder={pick(STR.promptPlaceholder, lang)}
              className="h-28 w-full resize-none bg-transparent px-4 pb-4 text-[13px] leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>

          {/* 템플릿 */}
          <div>
            <p className="mb-2 text-[12px] font-medium text-zinc-400">{pick(STR.templatesLabel, lang)}</p>
            <div className="flex flex-col">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  data-demo-id={`tpl-${t.id}`}
                  onClick={() => s.selectTemplate(s.templateId === t.id ? null : t.id)}
                  className={cn(
                    'flex items-center gap-2.5 border-b border-white/[0.06] px-1 py-3 text-left text-[13px] transition-colors',
                    s.templateId === t.id ? 'text-brass-300' : 'text-zinc-300 hover:text-zinc-100',
                  )}
                >
                  <Table2 className={cn('h-4 w-4', s.templateId === t.id ? 'text-brass-400' : 'text-zinc-500')} />
                  {pick(t.name, lang)}
                  {s.templateId === t.id && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-brass-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-white/[0.06] p-4">
          <button
            data-demo-id="generate-btn"
            onClick={() => s.generate()}
            disabled={!s.prompt || generating}
            className={cn(
              'flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all',
              s.prompt && !generating
                ? 'bg-brass-500 text-ink-950 shadow-[0_8px_24px_-8px_rgba(192,141,82,0.6)] hover:bg-brass-400'
                : 'bg-white/[0.05] text-zinc-600',
            )}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? pick(STR.generating, lang) : pick(STR.generateOutline, lang)}
          </button>
        </div>
      </section>

      {/* 메인 캔버스 */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* 탭 바 */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-400">
            <Table2 className="h-3.5 w-3.5" />
            {pick(MATRIX_NAME, lang)}
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] text-zinc-200">
            <FileText className="h-3.5 w-3.5 text-brass-400" />
            {pick(DRAFT_TAB, lang)}
          </div>
          <Plus className="h-4 w-4 text-zinc-600" />
          <div className="ml-auto">
            <AnimatePresence>
              {s.phase === 'done' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {pick(STR.draftDone, lang)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto">
          {s.phase === 'idle' ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <h3 className="text-[22px] font-semibold text-zinc-300">{pick(STR.emptyTitle, lang)}</h3>
              <p className="text-[13px] text-zinc-500">
                {pick(STR.emptySubtitlePrefix, lang)}
                {pick(MATRIX_NAME, lang)}
                {pick(STR.emptySubtitleSuffix, lang)}
              </p>
            </div>
          ) : (
            <div className="flex gap-6 p-6">
              {/* 개요 */}
              <div className="w-60 shrink-0">
                <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-zinc-400">
                  {s.phase !== 'done' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-brass-400" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  {s.statusText}
                </div>
                <ol className="space-y-1.5">
                  {s.outline.map((line, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[12px] text-zinc-300"
                    >
                      <span className="font-mono text-[10px] text-brass-400/80">{String(i + 1).padStart(2, '0')}</span>
                      {line}
                    </motion.li>
                  ))}
                </ol>
              </div>

              {/* 슬라이드 그리드 */}
              {(s.phase === 'slides' || s.phase === 'done') && (
                <div className="grid flex-1 auto-rows-min grid-cols-2 gap-4 xl:grid-cols-3">
                  {SLIDES.slice(0, s.slideCount).map((sl, i) => (
                    <SlideCard key={i} index={i} title={pick(sl.title, lang)} sub={pick(sl.sub, lang)} kind={sl.kind} />
                  ))}
                  {s.phase === 'slides' &&
                    Array.from({ length: SLIDES.length - s.slideCount }).map((_, i) => <SlidePlaceholder key={`p${i}`} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RailIcon({ icon: Icon, active }: { icon: typeof LayoutGrid; active?: boolean }) {
  return (
    <button
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
        active ? 'bg-white/[0.08] text-zinc-100' : 'text-zinc-500 hover:text-zinc-200',
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
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
        active ? 'bg-white/[0.12] text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
