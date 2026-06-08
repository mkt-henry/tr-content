import { Layers, Trophy, Vote } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { Coin } from '../_shared/ui';
import { pick as pickL, useLang } from '../_shared/i18n';
import { BRACKET, ROUND_LABEL, STR } from './data';
import { useFavoritePick } from './state';
import { AppScreens } from './screens';

/** 데스크탑 = 브랜드 패널 + 폰 컬럼 쇼케이스 (Treazer는 모바일 앱) */
export function Desktop(_: DemoComponentProps) {
  const { gold, matchIndex, screen } = useFavoritePick();
  const lang = useLang();

  // 라이브 스탯 — 현재 라운드 / 누적 투표 수 / 획득 골드 (라운드 라벨은 현재 언어로)
  const currentRound =
    screen === 'result' ? pickL(STR.champion, lang) : pickL(ROUND_LABEL[BRACKET[matchIndex].round], lang);
  // 누적 투표 수: 진행한 매치마다 +1, 데모 분위기용 베이스라인 가산
  const votes = (12840 + matchIndex * 137).toLocaleString('en-US');
  const earned = screen === 'result' ? '+20' : '+0';

  return (
    <div className="flex h-full items-stretch bg-[#16100b] text-zinc-200">
      {/* 좌측 브랜드 패널 */}
      <div className="flex flex-1 flex-col justify-center px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-400/80">
          Treazer · Favorite Pick · VN Boost
        </p>
        <h1 className="mt-4 text-[42px] font-bold leading-tight tracking-tight text-zinc-50">
          고르는 재미가,
          <br />
          <span className="text-orange-400">일일 사용자</span>를 만든다
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-400">
          이상형 월드컵으로 가볍게 한 번 누르다 보면 어느새 출석 완료. 베트남 시장을 부스팅하는
          운영 배너형 토너먼트 콘텐츠입니다.
        </p>

        <div className="mt-10 flex gap-3">
          {[
            { icon: Layers, label: '현재 라운드', value: currentRound },
            { icon: Vote, label: '누적 투표 수', value: votes },
            { icon: Trophy, label: '획득 골드', value: earned, coin: true },
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

        {/* 보유 골드 한 줄 (퀴즈 데모와 동일 톤) */}
        <p className="mt-6 flex items-center gap-1.5 text-[12px] text-zinc-500">
          <Coin className="h-3.5 w-3.5 text-[8px]" /> My Gold {gold.toLocaleString('en-US')}
        </p>
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
