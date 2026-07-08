import { useState } from 'react';
import { useShellStore } from '../store/shellStore';
import { cn } from '../lib/cn';
import { DemoPlayer } from './DemoPlayer';
import type { Lang } from '../demos/findle/_shared/i18n';

/** Studio-lite 사이드바 항목 — 현재 daily-quiz(ko/en)만. */
const COMPOSITIONS: { id: string; title: string; lang: Lang }[] = [
  { id: 'daily-quiz-narrated-ko', title: 'daily-quiz · 한국어', lang: 'ko' },
  { id: 'daily-quiz-narrated-en', title: 'daily-quiz · English', lang: 'en' },
];

/**
 * 인앱 Remotion Studio-lite — 프로덕션·로컬 모두에서 @remotion/player로 데모 영상을
 * 재생·스크럽 관람한다. 좌측 컴포지션 목록 + 우측 큰 Player. localhost:3000 iframe(StudioView) 대체.
 */
export function StudioLite() {
  const closeStudio = useShellStore((s) => s.closeStudio);
  const [selected, setSelected] = useState<Lang>('ko');
  const active = COMPOSITIONS.find((c) => c.lang === selected) ?? COMPOSITIONS[0];
  return (
    <div className="flex h-full w-full flex-col bg-ink-950">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-ink-900 px-4 py-2.5">
        <button
          onClick={closeStudio}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          ← 목록으로
        </button>
        <span className="text-[13px] font-medium text-white/60">Remotion Studio</span>
        {import.meta.env.DEV && (
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            title="실제 Remotion Studio (npm run studio 실행 중)"
          >
            실제 Studio 새 탭 ↗
          </a>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-white/10 bg-ink-900/50 p-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/30">
            findle
          </p>
          <ul className="space-y-0.5">
            {COMPOSITIONS.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c.lang)}
                  className={cn(
                    'w-full rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                    c.lang === selected
                      ? 'bg-brass-500/20 text-brass-200'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                  )}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex min-w-0 flex-1 items-center justify-center p-6">
          <div className="w-full max-w-[1120px] overflow-hidden rounded-xl ring-1 ring-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
            {/* 언어 전환 시 key로 remount → DemoVideo의 전역 store 재구성이 깨끗하게 일어난다 */}
            <DemoPlayer key={active.lang} lang={active.lang} />
          </div>
        </main>
      </div>
    </div>
  );
}
