import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileBarChart2, Layers, Plus, Slash, Sparkles, TrendingUp } from 'lucide-react';
import { pick, useLang } from '../i18n';
import { getPipeline, STR, suggested, suggestedGlobal, type XlRecoveryChart } from './data';
import type { ChatMessage, ChatStoreHook } from './store';
import { cn } from '../../../../lib/cn';

/** 메시지 목록 + 추천 질문/출처 안내 (데스크탑/모바일 공용) */
export function ChatMessages({ useStore, compact }: { useStore: ChatStoreHook; compact?: boolean }) {
  const { messages, thinking, send, sourceId } = useStore();
  const lang = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pipeline = getPipeline(sourceId);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  return (
    <div ref={scrollRef} className="demo-scroll min-h-0 flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        pipeline ? (
          // 출처 지정됨(디폴트) — 추천 질문
          <div className={cn('flex h-full flex-col items-center justify-center gap-6 px-6', compact && 'gap-4')}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className={cn('font-semibold text-zinc-200', compact ? 'text-[16px]' : 'text-[20px]')}>
                {pick(STR.emptyTitle, lang)}
              </h3>
              <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-emerald-400/80">
                <CheckCircle2 className="h-3 w-3" /> {pick(pipeline.label, lang)} {pick(STR.sourceReady, lang)}
              </p>
            </div>
            <div className={cn('flex w-full max-w-md flex-col gap-2', compact && 'max-w-none')}>
              {suggested(pipeline, lang).map((q, i) => (
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
          // 출처 미지정 — 전체 파이프라인 종합. 추천질문 + 좁히기 힌트
          <div className={cn('flex h-full flex-col items-center justify-center gap-5 px-6', compact && 'gap-4')}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className={cn('font-semibold text-zinc-200', compact ? 'text-[16px]' : 'text-[20px]')}>
                {pick(STR.globalTitle, lang)}
              </h3>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-teal-300/80">
                <Layers className="h-3 w-3" /> {pick(STR.globalReady, lang)}
              </p>
            </div>
            <div className={cn('flex w-full max-w-md flex-col gap-2', compact && 'max-w-none')}>
              {suggestedGlobal(lang).map((q, i) => (
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
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5">
                <Plus className="h-3 w-3 text-teal-300" /> {pick(STR.addSource, lang)}
              </span>
              <span className="text-zinc-700">{lang === 'ko' ? '또는' : 'or'}</span>
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5">
                <Slash className="h-3 w-3 text-teal-300" /> <span className="font-mono">/</span>
              </span>
              <span>{pick(STR.globalSubtitle, lang)}</span>
            </div>
          </div>
        )
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

/** XL(초과손해) 회수 곡선 — 총 손해액(x)에 따른 재보험 회수액(y) 페이아웃 함수 */
function XlRecoveryCurve({ chart }: { chart: XlRecoveryChart }) {
  const { retention, limit, unit } = chart;
  const exhaustion = retention + limit; // 한도 소진 지점
  const xMax = exhaustion * 1.25; // 곡선이 평평해지는 꼬리 여백

  // 플롯 영역 (viewBox 0 0 460 200)
  const L = 56;
  const R = 446;
  const T = 22;
  const B = 162;
  const sx = (loss: number) => L + (loss / xMax) * (R - L);
  const sy = (rec: number) => B - (rec / limit) * (B - T);

  const xA = sx(retention); // attachment
  const xE = sx(exhaustion); // exhaustion (회수 = limit)
  const line = `M${L},${B} L${xA},${B} L${xE},${T} L${R},${T}`;
  const area = `${line} L${R},${B} Z`;
  const won = (v: number) => `₩${v}${unit}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-demo-id="answer-chart"
      className="mt-2.5 rounded-xl border border-teal-500/20 bg-teal-950/30 px-3.5 pb-2.5 pt-3"
    >
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-teal-300">
        <TrendingUp className="h-3.5 w-3.5" />
        {chart.title}
      </div>

      <svg viewBox="0 0 460 200" className="w-full font-mono" style={{ height: 172 }}>
        {/* 축 */}
        <line x1={L} y1={B} x2={R} y2={B} stroke="#ffffff20" />
        <line x1={L} y1={T} x2={L} y2={B} stroke="#ffffff20" />
        {/* y 눈금 */}
        <text x={L - 7} y={T + 4} fill="#71717a" fontSize="9" textAnchor="end">{won(limit)}</text>
        <text x={L - 7} y={B} fill="#71717a" fontSize="9" textAnchor="end">0</text>

        {/* 회수 영역 */}
        <motion.path
          d={area}
          fill="#14b8a6"
          fillOpacity={0.15}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        {/* 회수 곡선 (그려지는 애니메이션) */}
        <motion.path
          d={line}
          fill="none"
          stroke="#2dd4bf"
          strokeWidth={2.5}
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />

        {/* attachment(보유) 마커 */}
        <line x1={xA} y1={T} x2={xA} y2={B} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={xA} cy={B} r={3.5} fill="#f59e0b" />
        <text x={xA} y={B + 16} fill="#f59e0b" fontSize="9" textAnchor="middle">
          {chart.attachWord} {won(retention)}
        </text>

        {/* exhaustion(한도소진) 마커 */}
        <line x1={xE} y1={T} x2={xE} y2={sy(limit)} stroke="#2dd4bf" strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={xE} cy={T} r={3.5} fill="#2dd4bf" />
        <text x={xE} y={B + 16} fill="#5eead4" fontSize="9" textAnchor="middle">
          {chart.exhaustWord} {won(exhaustion)}
        </text>

        {/* 축 라벨 */}
        <text x={(L + R) / 2} y="196" fill="#52525b" fontSize="9" textAnchor="middle">→ {chart.axisX}</text>
        <text x={L + 4} y={T - 8} fill="#71717a" fontSize="9">{chart.axisY}</text>
      </svg>

      {chart.caption && (
        <p className="mt-1.5 border-t border-teal-500/15 pt-2 text-[10.5px] leading-snug text-zinc-500">
          {chart.caption}
        </p>
      )}
    </motion.div>
  );
}

function MessageBubble({ message: m, compact }: { message: ChatMessage; compact?: boolean }) {
  const lang = useLang();
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

        {/* 시각 요소 — XL 회수 곡선 차트 */}
        {m.chart && !m.streaming && m.chart.kind === 'xl-recovery' && <XlRecoveryCurve chart={m.chart} />}

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
              {pick(STR.evidenceHeader, lang)}
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
