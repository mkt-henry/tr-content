import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { pick, fmt } from '../_shared/i18n';
import type { Lang } from '../_shared/i18n';
import { Wordmark, GoldPill, BottomNav, Coin } from '../_shared/ui';
import { Thumbnail } from './widgets';
import { useAiDailyQuiz } from './state';
import { FEED_ARTICLES, STR } from './data';
import type { FeedArticle } from './data';

// ---------------------------------------------------------------------------
// ArticleCard
// ---------------------------------------------------------------------------

interface ArticleCardProps {
  article: FeedArticle;
  index: number;
  lang: Lang;
  onOpen?: () => void;
}

function ArticleCard({ article, index, lang, onOpen }: ArticleCardProps) {
  const isSolvable = article.solvable === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      data-demo-id={isSolvable ? `feed-article-${article.id}` : undefined}
      onClick={isSolvable ? onOpen : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl bg-white p-3 shadow-sm',
        isSolvable && 'cursor-pointer active:scale-[0.98] transition-transform',
      )}
    >
      <Thumbnail thumb={article.thumb} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="line-clamp-2 text-[14px] font-bold leading-snug text-zinc-900">
          {pick(article.title, lang)}
        </p>

        <div className="flex items-center gap-1">
          <Coin className="h-3.5 w-3.5 shrink-0 text-[8px]" />
          <span className="text-[12px] font-bold text-amber-500">
            {fmt(pick(STR.upTo, lang), { n: article.reward.toLocaleString('en-US') })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FeedScreen
// ---------------------------------------------------------------------------

export function FeedScreen() {
  const { gold, flash, lang, openArticle } = useAiDailyQuiz();

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#f4f4f6' }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
        <Wordmark className="text-[20px]" />
        <GoldPill amount={gold} flash={flash} />
      </div>

      {/* Title block */}
      <div className="shrink-0 px-4 pb-3 pt-1">
        <h1 className="text-[20px] font-bold leading-tight text-zinc-900">
          {pick(STR.dailyQuizTitle, lang)}
        </h1>
        <p className="mt-0.5 text-[12px] text-zinc-500">
          {pick(STR.feedSubtitle, lang)}
        </p>
      </div>

      {/* Scrollable card list */}
      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {FEED_ARTICLES.map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={i}
              lang={lang}
              onOpen={article.solvable ? openArticle : undefined}
            />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav active="home" />
    </div>
  );
}
