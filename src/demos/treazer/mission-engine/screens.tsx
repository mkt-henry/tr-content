import { Check, ChevronLeft, Gift, Lock, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { BottomNav, Coin, GoldPill, Wordmark } from '../_shared/ui';
import { AD_DURATION_SEC, DAILY_MISSIONS, TIMED_MISSIONS } from './data';
import { DAILY_PROGRESS_STEPS, useMissionEngine } from './state';

/** 자정 기준 분 → "11:58 AM" 표기 */
function formatClock(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/** 작은 보상 필 (주황 캡슐 — Mission.png의 골드 배지) */
function RewardPill({ amount }: { amount: number | string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-2.5 py-1.5 text-[13px] font-bold text-white">
      <Coin className="h-4 w-4 text-[8px]" /> {amount}
    </span>
  );
}

/** 진행도 바 — current/total 비율을 주황으로 채움 */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min((current / total) * 100, 100);
  return (
    <div className="mt-2.5">
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          className="h-full rounded-full bg-orange-500"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <p className="mt-1 text-right text-[11px] font-semibold tabular-nums text-zinc-400">
        {current}/{total}
      </p>
    </div>
  );
}

/** 데일리 미션 카드 — 아이콘 + 제목 + 보상 + 진행도 + (완료 시) 보상 받기 */
function DailyCard({ id }: { id: string }) {
  const def = DAILY_MISSIONS.find((m) => m.id === id)!;
  const rt = useMissionEngine((s) => s.daily[id]);
  const claimDaily = useMissionEngine((s) => s.claimDaily);
  const Icon = def.icon;
  const complete = rt.progress >= DAILY_PROGRESS_STEPS;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
          <Icon className="h-5 w-5 text-orange-500" />
        </div>
        <p className="flex-1 text-[13.5px] font-bold leading-snug text-zinc-900">{def.title}</p>
        <RewardPill amount={def.reward} />
      </div>
      <ProgressBar current={rt.progress} total={DAILY_PROGRESS_STEPS} />
      <button
        type="button"
        data-demo-id={`daily-claim-${id}`}
        onClick={() => complete && !rt.claimed && claimDaily(id)}
        disabled={!complete || rt.claimed}
        className={cn(
          'mt-2 w-full rounded-xl py-2.5 text-[13px] font-bold transition-colors',
          rt.claimed
            ? 'bg-emerald-50 text-emerald-600'
            : complete
              ? 'bg-orange-500 text-white'
              : 'bg-zinc-100 text-zinc-400',
        )}
      >
        {rt.claimed ? (
          <span className="flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4" strokeWidth={3} /> Claimed
          </span>
        ) : complete ? (
          'Claim Reward'
        ) : (
          'In Progress'
        )}
      </button>
    </div>
  );
}

/** 시간제 미션 카드 — locked(자물쇠/회색) / open(주황 활성) / progress / done */
function TimedCard({ id }: { id: string }) {
  const def = TIMED_MISSIONS.find((m) => m.id === id)!;
  const rt = useMissionEngine((s) => s.timed[id]);
  const enterTimed = useMissionEngine((s) => s.enterTimed);
  const startAd = useMissionEngine((s) => s.startAd);
  const Icon = def.icon;

  const locked = rt.status === 'locked';
  const open = rt.status === 'open';
  const progress = rt.status === 'progress';
  const done = rt.status === 'done';
  const filled = rt.progress >= 5;

  return (
    <motion.div
      data-demo-id={`timed-card-${id}`}
      animate={open && rt.progress === 0 ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-2xl p-4 shadow-sm transition-colors',
        locked ? 'bg-white opacity-60' : 'bg-white',
        open && rt.progress === 0 && 'ring-2 ring-orange-400',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-zinc-500">
          {locked ? (
            <Lock className="h-4 w-4 text-amber-500" />
          ) : (
            <Icon className="h-4 w-4 text-orange-500" />
          )}
          {def.window}
        </span>
        <span className="flex items-center gap-1 text-[12px] font-bold text-zinc-500">
          <Coin className={cn('h-4 w-4 text-[8px]', locked && 'grayscale')} /> {def.rewardRange}
        </span>
      </div>

      <p className={cn('mt-2.5 text-[16px] font-bold', locked ? 'text-zinc-400' : 'text-zinc-900')}>
        {def.title}
      </p>
      <p className="text-[12px] text-zinc-400">Complete 1 unit · 5 questions</p>

      {progress && <ProgressBar current={rt.progress} total={5} />}

      {/* 상태별 CTA */}
      {locked && (
        <div className="mt-3 w-full rounded-xl bg-zinc-100 py-3 text-center text-[13px] font-bold text-zinc-400">
          Opens Soon
        </div>
      )}
      {open && (
        <button
          type="button"
          data-demo-id={`timed-open-${id}`}
          onClick={() => enterTimed(id)}
          className="mt-3 w-full rounded-xl bg-orange-500 py-3 text-[13px] font-bold text-white"
        >
          OPEN · Start Now
        </button>
      )}
      {progress && (
        <button
          type="button"
          data-demo-id={`timed-reward-${id}`}
          onClick={() => filled && startAd(id)}
          disabled={!filled}
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-[13px] font-bold text-white transition-colors',
            filled ? 'bg-orange-500' : 'bg-zinc-300',
          )}
        >
          <Gift className="h-4 w-4" /> Claim Reward
        </button>
      )}
      {done && (
        <div className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-3 text-[13px] font-bold text-emerald-600">
          <Check className="h-4 w-4" strokeWidth={3} /> Completed
        </div>
      )}
    </motion.div>
  );
}

