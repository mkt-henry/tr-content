import { Bot, SendHorizontal, TriangleAlert } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useVs } from './state';
import { GENERIC_LABEL, GENERIC_CAVEAT } from './data';
import { pick, useLang } from '../_shared/i18n';
import { ChatThread } from '../alpha-chat/Thread';
import { Wordmark } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

/** 중립색 — 좌측(위) 범용 AI 패널 액센트 */
const NEUTRAL = '#94a3b8';

const STR = {
  placeholder: {
    ko: '질문을 입력하세요…',
    en: 'Enter your question…',
  },
} as const;

/** 모바일: 상하 스택 (위=범용 AI, 아래=AlphaLenz). 최소 구현. 녹화는 데스크탑 16:9 사용. */
export function Mobile(_: DemoComponentProps) {
  const { input, left, right, setInput, start } = useVs();
  const lang = useLang();

  const leftDone =
    left.messages.length > 0 &&
    !left.thinking &&
    left.messages.some((m) => m.role === 'assistant' && !m.streaming);

  return (
    <div className="flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      {/* 공용 프롬프트 바 */}
      <div className="shrink-0 border-b px-3 py-2.5" style={{ borderColor: AL.border, background: AL.panelBg }}>
        <div className="mb-2 flex items-center gap-2">
          <Wordmark className="text-[13px]" />
        </div>
        <form
          className="flex items-center gap-2 rounded-2xl border py-1 pl-3.5 pr-1.5 focus-within:border-violet-500/40"
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
              'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
              (left.thinking || right.thinking) && 'bg-white/[0.05] text-zinc-600',
            )}
            style={
              !(left.thinking || right.thinking)
                ? { background: AL.accent, color: '#fff' }
                : undefined
            }
          >
            <SendHorizontal className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* 위: 범용 AI */}
      <div className="flex min-h-0 flex-1 flex-col border-b" style={{ borderColor: AL.border }}>
        <div
          className="flex shrink-0 items-center gap-1.5 border-b px-3 py-2"
          style={{ borderColor: AL.border }}
        >
          <Bot className="h-3.5 w-3.5 shrink-0" style={{ color: NEUTRAL }} />
          <span className="text-[11.5px] font-medium" style={{ color: NEUTRAL }}>
            {pick(GENERIC_LABEL, lang)}
          </span>
        </div>
        <ChatThread
          messages={left.messages}
          thinking={left.thinking}
          lang={lang}
          accent={NEUTRAL}
          gradientId="gen"
          compact
        />
        {leftDone && (
          <div
            data-demo-id="vs-left-caveat"
            className="shrink-0 border-t px-3 py-2"
            style={{ borderColor: AL.border }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-2.5 py-1 text-[10.5px] text-amber-400">
              <TriangleAlert className="h-2.5 w-2.5 shrink-0" />
              {pick(GENERIC_CAVEAT, lang)}
            </div>
          </div>
        )}
      </div>

      {/* 아래: AlphaLenz */}
      <div
        data-demo-id="vs-right-evidence"
        className="flex min-h-0 flex-1 flex-col"
      >
        <div
          className="flex shrink-0 items-center gap-1.5 border-b px-3 py-2"
          style={{ borderColor: AL.border }}
        >
          <Wordmark className="text-[12px]" />
        </div>
        <ChatThread
          messages={right.messages}
          thinking={right.thinking}
          lang={lang}
          accent={AL.accent}
          gradientId="alpha"
          compact
        />
      </div>
    </div>
  );
}
