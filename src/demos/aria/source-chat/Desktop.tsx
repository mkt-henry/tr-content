import type { DemoComponentProps } from '../../../registry/types';
import { ChatDesktop } from '../_shared/chat/ChatDesktop';
import { useSourceChat } from './store';

export function Desktop(_: DemoComponentProps) {
  return <ChatDesktop useStore={useSourceChat} />;
}
