import { FileText, Layers } from 'lucide-react';
import { pick, useLang } from '../i18n';
import { STR, type Pipeline } from './data';
import { cn } from '../../../../lib/cn';

/** "+" 팝오버 / "/" 자동완성 공용 — 갱신 파이프라인 출처 목록 */
export function SourceMenu({
  items,
  onPick,
  compact,
}: {
  items: Pipeline[];
  onPick: (id: string) => void;
  compact?: boolean;
}) {
  const lang = useLang();
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-white/10 bg-[#161b21] shadow-2xl shadow-black/40',
        compact ? 'w-full' : 'w-80',
      )}
    >
      <p className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2 text-[10.5px] font-medium uppercase tracking-wider text-zinc-500">
        <Layers className="h-3 w-3 text-teal-400" /> {pick(STR.sourceMenuTitle, lang)}
      </p>
      <div className="max-h-64 overflow-y-auto p-1.5">
        {items.length === 0 ? (
          <p className="px-3 py-4 text-center text-[12px] text-zinc-600">{pick(STR.slashHint, lang)}</p>
        ) : (
          items.map((p) => (
            <button
              key={p.id}
              data-demo-id={`source-pick-${p.id}`}
              onClick={() => onPick(p.id)}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-teal-500/[0.08]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/12 text-teal-300">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-200">
                  <span className="truncate">{pick(p.label, lang)}</span>
                  {p.urgent && (
                    <span className="shrink-0 rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300">
                      {pick(STR.urgentTag, lang)}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate text-[10.5px] text-zinc-500">
                  <span className="font-mono text-teal-400/70">/{p.slash}</span> · {pick(p.meta, lang)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
