import { BarChart3, BookOpen, Flame, Gift, Home, User } from 'lucide-react';
import { cn } from '../../../lib/cn';
import type { DemoBackground } from '../../../registry/types';

/** Findle 브랜드 그린 */
export const FINDLE_GREEN = '#15a06a';

/** 스테이지 배경 — 그린 틴트 다크 (앱 화면은 라이트, 무대 뒤는 다크) */
export const FINDLE_BG: DemoBackground = {
  kind: 'gradient',
  css: 'radial-gradient(ellipse 75% 60% at 78% 10%, rgba(21,160,106,0.26), transparent 58%), radial-gradient(ellipse 60% 55% at 12% 94%, rgba(16,120,80,0.30), transparent 60%), linear-gradient(160deg, #08140f 0%, #060b09 100%)',
  blobs: [
    'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-emerald-500/12 blur-[140px]',
    'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-green-700/20 blur-[120px]',
  ],
};

/** 앱 화면 라이트 배경색 */
export const FINDLE_APP_BG = '#f1f3f5';

/** Findle 로고 마크 — 그린 라운드 + 흰 F */
export function FindleMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('flex items-center justify-center rounded-lg font-bold text-white', className)}
      style={{ background: FINDLE_GREEN }}
    >
      F
    </span>
  );
}

/** 작은 Fin 코인 (그린) */
export function Fin({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full text-[8px] font-bold text-white', className)}
      style={{ background: FINDLE_GREEN }}
    >
      F
    </span>
  );
}

/** 학생 앱 상단바 — 로고 + 스트릭/Fins/아바타 */
export function FindleTopBar({ streak, fins, initials = 'AK' }: { streak: number; fins: number; initials?: string }) {
  return (
    <header className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-3.5" style={{ background: FINDLE_APP_BG }}>
      <FindleMark className="h-6.5 w-6.5 text-[13px]" />
      <span className="text-[15px] font-extrabold text-zinc-900">Findle</span>
      <div className="ml-auto flex items-center gap-1.5">
        <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-500">
          <Flame className="h-3 w-3" /> {streak}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
          <Fin className="h-3 w-3" /> {fins.toLocaleString('en-US')}
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: FINDLE_GREEN }}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}

type Tab = 'home' | 'learn' | 'ranks' | 'rewards' | 'me';

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'ranks', label: 'Ranks', icon: BarChart3 },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'me', label: 'Me', icon: User },
];

/** 학생 앱 하단 탭바 */
export function FindleBottomNav({ active }: { active: Tab }) {
  return (
    <nav
      className="flex shrink-0 items-center justify-around border-t border-zinc-200 px-2 pb-3.5 pt-2"
      style={{ background: '#ffffff' }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const on = t.id === active;
        return (
          <span key={t.id} className="flex flex-col items-center gap-0.5" style={{ color: on ? FINDLE_GREEN : '#9ca3af' }}>
            <Icon className="h-5 w-5" strokeWidth={on ? 2.4 : 2} />
            <span className="text-[10px] font-medium">{t.label}</span>
          </span>
        );
      })}
    </nav>
  );
}
