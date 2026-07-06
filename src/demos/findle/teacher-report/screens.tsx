import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Download,
  GraduationCap,
  Loader2,
  Send,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { FINDLE_GREEN, FindleMark } from '../_shared/ui';
import {
  CLASS,
  CLASS_MASTERY,
  conceptBreakdown,
  CONCEPTS,
  findStudent,
  NEED_HELP,
  RECOMMENDATION,
  ROSTER,
  slug,
  STR,
  STRONG_CONCEPTS,
  WEAK_CONCEPTS,
  type WeakConcept,
} from './data';
import { useTeacherReport } from './state';

const AMBER = '#f59e0b';
const ROSE = '#f43f5e';

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
  const openStudent = useTeacherReport((s) => s.openStudent);
  const selected = useTeacherReport((s) => s.selectedStudent);
  const stats = [
    { v: `${CLASS.avgAccuracy}%`, l: pick(STR.avgAccuracy, lang) },
    { v: `${CLASS.completion}%`, l: pick(STR.completion, lang) },
    { v: `${CLASS.onTrack}/${CLASS.students}`, l: pick(STR.onTrack, lang) },
    { v: `${CLASS.participation}%`, l: pick(STR.participation, lang) },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div data-demo-id="class-stats" className="grid grid-cols-4 gap-2">
        {stats.map((x, i) => (
          <div key={i} className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <p className="text-[18px] font-extrabold tabular-nums" style={{ color: FINDLE_GREEN }}>
              {x.v}
            </p>
            <p className="text-[10px] text-zinc-400">{x.l}</p>
          </div>
        ))}
      </div>

      <div data-demo-id="roster" className="rounded-2xl bg-white p-3.5 shadow-sm">
        <p className="mb-2 text-[12px] font-bold text-zinc-700">{pick(STR.rosterTitle, lang)}</p>
        <div className="flex flex-col gap-1">
          {ROSTER.map((s) => {
            const active = selected === s.name;
            const low = s.accuracy < 70;
            return (
              <button
                key={s.name}
                data-demo-id={`student-${slug(s.name)}`}
                onClick={() => openStudent(s.name)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors',
                  active ? 'bg-emerald-50 ring-1 ring-emerald-100' : 'hover:bg-zinc-50',
                )}
              >
                <span className="w-5 shrink-0 text-[10px] font-bold tabular-nums text-zinc-300">{s.rank}</span>
                <span className="w-20 shrink-0 truncate text-[12px] font-medium text-zinc-700">{s.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: low ? AMBER : FINDLE_GREEN }} />
                </div>
                <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-zinc-500">{s.accuracy}%</span>
                <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-emerald-500' : 'text-zinc-300')} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 시각화 ─────────────────────────────────────────── */

/** 경량 인라인 SVG 스파크라인 */
function Sparkline({ data, color = FINDLE_GREEN }: { data: number[]; color?: string }) {
  const W = 320;
  const H = 60;
  const P = 6;
  const lo = Math.min(...data) - 4;
  const span = Math.max(1, Math.max(...data) + 4 - lo);
  const step = (W - P * 2) / (data.length - 1);
  const pts = data.map((v, i) => ({ x: P + i * step, y: P + (1 - (v - lo) / span) * (H - P * 2) }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H - P} L${pts[0].x.toFixed(1)},${H - P} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" style={{ height: 52 }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-grad)" />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={3.5} fill={color} />
    </svg>
  );
}

/** 오각형 레이더 — 학생 숙련도 vs 반 평균 오버레이 */
function RadarChart({ values, compare, labels, color = FINDLE_GREEN, size = 220 }: {
  values: number[];
  compare: number[];
  labels: string[];
  color?: string;
  size?: number;
}) {
  const n = values.length;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 30;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number) => {
    const r = (Math.max(0, Math.min(100, v)) / 100) * R;
    return [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  };
  const poly = (arr: number[]) => arr.map((v, i) => pt(i, v).map((x) => x.toFixed(1)).join(',')).join(' ');
  const rings = [25, 50, 75, 100];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block" style={{ width: size, maxWidth: '100%', overflow: 'visible' }}>
      {/* 그리드 링 */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={poly(CONCEPTS.map(() => ring))}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth={1}
        />
      ))}
      {/* 축 */}
      {CONCEPTS.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e4e4e7" strokeWidth={1} />;
      })}
      {/* 반 평균 */}
      <polygon points={poly(compare)} fill="#a1a1aa" fillOpacity={0.12} stroke="#a1a1aa" strokeWidth={1.5} strokeDasharray="4 3" />
      {/* 학생 */}
      <polygon points={poly(values)} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2.5} />
      {values.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
      {/* 라벨 */}
      {labels.map((lab, i) => {
        const [x, y] = pt(i, 122);
        const anchor = x < cx - 8 ? 'end' : x > cx + 8 ? 'start' : 'middle';
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-zinc-500" style={{ fontSize: 10, fontWeight: 600 }}>
            {lab}
          </text>
        );
      })}
    </svg>
  );
}

