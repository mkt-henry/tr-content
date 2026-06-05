import { Check, ChevronLeft, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { BottomNav, Coin, GoldPill, Wordmark } from '../_shared/ui';
import {
  BRACKET,
  CONTESTANTS,
  GOLD_REWARD,
  TOURNAMENT_TITLE_KO,
  TOURNAMENT_TITLE_VI,
  type Contestant,
} from './data';
import { useFavoritePick } from './state';

/** 사진 대신 쓰는 그라디언트 플레이스홀더 (이모지 + 이니셜) */
function PlaceholderArt({ contestant }: { contestant: Contestant }) {
  return (
    <div className={cn('relative h-full w-full bg-gradient-to-br', contestant.gradient)}>
      <span className="absolute inset-0 flex items-center justify-center text-[44px] drop-shadow">
        {contestant.emoji}
      </span>
      <span className="absolute right-2 top-2 text-[11px] font-black text-white/80">
        {contestant.name[0]}
      </span>
    </div>
  );
}

/** 대결 카드 한 장 — 클릭 시 선택, 선택되면 확대+체크, 패자는 흐려짐 */
function ContestantCard({
  contestant,
  picked,
  isPicked,
}: {
  contestant: Contestant;
  picked: string | null;
  isPicked: boolean;
}) {
  const isLoser = picked !== null && !isPicked;
  const pick = useFavoritePick((s) => s.pick);

  return (
    <motion.button
      type="button"
      data-demo-id={`pick-${contestant.id}`}
      onClick={() => pick(contestant.id)}
      animate={{ scale: isPicked ? 1.03 : isLoser ? 0.95 : 1, opacity: isLoser ? 0.45 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={cn(
        'relative flex-1 overflow-hidden rounded-2xl text-left ring-2 transition-colors',
        isPicked ? 'ring-orange-500' : 'ring-transparent',
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <PlaceholderArt contestant={contestant} />
      </div>

      {/* 선택 체크 오버레이 */}
      <AnimatePresence>
        {isPicked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 shadow-lg"
          >
            <Check className="h-5 w-5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white px-3 py-2.5">
        <p className="text-[14px] font-bold text-zinc-900">{contestant.name}</p>
        <p className="text-[11px] text-zinc-500">{contestant.group}</p>
      </div>
    </motion.button>
  );
}

export function TournamentScreen() {
  const { gold, goldFlash, matchIndex, picked } = useFavoritePick();
  const match = BRACKET[matchIndex];

  // 같은 라운드 내 진행 위치 (예: Round of 16 → n/4) 계산
  const roundMatches = BRACKET.filter((m) => m.round === match.round);
  const roundStart = BRACKET.findIndex((m) => m.round === match.round);
  const roundPos = matchIndex - roundStart + 1;

  return (
    <div className="flex h-full flex-col bg-[#f4f4f6]">
      <header className="flex shrink-0 items-center justify-between bg-[#f4f4f6] px-5 pb-2 pt-4">
        <Wordmark className="text-[22px]" />
        <GoldPill amount={gold} flash={goldFlash} />
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        {/* 토너먼트 헤더 + 라운드 진행 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-orange-500" />
            <span className="text-[13px] font-bold text-orange-500">Favorite Pick Tournament</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-zinc-500">{match.round}</span>
            <span className="text-[12px] font-bold tabular-nums text-zinc-400">
              {roundPos}/{roundMatches.length}
            </span>
          </div>
          {/* 라운드 진행 바 */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              className="h-full rounded-full bg-orange-500"
              animate={{ width: `${(roundPos / roundMatches.length) * 100}%` }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            />
          </div>

          {/* 질문 타이틀 — 베트남어 + 한국어 부제 */}
          <h2 className="mt-4 text-[17px] font-bold leading-snug text-zinc-900">{TOURNAMENT_TITLE_VI}</h2>
          <p className="mt-0.5 text-[12px] text-zinc-400">{TOURNAMENT_TITLE_KO}</p>
        </div>

        {/* 대결 카드 2장 + 가운데 VS 뱃지 (매치 전환마다 슬라이드 인) */}
        <div className="relative mt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={matchIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-stretch gap-3"
            >
              <ContestantCard contestant={match.a} picked={picked} isPicked={picked === match.a.id} />
              <ContestantCard contestant={match.b} picked={picked} isPicked={picked === match.b.id} />
            </motion.div>
          </AnimatePresence>

          {/* 가운데 VS 뱃지 */}
          <div className="pointer-events-none absolute left-1/2 top-[36%] z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-[13px] font-black text-orange-400 shadow-lg ring-2 ring-white">
              VS
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-zinc-400">
          Tap the one you like — finishing the tournament checks you in.
        </p>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

/** "다른 유저들의 선택" 한 줄 — % 막대가 차오르는 애니메이션 */
function VoteBar({ contestant, leading }: { contestant: Contestant; leading: boolean }) {
  const revealed = useFavoritePick((s) => s.statsRevealed);
  return (
    <div data-demo-id={`vote-${contestant.id}`}>
      <div className="flex items-center justify-between text-[12px]">
        <span className={cn('font-semibold', leading ? 'text-orange-500' : 'text-zinc-600')}>
          {contestant.name} · {contestant.group}
        </span>
        <motion.span
          className="font-bold tabular-nums text-zinc-400"
          animate={{ opacity: revealed ? 1 : 0 }}
        >
          {contestant.votePct}%
        </motion.span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <motion.div
          className={cn('h-full rounded-full', leading ? 'bg-orange-500' : 'bg-zinc-300')}
          initial={{ width: 0 }}
          animate={{ width: revealed ? `${contestant.votePct}%` : 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.8 }}
        />
      </div>
    </div>
  );
}

export function ResultScreen() {
  const championId = useFavoritePick((s) => s.championId);
  const champion = championId ? CONTESTANTS[championId] : null;
  if (!champion) return null;

  // "다른 유저들의 선택" — 득표율 상위 5명
  const topVotes = Object.values(CONTESTANTS)
    .slice()
    .sort((a, b) => b.votePct - a.votePct)
    .slice(0, 5);

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="relative flex shrink-0 items-center justify-center px-5 py-3.5">
        <ChevronLeft className="absolute left-4 h-5 w-5 text-zinc-700" />
        <span className="text-[16px] font-semibold text-zinc-900">Result</span>
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-5 pb-4">
        {/* 우승자 카드 + 컨페티 느낌 연출 */}
        <div className="relative">
          {/* 컨페티 닷 */}
          {Array.from({ length: 14 }, (_, i) => (
            <motion.span
              key={i}
              className={cn(
                'absolute top-2 h-1.5 w-1.5 rounded-full',
                i % 3 === 0 ? 'bg-orange-400' : i % 3 === 1 ? 'bg-amber-300' : 'bg-rose-400',
              )}
              style={{ left: `${(i * 7 + 6) % 96}%` }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: [0, 120], opacity: [1, 1, 0] }}
              transition={{ duration: 1.4, delay: 0.1 + (i % 5) * 0.08, ease: 'easeIn' }}
            />
          ))}

          <motion.div
            data-demo-id="champion-card"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="mx-auto mt-2 w-[62%] overflow-hidden rounded-3xl ring-4 ring-orange-400 shadow-xl"
          >
            <div className="aspect-[4/3] w-full">
              <PlaceholderArt contestant={champion} />
            </div>
            <div className="bg-white px-4 py-3 text-center">
              <p className="text-[16px] font-bold text-zinc-900">{champion.name}</p>
              <p className="text-[12px] text-zinc-500">{champion.group}</p>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <Trophy className="h-4 w-4 text-orange-500" />
          <span className="text-[14px] font-bold text-zinc-900">Your Pick is the Champion!</span>
        </div>

        {/* 골드 보상 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-amber-50 px-4 py-2 ring-1 ring-amber-300"
        >
          <Coin className="h-4 w-4 text-[9px]" />
          <span className="text-[13px] font-bold text-amber-600">+{GOLD_REWARD} Gold earned</span>
        </motion.div>

        {/* 다른 유저들의 선택 — 투표 통계 바 */}
        <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
          <p className="text-[13px] font-bold text-zinc-900">다른 유저들의 선택</p>
          <p className="text-[11px] text-zinc-400">Lựa chọn của mọi người</p>
          <div className="mt-3 space-y-3">
            {topVotes.map((cand) => (
              <VoteBar key={cand.id} contestant={cand} leading={cand.id === champion.id} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

/** 화면 전환 래퍼 — Mobile/Desktop 공용 */
export function AppScreens() {
  const screen = useFavoritePick((s) => s.screen);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, x: screen === 'result' ? 40 : -40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: screen === 'result' ? -40 : 40 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        {screen === 'tournament' ? <TournamentScreen /> : <ResultScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
