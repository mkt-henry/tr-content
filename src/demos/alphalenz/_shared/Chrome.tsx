import { Bell, Search, ChevronDown } from 'lucide-react';
import { pick, useLang, type L } from './i18n';
import { AL } from './theme';
import { cn } from '../../../lib/cn';

/** AlphaLenz 로고 워드마크 — 점(.) 강조 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-semibold tracking-tight text-zinc-100', className)}>
      Alpha<span className="text-violet-400">Lenz</span>
      <span className="text-violet-500">.</span>
    </span>
  );
}

/** 상단 네비 탭 라벨 */
const TABS: L<string[]> = {
  ko: ['대시보드', '리서치 분석', '차트 분석', '스크리너', '실전 전략'],
  en: ['Dashboard', 'Research', 'Charts', 'Screener', 'Strategy'],
};

/**
 * 데스크탑 공용 상단 바. activeTab으로 현재 탭을 강조한다.
 * search에 placeholder 텍스트를 주면 검색 인풋이 노출된다.
 */
export function TopBar({
  activeTab = 0,
  search,
}: {
  activeTab?: number;
  search?: L;
}) {
  const lang = useLang();
  return (
    <header
      className="flex items-center gap-4 border-b px-4 py-2.5"
      style={{ borderColor: AL.border, background: AL.panelBg }}
    >
      <Wordmark className="text-[15px]" />

      {search && (
        <div
          className="ml-1 flex h-8 max-w-md flex-1 items-center gap-2 rounded-lg px-3 text-[12px] text-zinc-500"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${AL.border}` }}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="truncate">{pick(search, lang)}</span>
        </div>
      )}

      <nav className={cn('flex items-center gap-1', !search && 'ml-2')}>
        {pick(TABS, lang).map((t, i) => (
          <span
            key={i}
            className={cn(
              'rounded-md px-2.5 py-1 text-[12px] font-medium',
              i === activeTab ? 'text-violet-300' : 'text-zinc-500',
            )}
            style={i === activeTab ? { background: AL.accentSoft } : undefined}
          >
            {t}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <Bell className="h-4 w-4 text-zinc-600" />
        <div className="flex items-center gap-1.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-700" />
          <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
        </div>
      </div>
    </header>
  );
}

/** 모바일 공용 상단 바 */
export function MobileBar({ title }: { title?: string }) {
  return (
    <header
      className="flex items-center gap-2 border-b px-4 py-3"
      style={{ borderColor: AL.border, background: AL.panelBg }}
    >
      <Wordmark className="text-[14px]" />
      {title && <span className="ml-auto text-[12px] text-zinc-500">{title}</span>}
    </header>
  );
}
