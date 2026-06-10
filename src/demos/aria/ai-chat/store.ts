import { createChatStore } from '../_shared/chat/store';

/** 계약·클레임 Q&A — 출처 미지정(전체 파이프라인 종합) 상태로 시작 */
export const useChat = createChatStore({ defaultSourceId: null });
