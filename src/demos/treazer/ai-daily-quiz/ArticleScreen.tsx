import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick } from '../_shared/i18n';
import { Thumbnail } from './widgets';
import { useAiDailyQuiz } from './state';
import { SOLVABLE_ARTICLE, STR } from './data';

// ---------------------------------------------------------------------------
// ArticleScreen
// ---------------------------------------------------------------------------

export function ArticleScreen() {
  const { lang, goToFeed, startQuiz } = useAiDailyQuiz();

  const keyPoints = pick(SOLVABLE_ARTICLE.keyPoints, lang);

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#f4f4f6' }}>

      {/* Top bar */}
      <div className="grid shrink-0 grid-cols-3 items-center px-3 pb-2 pt-4">
        <button
          onClick={goToFeed}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition-colors active:bg-zinc-200"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-center text-[16px] font-bold text-zinc-900">
          {pick(STR.quizHeader, lang)}
        </h1>
        {/* spacer to balance grid */}
        <div />
      </div>

      {/* Scrollable body */}
      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-4">

          {/* Hero thumbnail */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Thumbnail
              thumb={SOLVABLE_ARTICLE.thumb}
              className="h-44 w-full rounded-2xl"
            />
          </motion.div>

          {/* Category tag + headline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="flex flex-col gap-1.5"
          >
            <span className="text-[12px] font-bold text-orange-500">
              {pick(SOLVABLE_ARTICLE.category, lang)}
            </span>
            <p className="text-[17px] font-bold leading-snug text-zinc-900">
              {pick(SOLVABLE_ARTICLE.headline, lang)}
            </p>
          </motion.div>

          {/* News Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="mb-2 text-[15px] font-bold text-zinc-900">
              {pick(STR.newsSummary, lang)}
            </p>
            <p
              className={cn(
                'whitespace-pre-line text-[12.5px] leading-relaxed text-zinc-500',
              )}
            >
              {pick(SOLVABLE_ARTICLE.summary, lang)}
            </p>
          </motion.div>

          {/* Key Points card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="mb-3 text-[15px] font-bold text-zinc-900">
              {pick(STR.keyPoints, lang)}
            </p>
            <div className="flex flex-col gap-2.5">
              {keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <p className="text-[12.5px] leading-snug text-zinc-700">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Related News card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <p className="mb-3 text-[15px] font-bold text-zinc-900">
              {pick(STR.relatedNews, lang)}
            </p>
            <div className="flex items-center gap-3">
              <Thumbnail
                thumb={SOLVABLE_ARTICLE.relatedNews.thumb}
                className="h-16 w-16 rounded-xl"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="line-clamp-2 text-[13px] font-bold leading-snug text-zinc-900">
                  {pick(SOLVABLE_ARTICLE.relatedNews.title, lang)}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {pick(SOLVABLE_ARTICLE.relatedNews.source, lang)}
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 px-4 pb-5 pt-3">
        <button
          data-demo-id="lets-start"
          onClick={startQuiz}
          className="w-full rounded-xl bg-orange-500 py-3.5 text-[15px] font-bold text-white transition-opacity active:opacity-80"
        >
          {pick(STR.letsStart, lang)}
        </button>
      </div>

    </div>
  );
}