export function MissionScreen() {
  const gold = useMissionEngine((s) => s.gold);
  const goldFlash = useMissionEngine((s) => s.goldFlash);
  const clockMin = useMissionEngine((s) => s.clockMin);

  return (
    <div className="flex h-full flex-col bg-[#f4f4f6]">
      <header className="flex shrink-0 items-center justify-between bg-[#f4f4f6] px-5 pb-2 pt-4">
        <Wordmark className="text-[20px]" />
        <GoldPill amount={gold} flash={goldFlash} />
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        {/* 타이틀 + 가짜 시계 */}
        <div className="flex items-end justify-between px-1">
          <h1 className="text-[28px] font-extrabold tracking-tight text-zinc-900">Mission</h1>
          <motion.div
            data-demo-id="clock"
            key={clockMin}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[13px] font-bold tabular-nums text-zinc-700">
              {formatClock(clockMin)}
            </span>
          </motion.div>
        </div>

        {/* Daily Mission */}
        <h2 className="mb-2.5 mt-5 px-1 text-[17px] font-bold text-zinc-900">Daily Mission</h2>
        <div className="space-y-3">
          {DAILY_MISSIONS.map((m) => (
            <DailyCard key={m.id} id={m.id} />
          ))}
        </div>

        {/* Timed Mission */}
        <h2 className="mb-2.5 mt-6 px-1 text-[17px] font-bold text-zinc-900">Timed Mission</h2>
        <div className="space-y-3">
          {TIMED_MISSIONS.map((m) => (
            <TimedCard key={m.id} id={m.id} />
          ))}
        </div>
      </div>

      <BottomNav active="mission" />
    </div>
  );
}

/** 카운트다운 진행 링 — 남은 비율을 SVG stroke로 표현 */
function CountdownRing({ remaining }: { remaining: number }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const ratio = remaining / AD_DURATION_SEC;
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="#f97316"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - ratio) }}
          transition={{ duration: 0.4, ease: 'linear' }}
        />
      </svg>
      <span className="absolute text-[34px] font-extrabold tabular-nums text-white">{remaining}</span>
    </div>
  );
}

/** 리워디드 광고 시청 화면 — 30초(압축) 카운트다운 후 보상 지급 */
export function AdScreen() {
  const adRemaining = useMissionEngine((s) => s.adRemaining);
  const adReward = useMissionEngine((s) => s.adReward);

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-white">
      <header className="relative flex shrink-0 items-center justify-center px-5 py-3.5">
        <ChevronLeft className="absolute left-4 h-5 w-5 text-zinc-600" />
        <span className="text-[14px] font-semibold text-zinc-400">Rewarded Ad</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {/* 광고 크리에이티브 자리 */}
        <div className="flex h-40 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/10 ring-1 ring-white/10">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <Play className="h-9 w-9 text-orange-400" fill="currentColor" />
            <span className="text-[12px] font-medium">Sponsored Video</span>
          </div>
        </div>

        <div className="mt-10">
          <CountdownRing remaining={adRemaining} />
        </div>

        <p className="mt-6 text-center text-[13px] text-zinc-400">
          Watch to earn your reward
          <br />
          <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-orange-400">
            <Coin className="h-4 w-4 text-[8px]" /> +{adReward} Gold
          </span>
        </p>
      </div>
    </div>
  );
}

/** 화면 전환 래퍼 — Mobile/Desktop 공용 */
export function AppScreens() {
  const screen = useMissionEngine((s) => s.screen);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, x: screen === 'ad' ? 40 : -40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: screen === 'ad' ? -40 : 40 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        {screen === 'mission' ? <MissionScreen /> : <AdScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
