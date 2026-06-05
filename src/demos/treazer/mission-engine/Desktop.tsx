import { CheckCircle2, Clock, Coins } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { Coin } from '../_shared/ui';
import { INITIAL_GOLD } from './data';
import { useMissionEngine } from './state';
import { AppScreens } from './screens';

/** 자정 기준 분 → "11:58 AM" (Desktop 라이브 스탯용) */
function formatClock(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/** 데스크탑 = 브랜드 패널 + 폰 컬럼 쇼케이스 (Treazer는 모바일 앱) */
export function Desktop(_: DemoComponentProps) {
  const gold = useMissionEngine((s) => s.gold);
  const clockMin = useMissionEngine((s) => s.clockMin);
  const completedCount = useMissionEngine((s) => s.completedCount);
  const earnedToday = gold - INITIAL_GOLD;

  return (
    <div className="flex h-full items-stretch bg-[#16100b] text-zinc-200">
      {/* 좌측 브랜드 패널 */}
      <div className="flex flex-1 flex-col justify-center px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-400/80">
          Treazer · Retention Engine
        </p>
        <h1 className="mt-4 text-[42px] font-bold leading-tight tracking-tight text-zinc-50">
          하루 4번,
          <br />
          <span className="text-orange-400">다시 열리는</span> 이유
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-400">
          아침·점심·오후·저녁 — 시간대마다 새 미션이 열립니다. 데일리 미션과 함께 하루 종일 재방문을
          만드는 리텐션 엔진입니다.
        </p>

        <div className="mt-10 flex gap-3">
          {[
            { icon: Clock, label: '현재 시각', value: formatClock(clockMin) },
            { icon: Coins, label: '오늘 획득 골드', value: `+${earnedToday}`, coin: true },
            { icon: CheckCircle2, label: '완료 미션', value: `${completedCount}개` },
          ].map(({ icon: Icon, label, value, coin }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px]">{label}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-[20px] font-bold tabular-nums text-zinc-100">
                {coin && <Coin className="h-4 w-4 text-[8px]" />} {value}
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
