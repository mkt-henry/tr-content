import { motion, AnimatePresence } from 'framer-motion';
import { Handshake } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useMatch } from './state';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { RiskCard, CandidateList, EmailPanel } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const selectedId = useMatch((s) => s.selectedId);
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <Handshake className="h-4 w-4" />
        </div>
        <h2 className="text-[13.5px] font-semibold text-zinc-100">
          {pick(STR.appTitle, lang)} <span className="ml-1 text-[10px] font-normal text-zinc-500">ARIA by Treasurer</span>
        </h2>
        <span className="ml-auto font-mono text-[10.5px] text-zinc-600">{pick(STR.panelMeta, lang)}</span>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 좌: 리스크 입력 */}
        <div className="w-72 shrink-0 border-r border-white/[0.06] p-4">
          <RiskCard />
        </div>

        {/* 중: 후보 랭킹 */}
        <div className="demo-scroll min-w-0 flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-[11px] font-medium text-zinc-500">{pick(STR.candidatesHeader, lang)}</p>
          <CandidateList />
        </div>

        {/* 우: 이메일 패널 */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 overflow-hidden border-l border-white/[0.06] bg-[#141318]"
            >
              <div className="h-full w-96">
                <EmailPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
