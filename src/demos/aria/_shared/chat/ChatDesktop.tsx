import { FileText, MessageSquareText, Plus, Search, Settings2, SendHorizontal, Sparkles, X } from 'lucide-react';
import { pick, useLang } from '../i18n';
import { filterBySlash, getPipeline, HISTORY, PIPELINES, STR } from './data';
import { ChatMessages } from './ChatMessages';
import { SourceMenu } from './SourceMenu';
import type { ChatStoreHook } from './store';
import { cn } from '../../../../lib/cn';
import { AriaWordmark } from '../AriaWordmark';

/** ARIA 채팅 데스크탑 셸 — 모든 채팅 데모 공용. 동작 차이는 store/시나리오로만 */
export function ChatDesktop({ useStore }: { useStore: ChatStoreHook }) {
  const { messages, input, setInput, send, thinking, sourceId, menuOpen, toggleMenu, setSource, clearSource } =
    useStore();
  const lang = useLang();
  /** 현재 진행 중 대화의 첫 질문 — 사이드바 활성 항목으로 표시 */
  const currentTitle = messages.find((m) => m.role === 'user')?.text ?? null;
  const pipeline = getPipeline(sourceId);
  const slashActive = input.startsWith('/');
  const showMenu = menuOpen || slashActive;
  const menuItems = slashActive ? filterBySlash(input.slice(1)) : PIPELINES;

  return (
    <div className="flex h-full bg-[#101418] text-zinc-200">
      {/* 사이드바 */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0c1014]">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/90 text-[#06211f]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <AriaWordmark className="h-3.5" />
            <span className="text-[10px] font-normal text-zinc-500">by AlphaLenz</span>
          </div>
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
          {/* 진행 중인 대화 — 첫 질문을 활성 항목으로 노출 */}
          {currentTitle && (
            <button className="flex w-full items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-left text-[12.5px] text-zinc-200">
              <MessageSquareText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{currentTitle}</span>
            </button>
          )}
          {pick(HISTORY, lang).map((h, i) => (
            <button
              key={i}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px]',
                !currentTitle && i === 0 ? 'bg-white/[0.06] text-zinc-200' : 'text-zinc-500 hover:text-zinc-300',
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
        <ChatMessages useStore={useStore} />

        {/* 입력 영역 */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="relative mx-auto max-w-2xl">
            {/* 출처 지정 메뉴 / 자동완성 */}
            {showMenu && menuItems.length > 0 && (
              <div className="absolute bottom-full left-0 z-10 mb-2">
                <SourceMenu items={menuItems} onPick={setSource} />
              </div>
            )}

            {/* 지정된 출처 칩 */}
            {pipeline && (
              <div className="mb-2 flex items-center gap-2">
                <span
                  data-demo-id="source-chip"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 py-1 pl-2 pr-1 text-[11.5px] text-teal-200"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {pick(pipeline.label, lang)}
                  <button
                    data-demo-id="source-clear"
                    onClick={clearSource}
                    className="ml-0.5 rounded p-0.5 text-teal-300/70 hover:bg-teal-500/20 hover:text-teal-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}

            <form
              className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-2 focus-within:border-teal-500/40"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <button
                type="button"
                data-demo-id="source-add"
                onClick={() => toggleMenu()}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                  menuOpen ? 'bg-teal-500/20 text-teal-200' : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300',
                )}
              >
                <Plus className="h-4.5 w-4.5" />
              </button>
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
                disabled={!input.trim() || slashActive || thinking}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                  input.trim() && !slashActive && !thinking
                    ? 'bg-teal-500 text-[#06211f] hover:bg-teal-400'
                    : 'bg-white/[0.05] text-zinc-600',
                )}
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
          </div>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[10.5px] text-zinc-600">{pick(STR.footerNote, lang)}</p>
        </div>
      </main>
    </div>
  );
}
