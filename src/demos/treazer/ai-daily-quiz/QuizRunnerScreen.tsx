import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick, fmt } from '../_shared/i18n';
import { Coin } from '../_shared/ui';
import { useAiDailyQuiz } from './state';
import { SOLVABLE_ARTICLE, STR } from './data';

// ---------------------------------------------------------------------------
// QuizRunnerScreen
// ---------------------------------------------------------------------------

export function QuizRunnerScreen() {
  const {
    lang,
    gold,
    flash,
    currentQuiz,
    selectedOption,
    submitted,
    selectOption,
    submitAnswer,
    nextQuiz,
    goToFeed,
  } = useAiDailyQuiz();

  const quiz = SOLVABLE_ARTICLE.quizzes[currentQuiz];

  const optionClass = (j: number): string => {
    if (!submitted) {
      return j === selectedOption
        ? 'border-2 border-orange-400 bg-orange-50 text-orange-600'
        : 'border-2 border-zinc-100 bg-zinc-100 text-zinc-700';
    }
    // submitted
    if (j === quiz.correctIndex) {
      return 'border-2 border-emerald-400 bg-emerald-50 text-emerald-600';
    }
    if (j === selectedOption) {
      return 'border-2 border-rose-400 bg-rose-50 text-rose-500';
    }
    return 'border-2 border-zinc-100 bg-zinc-100 text-zinc-400';
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#f4f4f6' }}>
      {/* 1. Top bar */}
      <div className="relative grid shrink-0 grid-cols-3 items-center px-2 pb-2 pt-3">
        <button
          onClick={goToFeed}
          className="flex items-center justify-start text-zinc-600"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="text-center text-[16px] font-bold text-zinc-900">
          {pick(STR.quizHeader, lang)}
        </span>
        <div />
      </div>

      {/* 2. Q label + gold row */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-1">
        <span className="text-[16px] font-bold text-orange-500">
          {fmt(pick(STR.questionLabel, lang), { n: currentQuiz + 1 })}
        </span>
        <motion.div
          animate={flash ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-1.5"
        >
          <Coin className="h-4 w-4 text-[9px]" />
          <span className="text-[13px] font-semibold tabular-nums text-zinc-600">
            {gold.toLocaleString('en-US')}
          </span>
        </motion.div>
      </div>

      {/* 3. Scroll area: question + options + explanation */}
      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        <motion.div
          key={currentQuiz}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Question */}
          <p className="mb-5 mt-2 text-[20px] font-bold leading-snug text-zinc-900">
            {pick(quiz.question, lang)}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {pick(quiz.options, lang).map((opt, j) => (
              <button
                key={j}
                data-demo-id={`quiz-opt-${j}`}
                onClick={() => selectOption(j)}
                disabled={submitted}
                className={cn(
                  'w-full rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium leading-snug transition-colors',
                  optionClass(j),
                  submitted && 'cursor-default',
                )}
              >
                {j + 1}. {opt}
              </button>
            ))}
          </div>

          {/* Answer explanation — shown only when submitted */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 rounded-2xl bg-zinc-100 p-4"
              >
                <p className="text-[15px] font-bold text-orange-500">
                  {fmt(pick(STR.correctAnswerIs, lang), { n: quiz.correctIndex + 1 })}
                </p>
                <p className="mt-2 text-[13px] font-bold text-zinc-700">
                  {pick(STR.explanationLabel, lang)}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">
                  {pick(quiz.explanation, lang)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. Bottom button */}
      <div className="shrink-0 p-4">
        {!submitted ? (
          <button
            data-demo-id="submit-answer"
            onClick={submitAnswer}
            disabled={selectedOption === null}
            className={cn(
              'w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-colors',
              selectedOption === null ? 'bg-orange-300' : 'bg-orange-500',
            )}
          >
            {pick(STR.submitAnswer, lang)}
          </button>
        ) : (
          <button
            data-demo-id="next-quiz"
            onClick={nextQuiz}
            className="w-full rounded-xl bg-orange-500 py-3.5 text-[15px] font-bold text-white transition-colors"
          >
            {pick(STR.next, lang)}
          </button>
        )}
      </div>
    </div>
  );
}
