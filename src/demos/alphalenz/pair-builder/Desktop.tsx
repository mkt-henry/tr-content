import type { DemoComponentProps } from '../../../registry/types';
import { TopBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { STR } from './data';
import { SectorChips, PairBook, RiskRail } from './widgets';

export function Desktop(_: DemoComponentProps) {
  return (
    <div className="flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      <TopBar activeTab={4} search={STR.search} />
      <SectorChips />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <PairBook />
        </main>
        <RiskRail />
      </div>
    </div>
  );
}
