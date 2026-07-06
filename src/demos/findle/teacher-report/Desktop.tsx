import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Lock,
  MoreVertical,
  Plus,
  RotateCw,
  Send,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type { DemoComponentProps } from '../../../registry/types';
import type { L } from '../_shared/i18n';
import { pick, useLang } from '../_shared/i18n';
import { FINDLE_GREEN, FindleMark } from '../_shared/ui';
import { STR } from './data';
import { Dashboard, DispatchModal, Header, NoticeToast, ReportPanel, StudentModal } from './screens';
import { useTeacherReport } from './state';

const KICKER: L = { ko: 'FINDLE · 교사 대시보드', en: 'FINDLE · TEACHER DASHBOARD' };

type FlowStep = 'overview' | 'report' | 'send' | 'student';

const STEP_COPY: Record<FlowStep, { tag: L; title: L; desc: L }> = {
  overview: {
    tag: { ko: '개요', en: 'OVERVIEW' },
    title: { ko: '반 전체를 한눈에', en: 'The whole class at a glance' },
    desc: {
      ko: '평균 정답률·완료율·참여율과 학생별 진도를 한 화면에서 확인합니다.',
      en: 'Accuracy, completion, participation, and every student’s progress in one view.',
    },
  },
  report: {
    tag: { ko: 'AI 리포트', en: 'AI REPORT' },
    title: { ko: 'AI가 반 리포트를 자동 작성', en: 'AI writes the class report' },
    desc: {
      ko: '반 강점·약점 개념, 도움이 필요한 학생, 실행 권고까지 자동으로 정리합니다.',
      en: 'Auto-summarised strengths, weak concepts, at-risk students, and next steps.',
    },
  },
  send: {
    tag: { ko: '자동 발송', en: 'AUTO-SEND' },
    title: { ko: '전 학생 맞춤 리포트 발송', en: 'Send personalized reports to all' },
    desc: {
      ko: '학생별 맞춤 리포트를 학생과 보호자에게 한 번에 발송합니다.',
      en: 'Deliver each student’s personalized report to students and guardians at once.',
    },
  },
  student: {
    tag: { ko: '학생 리포트', en: 'STUDENT REPORT' },
    title: { ko: '학생별 강점·약점 심층 분석', en: 'Deep-dive into each student' },
    desc: {
      ko: '개념 숙련도 오각형, 정답률 추이, AI 코칭으로 개별 지도를 돕습니다.',
      en: 'A concept-mastery radar, accuracy trend, and AI coaching for every student.',
    },
  },
};

const RAIL: { key: FlowStep; icon: ComponentType<{ className?: string; style?: React.CSSProperties }>; label: L }[] = [
  { key: 'overview', icon: LayoutDashboard, label: { ko: '개요', en: 'Overview' } },
  { key: 'report', icon: Sparkles, label: { ko: '리포트', en: 'Report' } },
  { key: 'send', icon: Send, label: { ko: '발송', en: 'Send' } },
  { key: 'student', icon: UserRound, label: { ko: '학생', en: 'Student' } },
];
const RAIL_INDEX: Record<FlowStep, number> = { overview: 0, report: 1, send: 2, student: 3 };
const DIM_LINE = 'rgba(255,255,255,0.09)';

/**
 * 데스크탑 = 기능 설명 레이아웃 — 앱 창(위) + 흐름 내레이션 밴드(하단).
 * chromeless 라 줌이 없다. 유동(flex) 레이아웃으로 두어 CSS transform을 두지 않는다
 * — 가짜 커서 좌표(offset 기반 cameraNaturalCenter)가 실제 화면 위치와 정확히 일치하도록.
 */
