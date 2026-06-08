import { Globe, Newspaper, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { GENERATED_QUIZZES } from './data';
import { useAiDailyQuiz } from './state';
import { AppScreens } from './screens';

/** 데스크탑 = 브랜드 패널 + 폰 컬럼 쇼케이스 (Treazer는 모바일 앱) */
export function Desktop(_: DemoComponentProps) {
  const { phase, visibleCount } = useAiDailyQuiz();
  const generated = phase === 'done' ? visibleCount : 0;

  return (
    <div className="flex h-full items-stretch bg-[#16100b] text-zinc-200">
      {/* 좌측 브랜드 패널 */}
      <div className="flex flex-1 flex-col justify-center px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-orange-400/80">
          Treazer · AI Daily Quiz
        </p>
        <h1 className="mt-4 text-[42px] font-bold leading-tight tracking-tight text-zinc-50">
          오늘 뉴스가,
          <br />
          <span className="text-orange-400">오늘의 퀴즈</span>가 된다
        </h1>
        <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-400">
          AI가 매일 아침 뉴스 기사를 그날의 퀴즈로 자동 변환하고, 베트남·태국·싱가포르까지 나라별
          언어로 즉시 현지화합니다.
        </p>

        <div className="mt-10 flex gap-3">
          {[
            { icon: Newspaper, label: '오늘 소스 기사', value: '1' },
            { icon: Sparkles, label: 'AI 생성 퀴즈', value: `${generated}/${GENERATED_QUIZZES.length}` },
            { icon: Globe, label: '지원 언어', value: 'EN · JA · VI · TH' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px]">{label}</span>
              </div>
              <p className="mt-1.5 text-[18px] font-bold tabular-nums text-zinc-100">{value}</p>
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
