import type { DemoComponentProps } from '../../../registry/types';
import { FINDLE_APP_BG } from '../_shared/ui';
import { Dashboard, Header, ReportPanel } from './screens';

export function Mobile(_: DemoComponentProps) {
  return (
    <div className="flex h-full flex-col" style={{ background: FINDLE_APP_BG }}>
      <Header />
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <Dashboard />
        <div className="mt-3 min-h-[300px]">
          <ReportPanel />
        </div>
      </div>
    </div>
  );
}
