import { AnimatePresence, motion } from 'framer-motion';
import { useAiDailyQuiz } from './state';
import { FeedScreen } from './FeedScreen';
import { ArticleScreen } from './ArticleScreen';
import { QuizRunnerScreen } from './QuizRunnerScreen';
import { ResultScreen } from './ResultScreen';

export function AppScreens() {
  const screen = useAiDailyQuiz((s) => s.screen);
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f6]">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {screen === 'feed' && <FeedScreen />}
          {screen === 'article' && <ArticleScreen />}
          {screen === 'quiz' && <QuizRunnerScreen />}
          {screen === 'result' && <ResultScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
