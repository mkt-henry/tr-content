import { SendHorizontal } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useChat } from './state';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { Messages } from './Messages';
import { MobileBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

export function Mobile(_: DemoComponentProps) {
  const { input, setInput, send, thinking } = useChat();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      <MobileBar />

      <Messages compact />

      <div className="border-t p-3" style={{ borderColor: AL.border }}>
        <form
          className="flex items-center gap-2 rounded-2xl border py-1 pl-3.5 pr-1.5 focus-within:border-violet-500/40"
          style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.04)' }}
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
              !(input.trim() && !thinking) && 'bg-white/[0.05] text-zinc-600',
            )}
            style={input.trim() && !thinking ? { background: AL.accent, color: '#fff' } : undefined}
          >
            <SendHorizontal className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
