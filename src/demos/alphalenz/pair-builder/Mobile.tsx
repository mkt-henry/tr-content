import type { DemoComponentProps } from '../../../registry/types';
import { MobileBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { STR } from './data';
import { pick, useLang } from '../_shared/i18n';
import { SectorChips, PairBook, RiskBar } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const lang = useLang();
  return (
    <div className="flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      <MobileBar title={pick(STR.pageTitle, lang)} />
      <SectorChips compact />
      <PairBook compact />
      <RiskBar />
    </div>
  );
}
