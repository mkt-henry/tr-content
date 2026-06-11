import type { DemoComponentProps } from '../../../registry/types';
import { LeaderboardApp } from './screens';

export function Desktop(_: DemoComponentProps) {
  return (
    <div className="flex h-full items-stretch justify-center bg-[#0e1512]">
      <div className="h-full w-full max-w-[420px] overflow-hidden">
        <LeaderboardApp />
      </div>
    </div>
  );
}
