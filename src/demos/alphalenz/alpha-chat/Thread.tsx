import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis } from 'recharts';
import type { ChatMessage } from './state';
import { pick, type Lang } from '../_shared/i18n';
import { STR, type Answer } from './data';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

export interface ChatThreadProps {
  messages: ChatMessage[];
  thinking: boolean;
  /** UI 표시 언어. 어댑터(Messages.tsx)가 useLang()으로 주입함 */
  lang: Lang;
  /** 기본값 AL.accent — 사용자/어시스턴트 버블·아바타·근거카드 강조색 */
  accent?: string;
  compact?: boolean;
  /** empty-state 추천 질문. 생략 시 메시지 없으면 빈 영역만 표시 */
  suggested?: string[];
  /** 추천 질문 클릭 핸들러. suggested가 있을 때만 사용 */
  onSuggest?: (q: string) => void;
  /** SVG 그래디언트 ID 접두어. 동일 페이지에 여러 인스턴스가 있을 때 충돌 방지 (기본 'alpha') */
  gradientId?: string;
}

/** 스토어 비의존 채팅 표현 컴포넌트. props만으로 구동됨. */
export function ChatThread({
  messages,
  thinking,
  lang,
  accent = AL.accent,
  compact,
  suggested: suggestedList,
  onSuggest,
  gradientId = 'alpha',
}: ChatThreadProps): JSX.Element {
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: hexToRgba(accent, 0.15), color: hexToRgba(accent, 0.75) }}>
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h3 className={cn('font-semibold text-zinc-200', compact ? 'text-[16px]' : 'text-[20px]')}>
              {pick(STR.emptyTitle, lang)}
            </h3>
            <p className="mt-1.5 text-[12px] text-zinc-500">{pick(STR.emptySubtitle, lang)}</p>
          </div>
          {suggestedList && suggestedList.length > 0 && (
            <div className={cn('flex w-full max-w-md flex-col gap-2', compact && 'max-w-none')}>
              {suggestedList.map((q, i) => (
                <button
                  key={i}
                  data-demo-id={`suggest-${i}`}
                  onClick={() => onSuggest?.(q)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-[12.5px] text-zinc-300 transition-colors hover:border-violet-500/40 hover:bg-violet-500/[0.06] hover:text-violet-200"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={cn('mx-auto flex max-w-2xl flex-col gap-5 px-5 py-6', compact && 'gap-4 px-4 py-4')}>
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} compact={compact} accent={accent} lang={lang} gradientId={gradientId} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2.5">
              <Avatar accent={accent} />
              <div className="flex items-center gap-1 rounded-2xl bg-white/[0.05] px-4 py-3">
                <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ background: hexToRgba(accent, 0.9) }} />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ background: hexToRgba(accent, 0.9) }} />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ background: hexToRgba(accent, 0.9) }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 내부 서브컴포넌트 (Thread.tsx 전용)
// ---------------------------------------------------------------------------

function Avatar({ accent }: { accent: string }) {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
      style={{ background: hexToRgba(accent, 0.2), color: hexToRgba(accent, 0.85) }}
    >
      <Sparkles className="h-3.5 w-3.5" />
    </div>
  );
}

function MessageBubble({
  message: m,
  compact,
  accent,
  lang,
  gradientId,
}: {
  message: ChatMessage;
  compact?: boolean;
  accent: string;
  lang: Lang;
  gradientId: string;
}) {
  if (m.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-relaxed text-white"
          style={{ background: accent }}
        >
          {m.text}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
      <Avatar accent={accent} />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'whitespace-pre-wrap rounded-2xl rounded-tl-md bg-white/[0.05] px-4 py-3 text-[13px] leading-relaxed text-zinc-200',
            m.streaming && 'stream-caret',
          )}
        >
          {m.text}
        </div>
        {m.answer && <EvidenceCard answer={m.answer} compact={compact} accent={accent} lang={lang} gradientId={gradientId} />}
      </div>
    </motion.div>
  );
}

function EvidenceCard({
  answer,
  compact,
  accent,
  lang,
  gradientId,
}: {
  answer: Answer;
  compact?: boolean;
  accent: string;
  lang: Lang;
  gradientId: string;
}) {

  // accent 기반 반투명 경계색 (원본: rgba(124,92,255,...))
  const border22 = hexToRgba(accent, 0.22);
  const border15 = hexToRgba(accent, 0.15);
  const border10 = hexToRgba(accent, 0.10);
  const border08 = hexToRgba(accent, 0.08);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-demo-id="evidence-card"
      className="mt-2.5 overflow-hidden rounded-xl border bg-violet-950/25"
      style={{ borderColor: border22 }}
    >
      <div
        className="flex items-center gap-2 border-b px-3.5 py-2 text-[11px] font-medium text-violet-300"
        style={{ borderColor: border15 }}
      >
        <BarChart3 className="h-3.5 w-3.5" />
        {pick(STR.evidenceHeader, lang)}
        {answer.source && <span className="ml-auto truncate font-normal text-violet-400/60">{answer.source}</span>}
      </div>

      {/* 미니 차트 (삼성전자 5년 실적) */}
      {answer.chart && (
        <div className="border-b px-3.5 pb-1 pt-2.5" style={{ borderColor: border10 }}>
          <div className="mb-1 flex items-center gap-3 text-[10px]">
            <span className="text-zinc-400">{pick(STR.chartTitle, lang)}</span>
            <span className="ml-auto flex items-center gap-1 text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
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
                  <linearGradient id={`${gradientId}Rev`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`${gradientId}Profit`} x1="0" y1="0" x2="0" y2="1">
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
                  stroke={accent}
                  strokeWidth={1.6}
                  fill={`url(#${gradientId}Rev)`}
                  isAnimationActive
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke={AL.cyan}
                  strokeWidth={1.6}
                  fill={`url(#${gradientId}Profit)`}
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
              <tr className="border-b text-[10px] text-zinc-500" style={{ borderColor: border10 }}>
                {pick(answer.table.columns, lang).map((c, i) => (
                  <th key={i} className={cn('px-3.5 py-2 font-medium', i > 0 && 'text-right')}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answer.table.rows.map((r, ri) => (
                <tr key={ri} className="border-b last:border-b-0" style={{ borderColor: border08 }}>
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
        <div
          className={cn('grid border-t', compact ? 'grid-cols-1' : 'grid-cols-2')}
          style={{ borderColor: border10 }}
        >
          {answer.evidence.map((e, i) => (
            <div
              key={i}
              className="border-b border-r px-3.5 py-2.5 last:border-b-0"
              style={{ borderColor: border08 }}
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

// ---------------------------------------------------------------------------
// 유틸 — hex → rgba (accent 기반 반투명 경계색 생성)
// ---------------------------------------------------------------------------

/**
 * 6자리 hex 색상 → rgba(r,g,b,alpha) 문자열.
 * accent가 hex가 아닌 경우(rgb/hsl 등) 원본 값을 그대로 반환하여 깨짐 방지.
 */
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex; // fallback: 지원 불가 포맷이면 원본 반환
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}
