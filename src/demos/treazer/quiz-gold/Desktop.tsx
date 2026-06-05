import { CalendarCheck, Coins, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { Coin } from '../_shared/ui';
import { useQuizGold } from './state';
import { AppScreens } from './screens';

/** 데스크탑 = 브랜드 패널 + 폰 컬럼 쇼케이스 (Treazer는 모바일 앱) */
export function Desktop(_: DemoComponentProps) {
  const { gold, earned, streak } = useQuizGold();

  return (
    <div className="flex h-full items-stretch bg-[#16100b] text-zinc-200">
      {/* 좌측 브랜드 패널 */}
      <div className="flex flex-1 flex-col justify-center px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-400/80">
          Treazer · Learn & Earn Gold
        </p>
        <h1 className="mt-4 text-[42px] font-bold leading-tight tracking-tight text-zinc-50">
          퀴즈 풀면,
          <br />
          <span className="text-orange-400">진짜 금</span>이 쌓인다
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-400">
          매일 경제 퀴즈로 출석하고 골드를 모으세요. 1 GOLD는 실제 금 0.0000005g — 포인트가 아니라
          자산입니다.
        </p>

        <div className="mt-10 flex gap-3">
          {[
            { icon: Coins, label: 'My Gold', value: gold.toLocaleString('en-US') },
            { icon: Sparkles, label: '이번 세션 획득', value: `+${earned}` },
            { icon: CalendarCheck, label: '연속 출석', value: `${streak}일` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px]">{label}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[20px] font-bold tabular-nums text-zinc-100">
                <Coin className="h-4 w-4 text-[8px]" /> {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 우측 앱 컬럼 */}
      <div className="flex w-[420px] shrink-0 items-center justify-center pr-12">
        <div className="h-[92%] w-full overflow-hidden rounded-[2rem] shadow-2xl ring-8 ring-black/60">
          <AppScreens />
        </div>
      </div>
    </div>
  );
}
