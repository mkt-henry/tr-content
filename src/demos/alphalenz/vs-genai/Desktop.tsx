import { Bot, SendHorizontal, TriangleAlert } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useVs } from './state';
import { GENERIC_LABEL, GENERIC_CAVEAT } from './data';
import { pick, useLang } from '../_shared/i18n';
import { ChatThread } from '../alpha-chat/Thread';
import { Wordmark } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

/** 중립색 — 좌측 범용 AI 패널 액센트 (zinc/slate 계열) */
const NEUTRAL = '#94a3b8';

const STR = {
  placeholder: {
    ko: '삼성전자 실적을 분석해줘…',
    en: 'Analyze Samsung Electronics performance…',
  },
  send: {
    ko: '전송',
    en: 'Send',
  },
  alphaSubLabel: {
    ko: '근거 기반 분석',
    en: 'Evidence-backed Analysis',
  },
} as const;

export function Desktop(_: DemoComponentProps) {
  const { input, left, right, setInput, start } = useVs();
  const lang = useLang();

  // 좌측 캐비엣 표시 조건: 메시지 있고 스트리밍 완료
  const leftDone =
    left.messages.length > 0 &&
    !left.thinking &&
    left.messages.some((m) => m.role === 'assistant' && !m.streaming);

  return (
    <div className="flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      {/* ── 공용 헤더 + 프롬프트 바 ── */}
      <div
        className="shrink-0 border-b px-5 py-3"
        style={{ borderColor: AL.border, background: AL.panelBg }}
      >
        {/* 상단 브랜딩 + 타이틀 행 */}
        <div className="mb-2.5 flex items-center gap-3">
          <Wordmark className="text-[14px]" />
          <span className="text-[11px] text-zinc-600">·</span>
          <span className="text-[11.5px] font-medium text-zinc-400">AI 비교 데모</span>
        </div>

        {/* 프롬프트 바 */}
        <form
          className="flex items-center gap-2 rounded-2xl border py-1.5 pl-4 pr-2 focus-within:border-violet-500/40"
          style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.04)' }}
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          <input
            data-demo-id="vs-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={pick(STR.placeholder, lang)}
            className="h-9 min-w-0 flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
          <button
            type="submit"
            data-demo-id="vs-send"
            disabled={left.thinking || right.thinking}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
              left.thinking || right.thinking
                ? 'bg-white/[0.05] text-zinc-600'
                : '',
            )}
            style={
              !(left.thinking || right.thinking)
                ? { background: AL.accent, color: '#fff' }
                : undefined
            }
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ── 본문: 좌우 2분할 ── */}
      <div className="flex min-h-0 flex-1">
        {/* ── 좌측: 범용 AI ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* 패널 헤더 */}
          <div
            className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5"
            style={{ borderColor: AL.border }}
          >
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: 'rgba(148,163,184,0.12)', color: NEUTRAL }}
            >
              <Bot className="h-3.5 w-3.5" />
            </div>
            <span className="text-[12.5px] font-medium" style={{ color: NEUTRAL }}>
              {pick(GENERIC_LABEL, lang)}
            </span>
          </div>

          {/* ChatThread — 범용 AI (중립색, SVG id='gen') */}
          <ChatThread
            messages={left.messages}
            thinking={left.thinking}
            lang={lang}
            accent={NEUTRAL}
            gradientId="gen"
          />

          {/* 캐비엣 칩 — 답변 완료 시만 노출 */}
          {leftDone && (
            <div
              data-demo-id="vs-left-caveat"
              className="shrink-0 border-t px-4 py-2.5"
              style={{ borderColor: AL.border }}
            >
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1.5 text-[11px] text-amber-400">
                <TriangleAlert className="h-3 w-3 shrink-0" />
                {pick(GENERIC_CAVEAT, lang)}
              </div>
            </div>
          )}
        </div>

        {/* 중앙 디바이더 */}
        <div className="w-px shrink-0" style={{ background: AL.border }} />

        {/* ── 우측: AlphaLenz ── */}
        <div
          data-demo-id="vs-right-evidence"
          className="flex min-w-0 flex-1 flex-col"
        >
          {/* 패널 헤더 */}
          <div
            className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5"
            style={{ borderColor: AL.border }}
          >
            <Wordmark className="text-[13px]" />
            <span className="ml-1 text-[11px] text-zinc-500">
              {pick(STR.alphaSubLabel, lang)}
            </span>
          </div>

          {/* ChatThread — AlphaLenz (퍼플, SVG id='alpha') */}
          <ChatThread
            messages={right.messages}
            thinking={right.thinking}
            lang={lang}
            accent={AL.accent}
            gradientId="alpha"
          />
        </div>
      </div>
    </div>
  );
}
