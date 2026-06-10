import { createChatStore } from '../_shared/chat/store';

/** 출처 지정 Q&A — 출처 없는 빈 상태로 시작, "+"·"/"로 출처를 첨부 */
export const useSourceChat = createChatStore({ defaultSourceId: null });