/** 개념 바 리스트 (강점/약점 공용) */
function ConceptBars({ items, color }: { items: WeakConcept[]; color: string }) {
  const lang = useLang();
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {items.map((w) => (
        <div key={w.label.en} className="flex items-center gap-2">
          <span className="w-20 shrink-0 text-[11.5px] text-zinc-600">{pick(w.label, lang)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full" style={{ width: `${w.accuracy}%`, background: color }} />
          </div>
          <span className="w-8 text-right text-[10.5px] font-semibold tabular-nums" style={{ color }}>{w.accuracy}%</span>
        </div>
      ))}
    </div>
  );
}

/* ── 반 리포트 패널 ─────────────────────────────────── */

export function ReportPanel() {
  const { phase, statusText, reportText, sectionsReady, generate, startDispatch, notify } = useTeacherReport();
  const lang = useLang();
  const busy = phase === 'analyzing' || phase === 'writing';

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl bg-white shadow-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0" style={{ color: FINDLE_GREEN }} />
        <span className="min-w-0 truncate text-[12.5px] font-bold text-zinc-800">{pick(STR.reportTitle, lang)}</span>
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
        <>
          <div data-demo-id="report-panel" className="demo-scroll demo-scroll-follow min-h-0 flex-1 overflow-y-auto p-4">
            {busy && (
              <div className="mb-2 flex items-center gap-2 text-[11.5px] font-medium text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: FINDLE_GREEN }} /> {statusText}
              </div>
            )}
            <p className={cn('whitespace-pre-wrap text-[12.5px] leading-relaxed text-zinc-700', phase === 'writing' && 'stream-caret')}>
              {reportText}
            </p>

            <AnimatePresence>
              {sectionsReady && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col gap-3">
                  {/* 강점 */}
                  <div data-demo-id="report-strong" className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <TrendingUp className="h-3.5 w-3.5" /> {pick(STR.strongTitle, lang)}
                    </p>
                    <ConceptBars items={STRONG_CONCEPTS} color={FINDLE_GREEN} />
                  </div>

                  {/* 약점 */}
                  <div data-demo-id="report-weak" className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" /> {pick(STR.weakTitle, lang)}
                    </p>
                    <ConceptBars items={WEAK_CONCEPTS} color={AMBER} />
                  </div>

                  {/* 도움 필요 학생 */}
                  <div data-demo-id="report-needhelp" className="rounded-xl bg-zinc-50 p-3">
                    <p className="text-[11px] font-bold text-zinc-600">{pick(STR.needHelpTitle, lang)}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {NEED_HELP.map((n) => (
                        <span key={n} className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-600">{n}</span>
                      ))}
                    </div>
                  </div>

                  {/* 권고 */}
                  <div data-demo-id="report-reco" className="rounded-xl border border-zinc-100 p-3">
                    <p className="text-[11px] font-bold text-zinc-600">{pick(STR.recoTitle, lang)}</p>
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

          {/* 발송/내보내기 — 리포트 완성 시 */}
          <AnimatePresence>
            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex shrink-0 items-center gap-2 border-t border-zinc-100 p-3"
              >
                <button
                  data-demo-id="send-all"
                  onClick={() => startDispatch()}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-bold text-white"
                  style={{ background: FINDLE_GREEN }}
                >
                  <Send className="h-3.5 w-3.5" /> {pick(STR.sendAllBtn, lang)}
                </button>
                <button
                  data-demo-id="report-export"
                  onClick={() => notify(pick(STR.noticeSentGuardian, lang))}
                  title="PDF"
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-[12px] font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  <Download className="h-3.5 w-3.5" /> {pick(STR.exportBtn, lang)}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/* ── 모달 셸 ────────────────────────────────────────── */

function ModalShell({ open, onClose, card, children }: { open: boolean; onClose: () => void; card: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 z-40 flex bg-black/50 p-5 backdrop-blur-[3px]"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={cn('m-auto flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]', card)}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── 학생 리포트 모달 ───────────────────────────────── */

export function StudentModal() {
  const { selectedStudent, coachPhase, coachStatus, coachText, closeStudent, notify } = useTeacherReport();
  const lang = useLang();
  const s = selectedStudent ? findStudent(selectedStudent) : null;

  const atRisk = s ? NEED_HELP.includes(s.name) : false;
  const accent = atRisk ? ROSE : FINDLE_GREEN;
  const { weak, strong } = s ? conceptBreakdown(s.mastery) : { weak: [], strong: [] };
  const busyCoach = coachPhase === 'analyzing' || coachPhase === 'writing';

  return (
    <ModalShell open={!!s} onClose={closeStudent} card="max-h-[92%] w-[min(880px,96%)]">
      {s && (
        <>
          {/* 헤더 */}
          <div className="flex shrink-0 items-center gap-3 border-b border-zinc-100 px-5 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: accent }}>
              {s.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[15px] font-extrabold text-zinc-900">
                {s.name}
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', atRisk ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600')}>
                  {atRisk ? pick(STR.atRisk, lang) : pick(STR.onTrackBadge, lang)}
                </span>
              </p>
              <p className="truncate text-[11px] text-zinc-400">{pick(STR.studentReport, lang)} · {pick(CLASS.name, lang)}</p>
            </div>
            <button
              data-demo-id="student-modal-close"
              onClick={() => closeStudent()}
              aria-label={pick(STR.closeLabel, lang)}
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* 본문 */}
          <div className="demo-scroll min-h-0 flex-1 overflow-y-auto bg-zinc-50/60 p-5">
            {/* 요약 스탯 */}
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { v: `${s.accuracy}%`, l: pick(STR.detailAccuracy, lang), c: accent },
                { v: `${s.progress}%`, l: pick(STR.detailCompletion, lang), c: FINDLE_GREEN },
                { v: `#${s.rank}`, l: pick(STR.rankLabel, lang), c: '#3f3f46' },
                { v: pick(s.lastActive, lang), l: pick(STR.lastActiveLabel, lang), c: '#71717a' },
              ].map((x, i) => (
                <div key={i} className="rounded-xl bg-white p-2.5 text-center shadow-sm">
                  <p className="text-[15px] font-extrabold tabular-nums" style={{ color: x.c }}>{x.v}</p>
                  <p className="mt-0.5 text-[9.5px] text-zinc-400">{x.l}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {/* 좌: 레이더 + 추이 */}
              <div className="flex flex-col gap-3">
                <div data-demo-id="student-radar" className="rounded-xl bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <p className="text-[11.5px] font-bold text-zinc-700">{pick(STR.conceptMastery, lang)}</p>
                    <div className="ml-auto flex items-center gap-2.5 text-[9.5px] text-zinc-500">
                      <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: accent }} />{pick(STR.radarStudent, lang)}</span>
                      <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-zinc-400" />{pick(STR.radarClass, lang)}</span>
                    </div>
                  </div>
                  <RadarChart values={s.mastery} compare={CLASS_MASTERY} labels={CONCEPTS.map((c) => pick(c.short, lang))} color={accent} />
                </div>
                <div data-demo-id="student-trend" className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-zinc-700">
                    <TrendingUp className="h-3.5 w-3.5" style={{ color: FINDLE_GREEN }} /> {pick(STR.trendTitle, lang)}
                  </p>
                  <Sparkline data={s.trend} color={accent} />
                </div>
              </div>

              {/* 우: 강점/약점 + 최근 학습 */}
              <div className="flex flex-col gap-3">
                <div data-demo-id="student-strengths" className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100">
                    <p className="text-[10.5px] font-bold text-emerald-700">{pick(STR.strengthsTitle, lang)}</p>
                    <ConceptBars items={strong} color={FINDLE_GREEN} />
                  </div>
                  <div data-demo-id="student-weak" className="rounded-xl bg-amber-50 p-2.5 ring-1 ring-amber-100">
                    <p className="text-[10.5px] font-bold text-amber-700">{pick(STR.studentWeakTitle, lang)}</p>
                    <ConceptBars items={weak.slice(0, 2)} color={AMBER} />
                  </div>
                </div>
                <div data-demo-id="student-recent" className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-[11.5px] font-bold text-zinc-700">{pick(STR.recentTitle, lang)}</p>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {s.recent.map((r, i) => {
                      const good = r.score >= 70;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-24 shrink-0 truncate text-[11px] text-zinc-600">{pick(CONCEPTS[r.c].label, lang)}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                            <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: good ? FINDLE_GREEN : AMBER }} />
                          </div>
                          <span className="w-8 text-right text-[10.5px] font-semibold tabular-nums text-zinc-500">{r.score}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* AI 코칭 */}
            <div data-demo-id="student-coaching" className="mt-3 rounded-xl bg-emerald-50 p-3.5 ring-1 ring-emerald-100">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" /> {pick(STR.coachingTitle, lang)}
              </p>
              {busyCoach && coachText.length === 0 ? (
                <div className="mt-2 flex items-center gap-2 text-[11.5px] font-medium text-emerald-600/80">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {coachStatus}
                </div>
              ) : (
                <p className={cn('mt-1.5 text-[12px] leading-relaxed text-zinc-700', coachPhase === 'writing' && 'stream-caret')}>{coachText}</p>
              )}
            </div>
          </div>

          {/* 액션 */}
          <div className="flex shrink-0 items-center gap-2 border-t border-zinc-100 px-5 py-3">
            <button
              data-demo-id="modal-send-guardian"
              onClick={() => notify(pick(STR.noticeSentGuardian, lang))}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-bold text-white"
              style={{ background: FINDLE_GREEN }}
            >
              <Send className="h-3.5 w-3.5" /> {pick(STR.sendReportBtn, lang)}
            </button>
            <button
              data-demo-id="modal-assign"
              onClick={() => notify(pick(STR.noticeAssigned, lang))}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-4 text-[12.5px] font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              {pick(STR.assignBtn, lang)}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── 전체 발송 모달 ─────────────────────────────────── */

export function DispatchModal() {
  const { dispatchOpen, dispatchPhase, sentCount, closeDispatch } = useTeacherReport();
  const lang = useLang();
  const done = dispatchPhase === 'done';

  return (
    <ModalShell open={dispatchOpen} onClose={closeDispatch} card="max-h-[88%] w-[min(440px,94%)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-100 px-5 py-3.5">
        <Users className="h-4 w-4 shrink-0" style={{ color: FINDLE_GREEN }} />
        <span className="text-[13px] font-bold text-zinc-800">{pick(STR.dispatchTitle, lang)}</span>
        <button
          onClick={() => closeDispatch()}
          aria-label={pick(STR.closeLabel, lang)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <p className="text-[12px] leading-relaxed text-zinc-500">{pick(STR.dispatchIntro, lang)}</p>

        {/* 진행 바 */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <motion.div
            className="h-full rounded-full"
            style={{ background: FINDLE_GREEN }}
            animate={{ width: `${(sentCount / CLASS.students) * 100}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          />
        </div>
        <p className="mt-1.5 text-right text-[10.5px] font-semibold tabular-nums text-zinc-400">
          {sentCount}/{CLASS.students}
        </p>

        {/* 학생별 발송 상태 */}
        <div data-demo-id="dispatch-list" className="mt-2 flex flex-col gap-1.5">
          {ROSTER.map((s, i) => {
            const sent = i < sentCount;
            return (
              <div key={s.name} className="flex items-center gap-2.5 rounded-lg bg-zinc-50 px-3 py-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: sent ? FINDLE_GREEN : '#d4d4d8' }}>
                  {s.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </span>
                <span className="flex-1 truncate text-[12px] font-medium text-zinc-700">{s.name}</span>
                {sent ? (
                  <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {pick(STR.dispatchSent, lang)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10.5px] font-medium text-zinc-400">
                    <Loader2 className="h-3 w-3 animate-spin" /> {pick(STR.dispatchSending, lang)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              data-demo-id="dispatch-success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12px] font-bold text-emerald-700 ring-1 ring-emerald-100"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {fmt(pick(STR.dispatchDone, lang), { n: CLASS.students })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 justify-end border-t border-zinc-100 px-5 py-3">
        <button
          data-demo-id="dispatch-done"
          onClick={() => closeDispatch()}
          disabled={!done}
          className={cn('flex h-9 items-center gap-1.5 rounded-xl px-5 text-[12.5px] font-bold text-white transition-opacity', !done && 'opacity-40')}
          style={{ background: FINDLE_GREEN }}
        >
          {done && <Trophy className="h-3.5 w-3.5" />} {pick(STR.doneBtn, lang)}
        </button>
      </div>
    </ModalShell>
  );
}

/** 액션 확인 토스트 */
export function NoticeToast() {
  const notice = useTeacherReport((s) => s.notice);
  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="pointer-events-none absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-[12px] font-semibold text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {notice}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
