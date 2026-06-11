import { FileText, Menu, Plus, SendHorizontal, Sparkles, X } from 'lucide-react';
import { pick, useLang } from '../i18n';
import { filterBySlash, getPipeline, PIPELINES, STR } from './data';
import { ChatMessages } from './ChatMessages';
import { SourceMenu } from './SourceMenu';
import type { ChatStoreHook } from './store';
import { cn } from '../../../../lib/cn';
import { AriaWordmark } from '../AriaWordmark';

/** ARIA 채팅 모바일 셸 — 모든 채팅 데모 공용 */
export function ChatMobile({ useStore }: { useStore: ChatStoreHook }) {
  const { input, setInput, send, thinking, sourceId, menuOpen, toggleMenu, setSource, clearSource } = useStore();
  const lang = useLang();
  const pipeline = getPipeline(sourceId);
  const slashActive = input.startsWith('/');
  const showMenu = menuOpen || slashActive;
  const menuItems = slashActive ? filterBySlash(input.slice(1)) : PIPELINES;

  return (
    <div className="flex h-full flex-col bg-[#101418] text-zinc-200">
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <Menu className="h-4.5 w-4.5 text-zinc-500" />
        <div className="flex items-center gap-2">
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-teal-500/90 text-[#06211f]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <AriaWordmark className="h-3" />
        </div>
      </header>

      <ChatMessages useStore={useStore} compact />

      <div className="border-t border-white/[0.06] p-3">
        <div className="relative">
          {/* 출처 지정 메뉴 / 자동완성 */}
          {showMenu && menuItems.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 z-10 mb-2">
              <SourceMenu items={menuItems} onPick={setSource} compact />
            </div>
          )}

          {/* 지정된 출처 칩 */}
          {pipeline && (
            <div className="mb-2 flex items-center gap-2">
              <span
                data-demo-id="source-chip"
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 py-1 pl-2 pr-1 text-[11px] text-teal-200"
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
            className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] py-1 pl-1 pr-1.5 focus-within:border-teal-500/40"
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
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                menuOpen ? 'bg-teal-500/20 text-teal-200' : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300',
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              data-demo-id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={pick(STR.placeholderShort, lang)}
              className="h-9 min-w-0 flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              data-demo-id="chat-send"
              disabled={!input.trim() || slashActive || thinking}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                input.trim() && !slashActive && !thinking ? 'bg-teal-500 text-[#06211f]' : 'bg-white/[0.05] text-zinc-600',
              )}
            >
              <SendHorizontal className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
