import type { DemoComponentProps } from '../../../registry/types';
import { ChatMobile } from '../_shared/chat/ChatMobile';
import { useSourceChat } from './store';

export function Mobile(_: DemoComponentProps) {
  return <ChatMobile useStore={useSourceChat} />;
}
