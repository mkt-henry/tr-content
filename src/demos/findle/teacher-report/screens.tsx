import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { FINDLE_GREEN, FindleMark } from '../_shared/ui';
import { CLASS, NEED_HELP, RECOMMENDATION, ROSTER, STR, WEAK_CONCEPTS } from './data';
import { useTeacherReport } from './state';

export function Header() {
  const lang = useLang();
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-5 py-3">
      <FindleMark className="h-7 w-7 text-[14px]" />
      <div>
        <h2 className="text-[14px] font-extrabold text-zinc-900">{pick(STR.appTitle, lang)}</h2>
        <p className="text-[11px] text-zinc-400">{pick(CLASS.name, lang)}</p>
      </div>
      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[12px] font-medium text-zinc-600">
        <GraduationCap className="h-3.5 w-3.5" /> {pick(STR.teacher, lang)}
      </span>
    </header>
  );
}

export function Dashboard() {
  const lang = useLang();
  const stats = [
    { v: `${CLASS.avgAccuracy}%`, l: pick(STR.avgAccuracy, lang) },
    { v: `${CLASS.completion}%`, l: pick(STR.completion, lang) },
    { v: `${CLASS.onTrack}/${CLASS.students}`, l: pick(STR.onTrack, lang) },
  ];
  return (
    <div className="flex flex-col gap-3">
      {/* 반 통계 */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((x, i) => (
          <div key={i} className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <p className="text-[18px] font-extrabold tabular-nums" style={{ color: FINDLE_GREEN }}>
              {x.v}
            </p>
            <p className="text-[10px] text-zinc-400">{x.l}</p>
          </div>
        ))}
      </div>

      {/* 학생 진도 */}
      <div data-demo-id="roster" className="rounded-2xl bg-white p-3.5 shadow-sm">
        <p className="mb-2 text-[12px] font-bold text-zinc-700">{pick(STR.rosterTitle, lang)}</p>
        <div className="flex flex-col gap-2.5">
          {ROSTER.map((s) => (
            <div key={s.name} className="flex items-center gap-2.5">
              <span className="w-20 shrink-0 truncate text-[12px] font-medium text-zinc-700">{s.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.progress}%`, background: s.accuracy < 70 ? '#f59e0b' : FINDLE_GREEN }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-zinc-500">{s.accuracy}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportPanel() {
  const { phase, statusText, reportText, sectionsReady, generate } = useTeacherReport();
  const lang = useLang();
  const busy = phase === 'analyzing' || phase === 'writing';

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <Sparkles className="h-4 w-4" style={{ color: FINDLE_GREEN }} />
        <span className="text-[12.5px] font-bold text-zinc-800">{pick(STR.reportTitle, lang)}</span>
        <AnimatePresence>
          {phase === 'done' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600"
            >
              <CheckCircle2 className="h-3 w-3" /> {pick(STR.doneBadge, lang)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {phase === 'idle' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-[12.5px] leading-relaxed text-zinc-400">{pick(STR.reportEmpty, lang)}</p>
          <button
            data-demo-id="generate-report"
            onClick={() => generate()}
            className="flex h-11 items-center gap-2 rounded-xl px-5 text-[13.5px] font-bold text-white"
            style={{ background: FINDLE_GREEN }}
          >
            <Sparkles className="h-4 w-4" /> {pick(STR.generateBtn, lang)}
          </button>
        </div>
      ) : (
        <div data-demo-id="report-panel" className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto p-4">
          {busy && (
            <div className="mb-2 flex items-center gap-2 text-[11.5px] font-medium text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: FINDLE_GREEN }} /> {statusText}
            </div>
          )}
          {/* 요약 본문 */}
          <p className={cn('whitespace-pre-wrap text-[12.5px] leading-relaxed text-zinc-700', phase === 'writing' && 'stream-caret')}>
            {reportText}
          </p>

          <AnimatePresence>
            {sectionsReady && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col gap-3">
                {/* 약점 개념 */}
                <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" /> {pick(STR.weakTitle, lang)}
                  </p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {WEAK_CONCEPTS.map((w) => (
                      <div key={w.label.en} className="flex items-center gap-2">
                        <span className="w-20 shrink-0 text-[11.5px] text-zinc-600">{pick(w.label, lang)}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${w.accuracy}%` }} />
                        </div>
                        <span className="w-8 text-right text-[10.5px] font-semibold tabular-nums text-amber-600">{w.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 도움 필요 학생 */}
                <div className="rounded-xl bg-zinc-50 p-3">
                  <p className="text-[11px] font-bold text-zinc-600">{pick(STR.needHelpTitle, lang)}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {NEED_HELP.map((n) => (
                      <span key={n} className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-600">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 권고 */}
                <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                  <p className="text-[11px] font-bold text-emerald-700">{pick(STR.recoTitle, lang)}</p>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {pick(RECOMMENDATION, lang).map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11.5px] leading-snug text-zinc-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
