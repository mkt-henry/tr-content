import type { DemoComponentProps } from '../../../registry/types';
import { FINDLE_APP_BG } from '../_shared/ui';
import { Dashboard, DispatchModal, Header, NoticeToast, ReportPanel, StudentModal } from './screens';

export function Mobile(_: DemoComponentProps) {
  return (
    <div className="relative flex h-full flex-col" style={{ background: FINDLE_APP_BG }}>
      <Header />
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <Dashboard />
        <div className="mt-3 min-h-[320px]">
          <ReportPanel />
        </div>
      </div>
      <StudentModal />
      <DispatchModal />
      <NoticeToast />
    </div>
  );
}
