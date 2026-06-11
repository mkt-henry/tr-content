import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Landmark,
  Loader2,
  Mail,
  Paperclip,
  Send,
  Sparkles,
  Target,
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { useRenewalReport } from './state';
import {
  ATTACHMENT,
  CHANGES,
  CONCLUSION,
  DEAL,
  OVERVIEW,
  PANEL,
  RECIPIENTS,
  SOURCES,
  STR,
  getRecipient,
  type ReportSectionId,
} from './data';

const RECIPIENT_ICON: Record<string, typeof Building2> = {
  cedent: Building2,
  lead: Landmark,
  exec: Briefcase,
};

// ===========================================================================
// 좌측 — 근거 자료 → 보고서
// ===========================================================================

export function ReportColumn({ compact }: { compact?: boolean }) {
  const { phase } = useRenewalReport();
  if (phase === 'sources') return <SourcePicker compact={compact} />;
  return <ReportView />;
}

/** 보고서 생성 전 — 근거 자료 선택 */
function SourcePicker({ compact }: { compact?: boolean }) {
  const { selectedSources, toggleSource, generate } = useRenewalReport();
  const lang = useLang();
  const canGenerate = selectedSources.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
        <p className={cn('font-semibold text-zinc-100', compact ? 'text-[13px]' : 'text-[14px]')}>
          {pick(STR.sourcesTitle, lang)}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-500">{pick(STR.sourcesHint, lang)}</p>
      </div>

      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-xl flex-col gap-2">
          {SOURCES.map((s) => {
            const on = selectedSources.includes(s.id);
            return (
              <button
                key={s.id}
                data-demo-id={`source-toggle-${s.id}`}
                onClick={() => toggleSource(s.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
                  on
                    ? 'border-brass-500/40 bg-brass-500/[0.08]'
                    : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]',
                )}
              >
                <span
                  className={cn(
                    'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-[5px] border',
                    on ? 'border-brass-400 bg-brass-500 text-ink-950' : 'border-white/20 text-transparent',
                  )}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <FileText className={cn('h-4 w-4 shrink-0', on ? 'text-brass-300' : 'text-zinc-600')} />
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-zinc-200">{pick(s.label, lang)}</span>
                  <span className="block truncate font-mono text-[10px] text-zinc-500">{pick(s.meta, lang)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/[0.06] p-3.5">
        <button
          data-demo-id="generate-btn"
          onClick={() => generate()}
          disabled={!canGenerate}
          className={cn(
            'flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-all',
            canGenerate
              ? 'bg-brass-500 text-ink-950 shadow-[0_6px_20px_-6px_rgba(192,141,82,0.6)] hover:bg-brass-400'
              : 'bg-white/[0.05] text-zinc-600',
          )}
        >
          <Sparkles className="h-4 w-4" />
          {fmt(pick(STR.generateBtn, lang), {})} · {fmt(pick(STR.sourceSummary, lang), { n: selectedSources.length })}
        </button>
      </div>
    </div>
  );
}

/** 생성 이후 — 근거 자료 요약 헤더 + 보고서 섹션 */
function ReportView() {
  const { phase, statusText, sections, selectedSources, generate } = useRenewalReport();
  const lang = useLang();
  const busy = phase === 'report';
  const selectedLabels = SOURCES.filter((s) => selectedSources.includes(s.id));

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 근거 자료 요약 + 상태 */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-white/[0.06] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-brass-300">
          <Paperclip className="h-3.5 w-3.5" />
          {fmt(pick(STR.sourceSummary, lang), { n: selectedSources.length })}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          {selectedLabels.map((s) => (
            <span key={s.id} className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-400">
              {pick(s.label, lang)}
            </span>
          ))}
        </span>
        {busy && <span className="ml-auto font-mono text-[10.5px] text-zinc-500">{statusText}</span>}
        {phase === 'done' && (
          <button
            onClick={() => generate()}
            className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3" /> {pick(STR.reportReadyBadge, lang)}
          </button>
        )}
      </div>

      <div data-demo-id="report-panel" className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-xl flex-col gap-3.5">
          {sections.map((id) => (
            <Section key={id} id={id} />
          ))}
          {busy && sections.length === 0 && (
            <div className="flex items-center gap-2 text-[12px] text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {statusText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionShell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {title && <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-brass-300/80">{title}</p>}
      {children}
    </motion.div>
  );
}

function Section({ id }: { id: ReportSectionId }) {
  const lang = useLang();

  if (id === 'cover') {
    return (
      <SectionShell>
        <div className="rounded-xl border border-brass-500/25 bg-gradient-to-br from-brass-500/[0.12] to-transparent p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brass-300">{pick(STR.coverTag, lang)}</p>
          <h3 className="mt-1.5 text-[18px] font-bold text-zinc-100">{pick(DEAL.name, lang)}</h3>
          <p className="mt-1 text-[11.5px] text-zinc-400">
            {pick(DEAL.cedent, lang)} · {pick(DEAL.period, lang)}
          </p>
        </div>
      </SectionShell>
    );
  }

  if (id === 'overview') {
    return (
      <SectionShell title={pick(STR.overviewTitle, lang)}>
        <div className="grid grid-cols-2 gap-2">
          {OVERVIEW.map((m, i) => (
            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <p className="text-[10px] text-zinc-500">{pick(m.label, lang)}</p>
              <p className="mt-0.5 font-mono text-[14px] font-semibold text-zinc-100">{pick(m.value, lang)}</p>
              {m.note && <p className="text-[10px] text-zinc-600">{pick(m.note, lang)}</p>}
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (id === 'panel') {
    return (
      <SectionShell title={pick(STR.panelTitle, lang)}>
        <div className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
          {PANEL.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-[12px] font-medium text-zinc-200">{p.name}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.share}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-brass-600 to-brass-400"
                />
              </div>
              <span className="w-9 shrink-0 text-right font-mono text-[11.5px] text-brass-300">{p.share}%</span>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (id === 'changes') {
    return (
      <SectionShell title={pick(STR.changesTitle, lang)}>
        <div className="flex flex-col divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-white/[0.03]">
          {CHANGES.map((c, i) => (
            <div key={i} className="flex items-center gap-2 px-3.5 py-2.5">
              <span className="flex-1 text-[12px] text-zinc-300">{pick(c.label, lang)}</span>
              <span className="font-mono text-[11px] text-zinc-500">{pick(c.from, lang)}</span>
              <ArrowRight className="h-3 w-3 text-zinc-600" />
              <span className={cn('font-mono text-[11.5px] font-semibold', c.positive ? 'text-emerald-400' : 'text-amber-400')}>
                {pick(c.to, lang)}
              </span>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  // conclusion
  return (
    <SectionShell title={pick(STR.conclusionTitle, lang)}>
      <ul className="flex flex-col gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5">
        {pick(CONCLUSION, lang).map((line, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed text-zinc-300">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {line}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

// ===========================================================================
// 우측 — 수신자 선택 → AI 의도 분석 → 전달 이메일
// ===========================================================================

export function DeliveryPanel() {
  const { phase } = useRenewalReport();
  const lang = useLang();
  const beforeReport = phase === 'sources' || phase === 'report';

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <Mail className="h-4 w-4 text-brass-400" />
        <span className="text-[12.5px] font-medium text-zinc-200">{pick(STR.emailTitle, lang)}</span>
      </div>

      {beforeReport ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-600">
            <Mail className="h-6 w-6" />
          </div>
          <p className="text-[11.5px] leading-relaxed text-zinc-600">{pick(STR.emailEmpty, lang)}</p>
        </div>
      ) : phase === 'reportReady' ? (
        <RecipientPicker />
      ) : (
        <DraftView />
      )}
    </div>
  );
}

/** 수신자 선택 — 3인 카드 */
function RecipientPicker() {
  const { selectRecipient } = useRenewalReport();
  const lang = useLang();
  return (
    <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
      <p className="text-[12.5px] font-semibold text-zinc-200">{pick(STR.recipientTitle, lang)}</p>
      <p className="mt-0.5 text-[11px] text-zinc-500">{pick(STR.recipientHint, lang)}</p>
      <div className="mt-3 flex flex-col gap-2">
        {RECIPIENTS.map((r) => {
          const Icon = RECIPIENT_ICON[r.id] ?? Building2;
          return (
            <button
              key={r.id}
              data-demo-id={`recipient-${r.id}`}
              onClick={() => selectRecipient(r.id)}
              className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:border-brass-500/40 hover:bg-brass-500/[0.06]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-brass-300">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-medium text-zinc-100">{pick(r.name, lang)}</span>
                <span className="block truncate text-[11px] text-zinc-500">{pick(r.role, lang)}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-zinc-600" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** 의도 분석 카드 + 이메일 초안 */
function DraftView() {
  const { recipientId, analysisReady, phase, emailSubject, emailBody, emailStatus } = useRenewalReport();
  const lang = useLang();
  const r = getRecipient(recipientId);
  if (!r) return null;
  const Icon = RECIPIENT_ICON[r.id] ?? Building2;
  const showEmail = phase === 'email' || phase === 'done';

  return (
    <div className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto p-4">
      {/* 선택 수신자 */}
      <div data-demo-id="email-recipient" className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-3.5 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-brass-300">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] font-medium text-zinc-100">{pick(r.name, lang)}</span>
          <span className="block truncate font-mono text-[10px] text-zinc-500">{r.addr}</span>
        </span>
        {phase !== 'email' && (
          <button
            onClick={() => useRenewalReport.setState({ phase: 'reportReady', recipientId: null })}
            className="ml-auto shrink-0 text-[10.5px] text-zinc-500 hover:text-zinc-300"
          >
            {pick(STR.changeRecipient, lang)}
          </button>
        )}
      </div>

      {/* AI 의도 분석 */}
      <div data-demo-id="analysis-card" className="mt-2.5 rounded-xl border border-brass-500/20 bg-brass-500/[0.05] p-3.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-brass-300">
          <Sparkles className="h-3.5 w-3.5" />
          {pick(STR.analysisTitle, lang)}
        </div>
        {!analysisReady ? (
          <div className="mt-3 flex items-center gap-2 text-[11.5px] text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brass-300" />
            {pick(STR.statusAnalyzingIntent, lang)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5 flex flex-col gap-2.5">
            <AnalysisRow icon={<Target className="h-3.5 w-3.5" />} label={pick(STR.purposeLabel, lang)} value={pick(r.analysis.purpose, lang)} />
            <AnalysisRow label={pick(STR.contextLabel, lang)} value={pick(r.analysis.context, lang)} muted />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{pick(STR.pointsLabel, lang)}</p>
              <ul className="mt-1 flex flex-col gap-1">
                {pick(r.analysis.points, lang).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-zinc-300">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brass-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <AnalysisRow label={pick(STR.toneLabel, lang)} value={pick(r.analysis.tone, lang)} muted />
          </motion.div>
        )}
      </div>

      {/* 이메일 초안 */}
      {showEmail && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mt-2.5 rounded-lg bg-white/[0.03] px-3.5 py-2.5">
            <p className="text-[9.5px] uppercase tracking-wider text-zinc-600">{pick(STR.subjectLabel, lang)}</p>
            <p className={cn('mt-0.5 text-[12px] font-medium text-zinc-100', emailStatus === 'streaming' && !emailBody && 'stream-caret')}>
              {emailSubject}
            </p>
          </div>

          <div
            data-demo-id="attachment-chip"
            className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-brass-500/25 bg-brass-500/[0.08] px-3 py-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brass-500/20 text-brass-300">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-medium text-zinc-200">{pick(ATTACHMENT.file, lang)}</p>
              <p className="text-[10px] text-zinc-500">PDF · {ATTACHMENT.size}</p>
            </div>
            <Paperclip className="ml-auto h-3.5 w-3.5 shrink-0 text-brass-400/70" />
          </div>

          <div
            data-demo-id="email-body"
            className={cn(
              'mt-2.5 whitespace-pre-wrap rounded-lg bg-white/[0.03] px-3.5 py-3 text-[11.5px] leading-relaxed text-zinc-300',
              emailStatus === 'streaming' && emailBody && 'stream-caret',
            )}
          >
            {emailBody}
          </div>

          <button
            data-demo-id="email-send"
            className={cn(
              'mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-semibold transition-all',
              emailStatus === 'done'
                ? 'bg-brass-500 text-ink-950 shadow-[0_6px_20px_-6px_rgba(192,141,82,0.6)]'
                : 'bg-white/[0.05] text-zinc-600',
            )}
          >
            <Send className="h-3.5 w-3.5" /> {pick(STR.sendBtn, lang)}
          </button>
          <AnimatePresence>
            {emailStatus === 'done' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex items-center justify-center gap-1 text-[10.5px] text-emerald-400"
              >
                <CheckCircle2 className="h-3 w-3" /> {pick(STR.emailDoneBadge, lang)}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function AnalysisRow({ icon, label, value, muted }: { icon?: ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </p>
      <p className={cn('mt-0.5 text-[11.5px] leading-snug', muted ? 'text-zinc-400' : 'font-medium text-zinc-200')}>{value}</p>
    </div>
  );
}
