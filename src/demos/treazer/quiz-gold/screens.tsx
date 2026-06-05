import { CalendarCheck, Check, ChevronLeft, ChevronRight, Newspaper, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { BottomNav, Coin, GoldPill, Wordmark } from '../_shared/ui';
import { QUESTIONS } from './data';
import { useQuizGold } from './state';

/** 7일 출석 스트릭 — Day 4·7은 x2 부스트 */
function StreakRow({ streak }: { streak: number }) {
  return (
    <div className="mt-4 flex justify-between">
      {Array.from({ length: 7 }, (_, i) => {
        const day = i + 1;
        const done = day <= streak;
        const boost = day === 4 || day === 7;
        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <motion.div
              animate={done ? { scale: [1, 1.15, 1] } : {}}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold',
                done ? 'bg-orange-500 text-white' : 'bg-zinc-200 text-zinc-400',
              )}
            >
              {boost && !done ? 'x2' : <Check className="h-4 w-4" strokeWidth={3} />}
            </motion.div>
            <span className="text-[10px] text-zinc-500">Day {day}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HomeScreen() {
  const { gold, goldFlash, streak, checkedToday, startQuiz } = useQuizGold();

  return (
    <div className="flex h-full flex-col bg-[#f4f4f6]">
      <header className="flex shrink-0 items-center justify-between bg-[#f4f4f6] px-5 pb-2 pt-4">
        <Wordmark className="text-[22px]" />
        <GoldPill amount={gold} flash={goldFlash} />
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        {/* 출석 카드 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-[15px] font-bold text-zinc-900">{streak} Day Streak</p>
              <p className="text-[12px] text-zinc-500">Check in daily to earn gold</p>
            </div>
          </div>
          <StreakRow streak={streak} />
          <button
            type="button"
            data-demo-id="checkin-btn"
            onClick={() => !checkedToday && startQuiz()}
            className={cn(
              'mt-4 w-full rounded-xl py-3 text-[14px] font-bold text-white transition-colors',
              checkedToday ? 'bg-amber-400' : 'bg-orange-500',
            )}
          >
            {checkedToday ? 'Earn More Gold' : "Today's Check-In Quiz"}
          </button>
          <p className="mt-2 text-center text-[10.5px] text-zinc-400">
            Completing the Daily Quiz automatically checks you in.
          </p>
        </div>

        {/* 경제 퀴즈 미리보기 */}
        <div className="mt-5 flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-zinc-900">Economic Quiz</h2>
          <ChevronRight className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="mt-2 space-y-2">
          {[
            { icon: TrendingUp, text: '환율이 오르면 수출 기업에 유리할까요?', reward: 'up to 50' },
            { icon: Newspaper, text: 'ETF와 펀드의 가장 큰 차이는 무엇일까요?', reward: 'up to 50' },
          ].map(({ icon: Icon, text, reward }) => (
            <div key={text} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <Icon className="h-4.5 w-4.5 text-orange-500" />
              </div>
              <p className="flex-1 text-[12.5px] font-medium leading-snug text-zinc-700">{text}</p>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <Coin className="h-3.5 w-3.5 text-[8px]" /> {reward}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

export function QuizScreen() {
  const { earned, qIndex, selected, revealed, selectOption, submit, next } = useQuizGold();
  const q = QUESTIONS[qIndex];

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="relative flex shrink-0 items-center justify-center px-5 py-3.5">
        <ChevronLeft className="absolute left-4 h-5 w-5 text-zinc-700" />
        <span className="text-[16px] font-semibold text-zinc-900">Quiz</span>
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-5">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold text-orange-500">Q.{qIndex + 1}</span>
          <span className="flex items-center gap-1.5 text-[14px] font-bold text-zinc-400">
            <Coin className="h-4.5 w-4.5 text-[9px]" />
            <motion.span key={earned} initial={{ scale: 1.4, color: '#f59e0b' }} animate={{ scale: 1, color: '#a1a1aa' }}>
              {earned}
            </motion.span>
          </span>
        </div>

        <h2 className="mt-3 text-[20px] font-bold leading-snug text-zinc-900">{q.question}</h2>

        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answer;
            const isSelected = i === selected;
            return (
              <button
                key={opt}
                type="button"
                data-demo-id={`quiz-option-${i}`}
                onClick={() => selectOption(i)}
                className={cn(
                  'w-full rounded-xl border-2 px-4 py-3.5 text-left text-[14px] font-medium transition-colors',
                  revealed && isAnswer && 'border-emerald-500 bg-emerald-50 text-emerald-600',
                  revealed && isSelected && !isAnswer && 'border-red-400 bg-red-50 text-red-500',
                  revealed && !isSelected && !isAnswer && 'border-zinc-100 bg-zinc-100 text-zinc-600',
                  !revealed && isSelected && 'border-orange-400 bg-orange-50 text-orange-600',
                  !revealed && !isSelected && 'border-zinc-100 bg-zinc-100 text-zinc-600',
                )}
              >
                {i + 1}. {opt}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {revealed && (
            <motion.div
              data-demo-id="explanation"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-xl bg-zinc-100 p-4"
            >
              <p className="text-[15px] font-bold text-orange-500">
                The correct answer is {q.answer + 1}.
              </p>
              <p className="mt-1.5 text-[12px] font-semibold text-zinc-500">Explanation</p>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">{q.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="shrink-0 p-4">
        {revealed ? (
          <button
            type="button"
            data-demo-id="quiz-next"
            onClick={next}
            className="w-full rounded-xl bg-orange-500 py-3.5 text-[15px] font-bold text-white"
          >
            {qIndex + 1 < QUESTIONS.length ? 'Next' : 'Done'}
          </button>
        ) : (
          <button
            type="button"
            data-demo-id="quiz-submit"
            onClick={submit}
            disabled={selected === null}
            className={cn(
              'w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-colors',
              selected === null ? 'bg-zinc-300' : 'bg-orange-500',
            )}
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
}

/** 화면 전환 래퍼 — Mobile/Desktop 공용 */
export function AppScreens() {
  const screen = useQuizGold((s) => s.screen);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, x: screen === 'quiz' ? 40 : -40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: screen === 'quiz' ? -40 : 40 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        {screen === 'home' ? <HomeScreen /> : <QuizScreen />}
      </motion.div>
    </AnimatePresence>
  );
}
