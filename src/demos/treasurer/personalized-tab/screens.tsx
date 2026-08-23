import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Home, MoreHorizontal, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '../../../lib/cn';
import {
  ATTENDANCE,
  BRIEFING,
  FREE_POINTS,
  GOLD_PIECE,
  GOLD_QUOTE,
  GOLD_SPARK,
  INDICATORS,
  METAL_GRID,
  MOVED_ASSETS,
  NEXT_BRIEFINGS,
  POINT_CHIPS,
  POINT_TODAY,
  PORTFOLIO,
  QUICK_BUY,
  QUIZZES,
  SEGMENTS,
  WATCHLIST,
} from './data';
import { usePersonalizedTab } from './state';

/* =======================================================================
   하단 탭바 — 맞춤을 홈 다음 자리에 넣은 5탭 안 (주문 탭 흡수)
   ======================================================================= */

const TABS = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'match', label: '맞춤', Icon: Sparkles },
  { id: 'quote', label: '시세', Icon: TrendingUp },
  { id: 'asset', label: '내자산', Icon: Wallet },
  { id: 'more', label: '더보기', Icon: MoreHorizontal },
] as const;

function TabBar({ dark }: { dark?: boolean }) {
  return (
    <nav
      className={cn(
        'flex shrink-0 items-center justify-between border-t px-4 pb-3.5 pt-3',
        dark ? 'border-white/10 bg-[#0c1526]' : 'border-[#e7ecf3] bg-white',
      )}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = id === 'match';
        const color = active
          ? dark
            ? 'text-white'
            : 'text-[#11203a]'
          : dark
            ? 'text-[#6f8197]'
            : 'text-[#8492a6]';
        return (
          <div key={id} data-demo-id={`tab-${id}`} className="flex flex-1 flex-col items-center gap-1">
            <Icon className={cn('h-[19px] w-[19px]', color)} strokeWidth={1.7} />
            <span className={cn('text-[10px]', color, active && 'font-semibold')}>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

/* =======================================================================
   기준 변경 바텀시트 — 자동 판별된 유저군을 직접 바꾸는 곳
   ======================================================================= */

function SegmentPicker() {
  const { segment, pickerOpen, setSegment, closePicker } = usePersonalizedTab();

  return (
    <AnimatePresence>
      {pickerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePicker}
            className="absolute inset-0 z-10 bg-[#0c1526]/45"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 z-20 rounded-t-[22px] bg-white px-[18px] pb-6 pt-5"
          >
            <p className="text-[16px] font-semibold text-[#0f1b2d]">무엇을 보러 오셨나요</p>
            <p className="mt-1.5 text-[12px] leading-[1.5] text-[#4a5a70]">
              최근 14일 행동으로 자동 판별합니다. 직접 고르면 그 기준으로 맞춤 탭이 다시 조립됩니다.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {SEGMENTS.map((s) => {
                const on = s.id === segment;
                return (
                  <button
                    key={s.id}
                    type="button"
                    data-demo-id={`segment-${s.id}`}
                    onClick={() => setSegment(s.id)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-[12px] border px-4 py-3 text-left',
                      on ? 'border-[#38629f] bg-[#e6eefb]' : 'border-[#e7ecf3] bg-white',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[14px] font-semibold',
                        on ? 'text-[#11203a]' : 'text-[#0f1b2d]',
                      )}
                    >
                      {s.label}
                    </span>
                    <span className={cn('text-[11.5px]', on ? 'text-[#2b4f8a]' : 'text-[#8492a6]')}>
                      {s.basis}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* =======================================================================
   화면 껍데기 — 탭 타이틀 + 판별된 유저군 + 스크롤 본문 + 탭바
   ======================================================================= */

function ScreenShell({
  dark,
  headerRight,
  children,
}: {
  dark?: boolean;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  const { segment, openPicker } = usePersonalizedTab();
  const seg = SEGMENTS.find((s) => s.id === segment) ?? SEGMENTS[0];

  return (
    <div className={cn('relative flex h-full flex-col overflow-hidden', dark ? 'bg-[#0c1526]' : 'bg-white')}>
      <header className="shrink-0 px-[18px] pb-3.5 pt-[22px]">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-[22px] font-semibold tracking-[-0.02em]',
              dark ? 'text-white' : 'text-[#0f1b2d]',
            )}
          >
            맞춤
          </span>
          {headerRight}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-[13px] py-1.5 text-[12.5px] font-semibold',
              dark
                ? 'border border-white/20 bg-white/10 text-[#eaf0f9]'
                : 'bg-[#11203a] text-white',
            )}
          >
            {seg.label}
          </span>
          <button
            type="button"
            data-demo-id="segment-change"
            onClick={openPicker}
            className={cn('text-[11.5px]', dark ? 'text-[#6f8197]' : 'text-[#8492a6]')}
          >
            기준 변경
          </button>
        </div>
      </header>

      <div data-demo-id="screen-scroll" className="demo-scroll flex-1 overflow-y-auto">
        {children}
      </div>

      <TabBar dark={dark} />
      <SegmentPicker />
    </div>
  );
}

/* =======================================================================
   1. 원자재 투자자 — 손익과 주문을 첫 화면으로
   ======================================================================= */

function CommodityScreen() {
  return (
    <ScreenShell
      headerRight={<span className="text-[12.5px] font-semibold text-[#38629f]">알림</span>}
    >
      <div className="px-3.5 pb-4">
        {/* 총자산 · 평가손익 · 주문 */}
        <div data-demo-id="portfolio-card" className="flex flex-col gap-3.5 rounded-[16px] bg-[#11203a] p-[18px]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-[3px]">
              <span className="text-[12px] text-[#aebccf]">총 자산</span>
              <span className="text-[30px] font-semibold tracking-[-0.02em] text-white tabular-nums">
                {PORTFOLIO.total}
                <span className="text-[17px] font-normal">원</span>
              </span>
            </div>
            <div className="flex flex-col items-end gap-[3px]">
              <span className="text-[12px] text-[#aebccf]">평가 손익</span>
              <span className="text-[15px] font-semibold text-[#7aa3e6] tabular-nums">{PORTFOLIO.pnl}</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <div
              data-demo-id="buy-button"
              className="flex-1 rounded-[10px] bg-[#c2563f] py-3 text-center text-[15px] font-semibold text-white"
            >
              매수
            </div>
            <div className="flex-1 rounded-[10px] border border-white/20 bg-white/10 py-3 text-center text-[15px] font-semibold text-[#eaf0f9]">
              매도
            </div>
            <div className="w-[52px] rounded-[10px] border border-white/20 bg-white/10 py-3 text-center text-[13px] text-[#eaf0f9]">
              정기
            </div>
          </div>
        </div>

        {/* 평단 회복 알림 */}
        <div className="mt-3 flex items-center justify-between rounded-[12px] bg-[#eef1f7] px-4 py-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-[#4a5a70]">{PORTFOLIO.avgPrice}</span>
            <span className="text-[13.5px] font-semibold text-[#0f1b2d]">{PORTFOLIO.recover}</span>
          </div>
          <span className="text-[12px] font-semibold text-[#38629f]">알림 받기 ›</span>
        </div>

        {/* 보유 자산 실시간 시세 + 빠른 매수 */}
        <div
          data-demo-id="quote-card"
          className="mt-3.5 flex flex-col gap-3 rounded-[14px] border border-[#d8dfea] p-4"
        >
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-[7px]">
              <span className="text-[15px] font-semibold text-[#0f1b2d]">{GOLD_QUOTE.name}</span>
              <span className="text-[11px] text-[#8492a6]">실시간</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[17px] font-semibold text-[#0f1b2d] tabular-nums">
                {GOLD_QUOTE.price}
                <span className="text-[11px] text-[#8492a6]">{GOLD_QUOTE.unit}</span>
              </span>
              <span className="text-[12.5px] font-semibold text-[#c2563f]">{GOLD_QUOTE.change}</span>
            </div>
          </div>
          <svg viewBox="0 0 300 64" preserveAspectRatio="none" className="block h-16 w-full">
            <polyline
              points={GOLD_SPARK}
              fill="none"
              stroke="#c2563f"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex gap-[7px]">
            {QUICK_BUY.map((amount) => (
              <span
                key={amount}
                className="flex-1 rounded-[9px] bg-[#e6eefb] py-2.5 text-center text-[12.5px] font-semibold text-[#2b4f8a]"
              >
                {amount}
              </span>
            ))}
            <span className="flex-1 rounded-[9px] bg-[#38629f] py-2.5 text-center text-[12.5px] font-semibold text-white">
              직접
            </span>
          </div>
        </div>

        {/* 관심 원자재 3종 */}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          {METAL_GRID.map((m) => (
            <div
              key={m.name}
              className="flex flex-col gap-[3px] rounded-[11px] border border-[#e7ecf3] px-3 py-2.5"
            >
              <span className="text-[12px] text-[#4a5a70]">{m.name}</span>
              <span className="text-[13.5px] font-semibold text-[#0f1b2d]">{m.price}</span>
              <span className="text-[11.5px] font-semibold text-[#c2563f]">{m.change}</span>
            </div>
          ))}
        </div>

        {/* 알파렌즈 브리핑 요약 */}
        <div className="mt-3.5 flex flex-col gap-[7px] rounded-[14px] bg-[#0c1526] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#7aa3e6]">ALPHALENS</span>
            <span className="text-[11px] text-[#6f8197]">오전 9:08</span>
          </div>
          <p className="text-[14.5px] font-semibold leading-[1.45] text-white text-pretty">
            안전자산 쏠림 지속 — 금 <span className="text-[#7aa3e6]">$4,519 (+4.2%)</span>, 환율 1,388원
          </p>
          <span className="text-[12px] text-[#aebccf]">내 보유 종목 3개 중 3개 상승 ›</span>
        </div>

        {/* 실물 금 입금 */}
        <div className="mt-3.5 flex items-center justify-between rounded-[14px] border border-[#d8dfea] px-4 py-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[14.5px] font-semibold text-[#0f1b2d]">실물 금 입금</span>
            <span className="text-[12px] text-[#4a5a70]">집에 잠든 금을 국내 최고가로 매입합니다</span>
          </div>
          <ChevronRight className="h-4 w-4 text-[#8492a6]" />
        </div>
      </div>
    </ScreenShell>
  );
}

/* =======================================================================
   2. 앱테크 유저 — 오늘 할 일을 하나의 진행률로
   ======================================================================= */

function ApptechScreen() {
  return (
    <ScreenShell
      headerRight={
        <span className="rounded-full bg-[#eef1f7] px-[11px] py-[5px] text-[12px] font-semibold text-[#2b4f8a]">
          10P · 골드티켓 400
        </span>
      }
    >
      <div className="px-3.5 pb-4">
        {/* 오늘 받을 수 있는 포인트 — 흩어진 적립을 하나의 진행률로 */}
        <div data-demo-id="progress-card" className="flex flex-col gap-[13px] rounded-[16px] bg-[#e6eefb] p-[18px]">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-[3px]">
              <span className="text-[12.5px] text-[#2b4f8a]">오늘 받을 수 있는 포인트</span>
              <span className="text-[32px] font-semibold tracking-[-0.02em] text-[#11203a] tabular-nums">
                {POINT_TODAY.amount}
                <span className="text-[18px]">P</span>
              </span>
            </div>
            <span className="text-[12px] text-[#4a5a70]">
              {POINT_TODAY.total}개 중 <b className="text-[#11203a]">{POINT_TODAY.done}개</b> 완료
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#2b4f8a]/20">
            <motion.div
              className="h-full rounded-full bg-[#38629f]"
              initial={{ width: 0 }}
              animate={{ width: `${POINT_TODAY.percent}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex gap-[7px]">
            {POINT_CHIPS.map((chip) => (
              <span key={chip} className="rounded-full bg-white px-[11px] py-1.5 text-[11.5px] text-[#4a5a70]">
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* 출석체크 */}
        <div className="mt-3.5 rounded-[14px] border border-[#e7ecf3] px-4 py-3.5">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[14.5px] font-semibold text-[#0f1b2d]">출석체크</span>
            <span className="text-[11.5px] text-[#8492a6]">5일 연속 · 2일 남음</span>
          </div>
          <div className="flex justify-between">
            {ATTENDANCE.map((a) => (
              <div key={a.day} className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold',
                    a.state === 'done' && 'bg-[#38629f] text-white',
                    a.state === 'today' && 'border-2 border-[#38629f] text-[#38629f]',
                    a.state === 'todo' && 'bg-[#eef1f7] text-[#8492a6]',
                    a.state === 'bonus' && 'bg-[#11203a] text-[10px] text-white',
                  )}
                >
                  {a.mark}
                </span>
                <span
                  className={cn(
                    'text-[10.5px]',
                    a.state === 'today' ? 'font-semibold text-[#38629f]' : 'text-[#8492a6]',
                  )}
                >
                  {a.state === 'today' ? '오늘' : a.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 데일리 1분 퀴즈 */}
        <div className="flex items-baseline justify-between px-1 pb-2.5 pt-5">
          <span className="text-[15px] font-semibold text-[#0f1b2d]">데일리 1분 퀴즈</span>
          <span className="text-[11.5px] text-[#8492a6]">2개 남음</span>
        </div>
        <div className="flex flex-col gap-2">
          {QUIZZES.map((q) => (
            <div
              key={q.title}
              className="flex items-center gap-3 rounded-[12px] border border-[#e7ecf3] px-3.5 py-3"
            >
              <span className="h-[38px] w-[38px] shrink-0 rounded-[9px] bg-[#eef1f7]" />
              <span className="flex-1 text-[13.5px] text-[#0f1b2d]">{q.title}</span>
              <span className="rounded-lg bg-[#38629f] px-[11px] py-1.5 text-[12px] font-semibold text-white">
                {q.reward}
              </span>
            </div>
          ))}
        </div>

        {/* 무료 포인트 모으기 */}
        <div className="mt-5 flex flex-col gap-3 rounded-[14px] border border-[#e7ecf3] p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[14.5px] font-semibold text-[#0f1b2d]">무료 포인트 모으기</span>
            <span className="text-[11.5px] text-[#8492a6]">3단계 중 2단계</span>
          </div>
          {FREE_POINTS.map((f, i) => (
            <div
              key={f.title}
              className={cn(
                'flex items-center gap-3',
                i > 0 && 'border-t border-[#e7ecf3] pt-2.5',
              )}
            >
              <span className="flex-1 text-[13px] text-[#0f1b2d]">{f.title}</span>
              <span className="rounded-lg bg-[#e6eefb] px-[11px] py-1.5 text-[12px] font-semibold text-[#2b4f8a]">
                {f.reward}
              </span>
            </div>
          ))}
          <span className="pt-0.5 text-center text-[12.5px] font-semibold text-[#38629f]">
            800만 포인트 받으러 가기 ›
          </span>
        </div>

        {/* 포인트 → 금 조각 전환 훅 (스크롤 중반 한 번만) */}
        <div data-demo-id="next-step" className="mt-4.5 flex flex-col gap-2.5 rounded-[16px] bg-[#11203a] p-[17px]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-[#7aa3e6]">NEXT STEP</span>
          <p className="text-[17px] font-semibold leading-[1.35] text-white text-pretty">
            모은 1,000P를 금 0.005g으로
            <br />
            바꿔두면 시세만큼 늘어납니다
          </p>
          <div className="flex gap-2 text-[11.5px] text-[#aebccf]">
            <span className="rounded-full bg-white/10 px-2.5 py-[5px]">수수료 0원</span>
            <span className="rounded-full bg-white/10 px-2.5 py-[5px]">첫 전환 +500P</span>
          </div>
          <div className="rounded-[11px] bg-[#4d7fd0] py-3 text-center text-[15px] font-semibold text-white">
            포인트로 금 받기
          </div>
        </div>

        {/* 내 금 조각 — 적립이 자산으로 쌓이는 게이지 */}
        <div className="mt-3.5 flex flex-col gap-2.5 rounded-[14px] border border-[#e7ecf3] px-4 py-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[14.5px] font-semibold text-[#0f1b2d]">내 금 조각</span>
            <span className="text-[11.5px] text-[#8492a6]">{GOLD_PIECE.remain}</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-[26px] font-semibold tracking-[-0.03em] text-[#0f1b2d] tabular-nums">
              {GOLD_PIECE.amount}
              <span className="text-[15px]">g</span>
            </span>
            <span className="pb-[5px] text-[12px] text-[#4a5a70]">
              금 시세 <b className="text-[#c2563f]">+3.17%</b>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#eef1f7]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#4d7fd0] to-[#a8c4ee]"
              initial={{ width: 0 }}
              animate={{ width: `${GOLD_PIECE.percent}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}

/* =======================================================================
   3. 시세·뉴스 관심층 — 브리핑을 첫 화면으로 (이 유저군만 다크)
   ======================================================================= */

function BriefingScreen() {
  return (
    <ScreenShell
      dark
      headerRight={<span className="text-[12.5px] font-semibold text-[#7aa3e6]">알림</span>}
    >
      <div className="pb-4">
        <div className="flex items-center justify-between px-[18px] pb-1">
          <span className="font-mono text-[11px] tracking-[0.22em] text-[#eaf0f9]">⚡ BRIEFING</span>
          <span className="text-[11.5px] text-[#6f8197]">{BRIEFING.time}</span>
        </div>

        {/* 오늘 브리핑 헤드라인 */}
        <div className="px-[18px] pt-3.5">
          <span className="text-[12px] text-[#6f8197]">지금 시장</span>
          <p className="mt-2 text-[25px] font-semibold leading-[1.28] tracking-[-0.02em] text-white text-pretty">
            {BRIEFING.headlineLead}
            <span className="text-[#e08b76]">{BRIEFING.headlineAccent}</span>
            {BRIEFING.headlineTail}
          </p>
          <p className="mt-3 text-[13.5px] leading-[1.55] text-[#aebccf]">
            금 $4,519<span className="text-[#6fbf9d]">(+4.2%)</span> 급등 · 환율 1,388원
            <span className="text-[#e08b76]">(-1.8%)</span> · 기술주 <span className="text-[#e08b76]">-4.9%</span>
          </p>
        </div>

        {/* 주요 지표 */}
        <div className="px-[18px] pt-[22px]">
          <span className="text-[12px] text-[#6f8197]">주요 지표</span>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4">
            {INDICATORS.map((i) => (
              <div key={i.label} className="flex flex-col gap-0.5">
                <span className="text-[11.5px] text-[#6f8197]">{i.label}</span>
                <span className="text-[23px] font-semibold text-white tabular-nums">{i.value}</span>
                <span className={cn('text-[12px]', i.up ? 'text-[#6fbf9d]' : 'text-[#e08b76]')}>
                  {i.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 이 뉴스로 움직인 자산 — 뉴스 소비를 거래로 잇는 유일한 진입점 */}
        <div
          data-demo-id="moved-assets"
          className="mx-3.5 mt-[22px] flex flex-col gap-2.5 rounded-[14px] bg-white/[0.06] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-semibold text-white">이 뉴스로 움직인 자산</span>
            <span className="text-[11.5px] text-[#6f8197]">트레져러에서 거래 가능</span>
          </div>
          {MOVED_ASSETS.map((a) => (
            <div key={a.name} className="flex items-center gap-2.5 border-t border-white/10 py-2.5">
              <span className="flex-1 text-[13px] text-[#eaf0f9]">{a.name}</span>
              <span className="text-[13px] font-semibold text-[#6fbf9d]">{a.change}</span>
              <span
                className={cn(
                  'rounded-lg px-3 py-1.5 text-[12px] font-semibold',
                  a.primary
                    ? 'bg-[#4d7fd0] text-white'
                    : 'border border-white/20 bg-white/10 text-[#eaf0f9]',
                )}
              >
                매수
              </span>
            </div>
          ))}
        </div>

        {/* 관심 자산 */}
        <div className="px-[18px] pt-[22px]">
          <div className="mb-2.5 flex items-baseline justify-between">
            <span className="text-[12px] text-[#6f8197]">관심 자산</span>
            <span className="text-[11.5px] text-[#6f8197]">편집</span>
          </div>
          {WATCHLIST.map((w, i) => (
            <div
              key={w.name}
              className={cn(
                'flex items-center gap-3 border-t border-white/10 py-2.5',
                i === WATCHLIST.length - 1 && 'border-b',
              )}
            >
              <span className="flex-1 text-[13.5px] text-[#eaf0f9]">{w.name}</span>
              <span className="text-[13px] text-[#eaf0f9] tabular-nums">{w.price}</span>
              <span
                className={cn(
                  'w-[58px] text-right text-[12.5px] font-semibold',
                  w.up ? 'text-[#6fbf9d]' : 'text-[#e08b76]',
                )}
              >
                {w.change}
              </span>
            </div>
          ))}
        </div>

        {/* 이어서 볼 브리핑 */}
        <div className="px-[18px] pt-[22px]">
          <span className="text-[12px] text-[#6f8197]">이어서 볼 브리핑</span>
          <div className="mt-2.5">
            {NEXT_BRIEFINGS.map((n) => (
              <div key={n.title} className="flex items-center gap-3 border-t border-white/10 py-3">
                <span className="flex-1 text-[13.5px] leading-[1.4] text-[#eaf0f9]">{n.title}</span>
                <span className="text-[11px] text-[#6f8197]">{n.read}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 알파렌즈 */}
        <div className="mx-3.5 mt-[22px] flex items-center justify-between rounded-[14px] bg-[#eaf0f9] p-4">
          <div className="flex flex-col gap-[3px]">
            <span className="text-[14.5px] font-semibold text-[#0f1b2d]">알파렌즈 무료 이용</span>
            <span className="text-[11.5px] text-[#4a5a70]">애널리스트가 개발한 전문가도 사용하는 AI</span>
          </div>
          <span className="rounded-[9px] bg-[#11203a] px-3.5 py-2 text-[12.5px] font-semibold text-white">
            바로가기
          </span>
        </div>
      </div>
    </ScreenShell>
  );
}

/* =======================================================================
   화면 전환 래퍼 — 같은 맞춤 탭이 유저군에 따라 다시 조립된다
   ======================================================================= */

export function AppScreens() {
  const segment = usePersonalizedTab((s) => s.segment);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={segment}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        {segment === 'commodity' && <CommodityScreen />}
        {segment === 'apptech' && <ApptechScreen />}
        {segment === 'briefing' && <BriefingScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
