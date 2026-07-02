import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Share2, X } from 'lucide-react';
import type { DistributionPost, FeatureDefinition } from '../registry/types';
import { getProject, getProjectIdOfFeature } from '../registry';
import { useShellStore } from '../store/shellStore';
import { cn } from '../lib/cn';

/**
 * 데모 영상 배포용 게시 카피(유튜브 제목·설명 / 링크드인 본문) 복사 패널.
 * 카드뉴스 뷰어의 "게시 본문" 패널과 동일한 UX — 언어 토글(프로젝트 언어)에 따라 전환되고
 * 블록마다 복사 버튼을 제공한다. 표시 여부는 shellStore.showPosts로 제어.
 */
export function DistributionPanel({ feature }: { feature: FeatureDefinition }) {
  const show = useShellStore((s) => s.showPosts);
  const setShowPosts = useShellStore((s) => s.setShowPosts);
  const projectLang = useShellStore((s) => s.projectLang);

  const posts = feature.posts;
  const projectId = getProjectIdOfFeature(feature.id);
  const languages = projectId ? getProject(projectId)?.languages : undefined;
  const lang = (projectId ? projectLang[projectId] : undefined) ?? languages?.[0]?.id ?? 'ko';

  if (!posts?.length) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-4 top-4 bottom-24 z-[60] flex w-[420px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-brass-500/20 bg-[#0c0a08]/95 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl"
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-zinc-100">
              <Share2 className="h-4 w-4 text-brass-300" /> 게시 본문 · 배포 카피
            </span>
            <button
              onClick={() => setShowPosts(false)}
              aria-label="닫기"
              className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3">
            {posts.map((post, i) => (
              <PostBlock key={i} post={post} lang={lang} />
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const PLATFORM = {
  youtube: { label: 'YouTube', chip: 'text-red-300 bg-red-500/12 border-red-500/30' },
  linkedin: { label: 'LinkedIn', chip: 'text-sky-300 bg-sky-500/12 border-sky-500/30' },
} as const;

function PostBlock({ post, lang }: { post: DistributionPost; lang: string }) {
  const [copied, setCopied] = useState(false);
  const text = post.text[lang] ?? Object.values(post.text)[0] ?? '';
  const label = post.label[lang] ?? Object.values(post.label)[0] ?? '';
  const plat = PLATFORM[post.platform];
  const count = [...text].length;
  const over = post.limit != null && count > post.limit;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error('[distribution:copy]', err);
    }
  };

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', plat.chip)}>
            {plat.label}
          </span>
          <span className="truncate text-[13px] font-medium text-zinc-200">{label}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn('font-mono text-[10.5px] tabular-nums', over ? 'text-red-400' : 'text-zinc-500')}>
            {post.limit != null ? `${count} / ${post.limit}` : `${count.toLocaleString()}자`}
          </span>
          <button
            onClick={copy}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors',
              copied
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-brass-500/15 text-brass-200 hover:bg-brass-500/25',
            )}
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 복사</>}
          </button>
        </div>
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap px-3 py-2.5 text-[12.5px] leading-relaxed text-zinc-300" style={{ fontFamily: 'inherit' }}>
        {text}
      </pre>
    </section>
  );
}
