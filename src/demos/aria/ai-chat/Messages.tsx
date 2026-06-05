import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileBarChart2 } from 'lucide-react';
import { useChat, type ChatMessage } from './state';
import { SUGGESTED } from './data';
import { cn } from '../../../lib/cn';

/** 메시지 목록 + 추천 질문 (데스크탑/모바일 공용) */
export function Messages({ compact }: { compact?: boolean }) {
  const { messages, thinking, send } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 콘텐츠가 생기면 맨 아래로
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  return (
    <div ref={scrollRef} className="demo-scroll min-h-0 flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className={cn('flex h-full flex-col items-center justify-center gap-6 px-6', compact && 'gap-4')}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h3 className={cn('font-semibold text-zinc-200', compact ? 'text-[16px]' : 'text-[20px]')}>
              계약·클레임 문서에 물어보세요
            </h3>
            <p className="mt-1.5 text-[12px] text-zinc-500">Korean Re Property Cat XoL Slip 기준으로 답변합니다</p>
          </div>
          <div className={cn('flex w-full max-w-md flex-col gap-2', compact && 'max-w-none')}>
            {SUGGESTED.map((q, i) => (
              <button
                key={i}
                data-demo-id={`suggest-${i}`}
                onClick={() => send(q)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-[12.5px] text-zinc-300 transition-colors hover:border-teal-500/40 hover:bg-teal-500/[0.06] hover:text-teal-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={cn('mx-auto flex max-w-2xl flex-col gap-5 px-5 py-6', compact && 'px-4 py-4 gap-4')}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} compact={compact} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2.5">
              <Avatar />
              <div className="flex items-center gap-1 rounded-2xl bg-white/[0.05] px-4 py-3">
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-teal-300" />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-teal-300" />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-teal-300" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Avatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
      <Sparkles className="h-3.5 w-3.5" />
    </div>
  );
}

function MessageBubble({ message: m, compact }: { message: ChatMessage; compact?: boolean }) {
  if (m.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-teal-600/90 px-4 py-2.5 text-[13px] leading-relaxed text-white">
          {m.text}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
      <Avatar />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'whitespace-pre-wrap rounded-2xl rounded-tl-md bg-white/[0.05] px-4 py-3 text-[13px] leading-relaxed text-zinc-200',
            m.streaming && 'stream-caret',
          )}
        >
          {m.text}
        </div>

        {/* 근거 데이터 카드 */}
        {m.evidence && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            data-demo-id="evidence-card"
            className="mt-2.5 overflow-hidden rounded-xl border border-teal-500/20 bg-teal-950/30"
          >
            <div className="flex items-center gap-2 border-b border-teal-500/15 px-3.5 py-2 text-[11px] font-medium text-teal-300">
              <FileBarChart2 className="h-3.5 w-3.5" />
              원문 근거
              {m.source && <span className="ml-auto font-normal text-teal-400/60">{m.source}</span>}
            </div>
            <div className={cn('grid', compact ? 'grid-cols-1' : 'grid-cols-2')}>
              {m.evidence.map((e, i) => (
                <div key={i} className="border-b border-r border-teal-500/10 px-3.5 py-2.5 last:border-b-0">
                  <p className="text-[10.5px] text-zinc-500">{e.label}</p>
                  <p className="mt-0.5 font-mono text-[13px] font-medium text-zinc-100">{e.value}</p>
                  {e.delta && (
                    <p className={cn('text-[10.5px] font-medium', e.positive ? 'text-emerald-400' : 'text-rose-400')}>
                      {e.delta}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
