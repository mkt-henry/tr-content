import { ArrowDownRight, ArrowUpRight, Coins, LineChart, Wallet } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { Coin } from '../_shared/ui';
import { useLang } from '../_shared/i18n';
import { CURRENCY, money } from './data';
import { useGoldStore } from './state';
import { AppScreens } from './screens';

/** 데스크탑 = 브랜드 패널 + 폰 컬럼 쇼케이스 (Treazer는 모바일 앱) */
export function Desktop(_: DemoComponentProps) {
  const { gold, goldPrice, trend } = useGoldStore();
  const lang = useLang();
  const cur = CURRENCY[lang];
  const Arrow = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  const arrowColor = trend === 'down' ? 'text-red-400' : 'text-emerald-400';

  return (
    <div className="flex h-full items-stretch bg-[#16100b] text-zinc-200">
      {/* 좌측 브랜드 패널 */}
      <div className="flex flex-1 flex-col justify-center px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-400/80">
          Treazer · Gold Store
        </p>
        <h1 className="mt-4 text-[42px] font-bold leading-tight tracking-tight text-zinc-50">
          골드는 포인트가 아니다,
          <br />
          <span className="text-orange-400">자산</span>이다
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-400">
          보유 골드는 실제 금 시세에 연동됩니다. 스토어 상품 가격도 시세에 따라 실시간으로 움직이죠.
          모은 골드로 30초 만에 기프트카드를 교환하세요.
        </p>

        <div className="mt-10 flex gap-3">
          {[
            { icon: Coins, label: 'My Gold', value: gold.toLocaleString('en-US'), coin: true },
            { icon: Wallet, label: `${cur.symbol} 환산`, value: money(gold * cur.perGold, cur), coin: false },
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

          {/* 라이브 시세 스탯 */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <LineChart className="h-3.5 w-3.5" />
              <span className="text-[11px]">현재 시세</span>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[20px] font-bold tabular-nums text-zinc-100">
              ₩{goldPrice.toLocaleString('en-US')}
              <Arrow className={`h-4 w-4 ${arrowColor}`} strokeWidth={2.5} />
            </p>
          </div>
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
