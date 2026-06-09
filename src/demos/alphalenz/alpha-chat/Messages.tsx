import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis } from 'recharts';
import { useChat, type ChatMessage } from './state';
import { pick, useLang } from '../_shared/i18n';
import { STR, suggested, type Answer } from './data';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

/** 메시지 목록 + 추천 질문 (데스크탑/모바일 공용) */
export function Messages({ compact }: { compact?: boolean }) {
  const { messages, thinking, send } = useChat();
  const lang = useLang();
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h3 className={cn('font-semibold text-zinc-200', compact ? 'text-[16px]' : 'text-[20px]')}>
              {pick(STR.emptyTitle, lang)}
            </h3>
            <p className="mt-1.5 text-[12px] text-zinc-500">{pick(STR.emptySubtitle, lang)}</p>
          </div>
          <div className={cn('flex w-full max-w-md flex-col gap-2', compact && 'max-w-none')}>
            {suggested(lang).map((q, i) => (
              <button
                key={i}
                data-demo-id={`suggest-${i}`}
                onClick={() => send(q)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-[12.5px] text-zinc-300 transition-colors hover:border-violet-500/40 hover:bg-violet-500/[0.06] hover:text-violet-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={cn('mx-auto flex max-w-2xl flex-col gap-5 px-5 py-6', compact && 'gap-4 px-4 py-4')}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} compact={compact} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2.5">
              <Avatar />
              <div className="flex items-center gap-1 rounded-2xl bg-white/[0.05] px-4 py-3">
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-violet-300" />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-violet-300" />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-violet-300" />
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
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
      <Sparkles className="h-3.5 w-3.5" />
    </div>
  );
}

function MessageBubble({ message: m, compact }: { message: ChatMessage; compact?: boolean }) {
  if (m.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed text-white"
          style={{ background: AL.accent }}
        >
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
        {m.answer && <EvidenceCard answer={m.answer} compact={compact} />}
      </div>
    </motion.div>
  );
}

function EvidenceCard({ answer, compact }: { answer: Answer; compact?: boolean }) {
  const lang = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-demo-id="evidence-card"
      className="mt-2.5 overflow-hidden rounded-xl border bg-violet-950/25"
      style={{ borderColor: 'rgba(124,92,255,0.22)' }}
    >
      <div
        className="flex items-center gap-2 border-b px-3.5 py-2 text-[11px] font-medium text-violet-300"
        style={{ borderColor: 'rgba(124,92,255,0.15)' }}
      >
        <BarChart3 className="h-3.5 w-3.5" />
        {pick(STR.evidenceHeader, lang)}
        {answer.source && <span className="ml-auto truncate font-normal text-violet-400/60">{answer.source}</span>}
      </div>

      {/* 미니 차트 (삼성전자 5년 실적) */}
      {answer.chart && (
        <div className="border-b px-3.5 pb-1 pt-2.5" style={{ borderColor: 'rgba(124,92,255,0.1)' }}>
          <div className="mb-1 flex items-center gap-3 text-[10px]">
            <span className="text-zinc-400">{pick(STR.chartTitle, lang)}</span>
            <span className="ml-auto flex items-center gap-1 text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: AL.accent }} />
              {pick(STR.legendRevenue, lang)}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: AL.cyan }} />
              {pick(STR.legendProfit, lang)}
            </span>
          </div>
          <div style={{ height: compact ? 80 : 96 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={answer.chart} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="alphaRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={AL.accent} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={AL.accent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="alphaProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={AL.cyan} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={AL.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 9, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={AL.accent}
                  strokeWidth={1.6}
                  fill="url(#alphaRev)"
                  isAnimationActive
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke={AL.cyan}
                  strokeWidth={1.6}
                  fill="url(#alphaProfit)"
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 종목 비교 표 */}
      {answer.table && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-[10px] text-zinc-500" style={{ borderColor: 'rgba(124,92,255,0.1)' }}>
                {pick(answer.table.columns, lang).map((c, i) => (
                  <th key={i} className={cn('px-3.5 py-2 font-medium', i > 0 && 'text-right')}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answer.table.rows.map((r, ri) => (
                <tr key={ri} className="border-b last:border-b-0" style={{ borderColor: 'rgba(124,92,255,0.08)' }}>
                  <td className="px-3.5 py-2.5">
                    <span className="text-[12px] font-medium text-zinc-100">{r.name}</span>
                    <span className="ml-1.5 font-mono text-[10px] text-zinc-600">{r.ticker}</span>
                  </td>
                  {r.cells.map((cell, ci) => (
                    <td key={ci} className="px-3.5 py-2.5 text-right font-mono text-[12px] text-zinc-200">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KPI 그리드 */}
      {answer.evidence && (
        <div className={cn('grid border-t', compact ? 'grid-cols-1' : 'grid-cols-2')} style={{ borderColor: 'rgba(124,92,255,0.1)' }}>
          {answer.evidence.map((e, i) => (
            <div
              key={i}
              className="border-b border-r px-3.5 py-2.5 last:border-b-0"
              style={{ borderColor: 'rgba(124,92,255,0.08)' }}
            >
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
      )}
    </motion.div>
  );
}
