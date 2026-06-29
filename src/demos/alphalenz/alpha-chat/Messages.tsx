import { useChat } from './state';
import { useLang } from '../_shared/i18n';
import { suggested } from './data';
import { ChatThread } from './Thread';

/** 메시지 목록 + 추천 질문 (데스크탑/모바일 공용) */
export function Messages({ compact }: { compact?: boolean }) {
  const { messages, thinking, send } = useChat();
  const lang = useLang();

  return (
    <ChatThread
      messages={messages}
      thinking={thinking}
      lang={lang}
      compact={compact}
      suggested={suggested(lang)}
      onSuggest={send}
    />
  );
}