export function Desktop(_: DemoComponentProps) {
  return (
    <div className="relative flex h-full w-full flex-col gap-[1%] overflow-hidden bg-[#0b1310] p-[1%]">
      {/* 데모 UI = 16:9 브라우저 창 (남는 세로 공간에 맞춰 가운데 정렬) */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <AppWindow />
      </div>
      <NarrationBand />
    </div>
  );
}

/** 실제 데스크탑 브라우저 창 — 탭 스트립 + 주소창 툴바 + 대시보드, 모달 오버레이 포함 */
function AppWindow() {
  const lang = useLang();
  return (
    <div className="relative flex aspect-[16/9] h-full max-w-full flex-col overflow-hidden rounded-xl bg-[#f1f3f5] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
      {/* 브라우저 크롬 — 슬림 */}
      <div className="shrink-0 bg-[#1b1a20]">
        {/* 탭 스트립 */}
        <div className="flex items-end gap-1.5 px-2.5 pt-1.5">
          <div className="mb-[7px] flex items-center gap-1.5 pr-0.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex h-[26px] items-center gap-1.5 rounded-t-md bg-[#2b2a32] px-2.5 text-[10.5px] font-medium text-zinc-200">
            <FindleMark className="h-3 w-3 text-[7px]" />
            <span className="max-w-[150px] truncate">{pick(STR.appTitle, lang)}</span>
            <X className="h-2.5 w-2.5 text-zinc-500" />
          </div>
          <Plus className="mb-[7px] h-3 w-3 text-zinc-500" />
        </div>
        {/* 주소창 툴바 */}
        <div className="flex items-center gap-2.5 bg-[#2b2a32] px-3 py-1.5">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <ChevronLeft className="h-3.5 w-3.5" />
            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
            <RotateCw className="h-3 w-3" />
          </div>
          <div className="flex h-[22px] flex-1 items-center gap-1.5 rounded-full bg-black/25 px-3 text-[10.5px] text-zinc-300">
            <Lock className="h-2.5 w-2.5 shrink-0 text-emerald-400/80" />
            <span className="truncate">findle.io/teacher/dashboard</span>
            <Star className="ml-auto h-3 w-3 shrink-0 text-zinc-500" />
          </div>
          <MoreVertical className="h-3.5 w-3.5 text-zinc-500" />
        </div>
      </div>

      {/* 앱 본문 */}
      <div className="relative min-h-0 flex-1">
        <div className="flex h-full flex-col" style={{ background: '#f1f3f5' }}>
          <Header />
          <div className="grid min-h-0 flex-1 grid-cols-[1fr_400px] gap-3 p-3">
            <div className="demo-scroll min-h-0 overflow-y-auto">
              <Dashboard />
            </div>
            <ReportPanel />
          </div>
        </div>
        <StudentModal />
        <DispatchModal />
        <NoticeToast />
      </div>
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.28em]"
      style={{ background: 'rgba(21,160,106,0.14)', color: FINDLE_GREEN }}
    >
      {children}
    </span>
  );
}

/** 하단 흐름 내레이션 밴드 — 데모 상태에 따라 STEP·제목·설명·스텝퍼가 전환된다 */
function NarrationBand() {
  const lang = useLang();
  const step = useTeacherReport((s) => s.flow) as FlowStep;
  const copy = STEP_COPY[step];
  const activeIdx = RAIL_INDEX[step];

  return (
    <div
      className="flex shrink-0 items-center gap-8 overflow-hidden rounded-2xl px-8 ring-1 ring-white/10"
      style={{ height: 138, background: 'linear-gradient(180deg,#0f1a15,#0a120e)' }}
    >
      {/* 좌: 전환 카피 */}
      <div className="min-w-0 flex-1">
        <Kicker>{pick(KICKER, lang)}</Kicker>
        <div className="mt-2 min-h-[70px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-5 items-center rounded-md px-2 font-mono text-[10.5px] font-bold tracking-[0.14em] text-white"
                  style={{ background: FINDLE_GREEN }}
                >
                  STEP {activeIdx + 1}
                </span>
                <span className="text-[11.5px] font-bold uppercase tracking-[0.2em]" style={{ color: FINDLE_GREEN }}>
                  {pick(copy.tag, lang)}
                </span>
              </div>
              <h1 className="mt-1.5 text-[25px] font-extrabold leading-[1.1] tracking-tight text-white">
                {pick(copy.title, lang)}
              </h1>
              <p className="mt-1 text-[13.5px] leading-snug text-zinc-400">{pick(copy.desc, lang)}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 우: 진행 스텝퍼 */}
      <div className="flex w-[520px] shrink-0 items-start">
        {RAIL.map((r, i) => {
          const Icon = r.icon;
          const done = i < activeIdx;
          const active = i === activeIdx;
          const leftFilled = i <= activeIdx;
          const rightFilled = i < activeIdx;
          return (
            <div key={r.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span className="h-[2px] flex-1 rounded-full" style={{ background: i === 0 ? 'transparent' : leftFilled ? FINDLE_GREEN : DIM_LINE }} />
                <motion.span
                  animate={{ scale: active ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: done || active ? FINDLE_GREEN : 'rgba(255,255,255,0.05)',
                    boxShadow: active ? '0 0 0 4px rgba(21,160,106,0.22)' : 'none',
                    border: done || active ? 'none' : `1px solid ${DIM_LINE}`,
                  }}
                >
                  {done ? <Check className="h-[18px] w-[18px] text-white" strokeWidth={3} /> : <Icon className="h-[18px] w-[18px]" style={{ color: active ? '#ffffff' : '#6b7280' }} />}
                </motion.span>
                <span className="h-[2px] flex-1 rounded-full" style={{ background: i === RAIL.length - 1 ? 'transparent' : rightFilled ? FINDLE_GREEN : DIM_LINE }} />
              </div>
              <span className="mt-2 text-[12px] font-semibold transition-colors" style={{ color: active ? '#ffffff' : done ? '#d4d4d8' : '#52525b' }}>
                {pick(r.label, lang)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
