import { Menu, SendHorizontal, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useChat } from './state';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { Messages } from './Messages';
import { cn } from '../../../lib/cn';

export function Mobile(_: DemoComponentProps) {
  const { input, setInput, send, thinking } = useChat();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#101418] text-zinc-200">
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <Menu className="h-4.5 w-4.5 text-zinc-500" />
        <div className="flex items-center gap-2">
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-teal-500/90 text-[#06211f]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-semibold text-zinc-100">ARIA</span>
        </div>
      </header>

      <Messages compact />

      <div className="border-t border-white/[0.06] p-3">
        <form
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-1 pl-3.5 pr-1.5 focus-within:border-teal-500/40"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
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
            disabled={!input.trim() || thinking}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
              input.trim() && !thinking ? 'bg-teal-500 text-[#06211f]' : 'bg-white/[0.05] text-zinc-600',
            )}
          >
            <SendHorizontal className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
