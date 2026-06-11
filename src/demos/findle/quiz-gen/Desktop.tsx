import type { DemoComponentProps } from '../../../registry/types';
import { FINDLE_APP_BG } from '../_shared/ui';
import { Form, Header, ResultPanel } from './screens';

export function Desktop(_: DemoComponentProps) {
  return (
    <div className="flex h-full flex-col" style={{ background: FINDLE_APP_BG }}>
      <Header />
      <div className="grid min-h-0 flex-1 grid-cols-[340px_1fr] gap-3 p-3">
        <div className="demo-scroll min-h-0 overflow-y-auto">
          <Form />
        </div>
        <ResultPanel />
      </div>
    </div>
  );
}
