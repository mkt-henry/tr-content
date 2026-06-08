import { MessageSquareText, Plus, Search, Settings2, SendHorizontal, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useChat } from './state';
import { pick, useLang } from '../_shared/i18n';
import { HISTORY, STR } from './data';
import { Messages } from './Messages';
import { cn } from '../../../lib/cn';

export function Desktop(_: DemoComponentProps) {
  const { input, setInput, send, thinking } = useChat();
  const lang = useLang();

  return (
    <div className="flex h-full bg-[#101418] text-zinc-200">
      {/* 사이드바 */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0c1014]">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/90 text-[#06211f]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-[14px] font-semibold text-zinc-100">
            ARIA <span className="text-[10px] font-normal text-zinc-500">by Treasurer</span>
          </span>
        </div>
        <button className="mx-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[12.5px] text-zinc-300 hover:bg-white/[0.07]">
          <Plus className="h-4 w-4" /> {pick(STR.newChat, lang)}
        </button>
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-[12px] text-zinc-600">
          <Search className="h-3.5 w-3.5" /> {pick(STR.searchChats, lang)}
        </div>
        <nav className="mt-4 flex-1 px-3">
          <p className="mb-2 px-1 text-[10.5px] font-medium uppercase tracking-wider text-zinc-600">
            {pick(STR.recentChats, lang)}
          </p>
          {pick(HISTORY, lang).map((h, i) => (
            <button
              key={i}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px]',
                i === 0 ? 'bg-white/[0.06] text-zinc-200' : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              <MessageSquareText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{h}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-4 py-3.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600" />
          <div className="text-[11.5px]">
            <p className="font-medium text-zinc-300">{pick(STR.userName, lang)}</p>
            <p className="text-zinc-600">{pick(STR.userRole, lang)}</p>
          </div>
          <Settings2 className="ml-auto h-4 w-4 text-zinc-600" />
        </div>
      </aside>

      {/* 채팅 영역 */}
      <main className="flex min-w-0 flex-1 flex-col">
        <Messages />

        {/* 입력 바 */}
        <div className="border-t border-white/[0.06] p-4">
          <form
            className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-1.5 pl-4 pr-2 focus-within:border-teal-500/40"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              data-demo-id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={pick(STR.placeholder, lang)}
              className="h-9 min-w-0 flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              data-demo-id="chat-send"
              disabled={!input.trim() || thinking}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                input.trim() && !thinking ? 'bg-teal-500 text-[#06211f] hover:bg-teal-400' : 'bg-white/[0.05] text-zinc-600',
              )}
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[10.5px] text-zinc-600">
            {pick(STR.footerNote, lang)}
          </p>
        </div>
      </main>
    </div>
  );
}
