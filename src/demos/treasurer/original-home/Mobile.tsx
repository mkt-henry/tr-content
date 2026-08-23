import type { DemoComponentProps } from '../../../registry/types';
import { OriginalScreen } from './screens';

export function Mobile(_: DemoComponentProps) {
  return (
    <div className="h-full bg-[#e3e8f1]">
      <OriginalScreen />
    </div>
  );
}
