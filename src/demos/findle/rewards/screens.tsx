import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Gift } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { FINDLE_APP_BG, FINDLE_GREEN, Fin, FindleBottomNav } from '../_shared/ui';
import { CARDS, STR } from './data';
import { useRewards } from './state';

export function RewardsApp() {
  const s = useRewards();
  const lang = useLang();

  return (
    <div className="relative flex h-full flex-col pt-8" style={{ background: FINDLE_APP_BG }}>
      {/* 헤더 */}
      <header className="shrink-0 px-4 pb-2 pt-3.5">
        <h2 className="text-[17px] font-extrabold text-zinc-900">{pick(STR.appTitle, lang)}</h2>
        <p className="text-[11.5px] text-zinc-400">{pick(STR.subtitle, lang)}</p>
      </header>

      {/* 보유 Fins */}
      <div className="mx-4 shrink-0 rounded-2xl p-4 text-white" style={{ background: FINDLE_GREEN }}>
        <p className="text-[11.5px] font-medium opacity-80">{pick(STR.balance, lang)}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Fin className="h-5 w-5 bg-white/25 text-white" />
          <motion.span key={s.fins} initial={{ scale: 1.18 }} animate={{ scale: 1 }} className="text-[26px] font-extrabold tabular-nums">
            {s.fins.toLocaleString('en-US')}
          </motion.span>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {CARDS.map((c) => {
            const affordable = c.fins <= s.fins;
            return (
              <button
                key={c.id}
                data-demo-id={`card-${c.id}`}
                onClick={() => s.openSheet(c)}
                className="overflow-hidden rounded-2xl bg-white text-left shadow-sm"
              >
                <div className="flex h-20 items-center justify-center text-[34px]" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                  {c.emoji}
                </div>
                <div className="p-2.5">
                  <p className="text-[12.5px] font-bold text-zinc-900">{c.brand}</p>
                  <p className="text-[10.5px] text-zinc-400">{pick(c.value, lang)}</p>
                  <p
                    className={cn('mt-1 flex items-center gap-1 text-[12px] font-extrabold', affordable ? 'text-emerald-600' : 'text-zinc-300')}
                  >
                    <Fin className="h-3 w-3" /> {c.fins.toLocaleString('en-US')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <FindleBottomNav active="rewards" />

      {/* 상세 시트 */}
      <AnimatePresence>
        {s.sheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => s.closeSheet()}
            className="absolute inset-0 z-20 flex items-end bg-black/40"
          >
            <motion.div
              initial={{ y: 320 }}
              animate={{ y: 0 }}
              exit={{ y: 320 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl bg-white p-5"
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-zinc-200" />
              <div className="mt-4 flex h-24 items-center justify-center rounded-2xl text-[44px]" style={{ background: `linear-gradient(135deg, ${s.sheet.from}, ${s.sheet.to})` }}>
                {s.sheet.emoji}
              </div>
              <p className="mt-3 text-[16px] font-extrabold text-zinc-900">{s.sheet.brand}</p>
              <p className="text-[12.5px] text-zinc-400">{pick(s.sheet.value, lang)}</p>
              <button
                data-demo-id="redeem-btn"
                onClick={() => s.redeem()}
                disabled={s.sheet.fins > s.fins}
                className={cn('mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white', s.sheet.fins > s.fins && 'opacity-50')}
                style={{ background: FINDLE_GREEN }}
              >
                <Fin className="h-4 w-4 bg-white/25 text-white" />
                {s.sheet.fins > s.fins ? pick(STR.notEnough, lang) : fmt(pick(STR.redeemFor, lang), { n: s.sheet.fins.toLocaleString('en-US') })}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 교환 성공 오버레이 */}
      <AnimatePresence>
        {s.redeemed && (
          <motion.div
            data-demo-id="redeem-success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className="w-full max-w-xs rounded-3xl bg-white px-6 py-7 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 320 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-200"
              >
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </motion.div>
              <h3 className="mt-3 text-[18px] font-extrabold text-zinc-900">{pick(STR.successTitle, lang)}</h3>
              <p className="mt-1 text-[12.5px] text-zinc-500">{fmt(pick(STR.successBody, lang), { brand: s.redeemed.brand })}</p>
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-bold text-emerald-600">
                <Fin className="h-3 w-3" /> {fmt(pick(STR.remaining, lang), { n: s.fins.toLocaleString('en-US') })}
              </p>
              <button
                data-demo-id="success-cta"
                onClick={() => s.closeRedeemed()}
                className="mt-5 flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl text-[13px] font-bold text-white"
                style={{ background: FINDLE_GREEN }}
              >
                <Gift className="h-4 w-4" /> {pick(STR.successCta, lang)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
