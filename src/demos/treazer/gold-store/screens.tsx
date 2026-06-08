import { ArrowDownRight, ArrowUpRight, Check, ChevronRight, Minus, Ticket } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { BottomNav, Coin, GoldPill, Wordmark } from '../_shared/ui';
import { fmt, pick, useLang } from '../_shared/i18n';
import { CATEGORIES, CURRENCY, GOLD_GRAMS_PER_UNIT, STR, money, type StoreProduct } from './data';
import { priceInGold, useGoldStore, visibleProducts } from './state';

/** 실시간 금 시세 미니 티커 — ₩/g 숫자가 틱마다 미세 변동 + 상승/하락 화살표 */
function PriceTicker() {
  const { goldPrice, trend, tick } = useGoldStore();
  const up = trend === 'up';
  const down = trend === 'down';
  const Arrow = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  const color = up ? 'text-emerald-400' : down ? 'text-red-400' : 'text-zinc-400';

  return (
    <div data-demo-id="price-ticker" className="flex items-center gap-1.5">
      <span className="text-[10px] text-zinc-400">Gold</span>
      <motion.span
        key={tick}
        initial={{ y: down ? -6 : 6, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn('text-[12px] font-bold tabular-nums', color)}
      >
        ₩{goldPrice.toLocaleString('en-US')}/g
      </motion.span>
      <Arrow className={cn('h-3.5 w-3.5', color)} strokeWidth={2.5} />
    </div>
  );
}

/** 다크 카드 — My Gold Points: 골드 수량 + ₫ 환산 + 그램 환산 + 미니 티커 */
function GoldCard() {
  const { gold, goldFlash } = useGoldStore();
  const lang = useLang();
  const cur = CURRENCY[lang];
  const grams = gold * GOLD_GRAMS_PER_UNIT;

  return (
    <motion.div
      data-demo-id="gold-card"
      animate={goldFlash ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl bg-zinc-900 p-4 text-white"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-300">{pick(STR.myGoldPoints, lang)}</span>
        <PriceTicker />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Coin className="h-6 w-6 text-[12px]" />
        <motion.span
          key={gold}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          className="text-[26px] font-bold tabular-nums"
        >
          {gold.toLocaleString('en-US')}
        </motion.span>
      </div>
      {/* ₫ 환산 + 그램 환산 — 시나리오 v1에서 커서로 강조하는 핵심 영역 */}
      <p data-demo-id="gold-converted" className="mt-1 text-[12px] text-zinc-400">
        = {money(gold * cur.perGold, cur)}{' '}
        <span className="text-amber-400/90">({grams.toFixed(8)} g)</span>
      </p>
    </motion.div>
  );
}

/** 카테고리 칩 행 */
function CategoryChips() {
  const { category, selectCategory } = useGoldStore();
  return (
    <div className="demo-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {CATEGORIES.map((c) => {
        const active = category === c.id;
        return (
          <button
            key={c.id}
            type="button"
            data-demo-id={`cat-${c.id}`}
            onClick={() => selectCategory(active ? null : c.id)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors',
              active ? 'bg-orange-500 text-white' : 'border border-zinc-200 bg-white text-zinc-500',
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/** eGIFT 카드 — 가격은 시세 연동으로 출렁인다 */
function ProductCard({ product }: { product: StoreProduct }) {
  const { goldPrice, openSheet } = useGoldStore();
  const lang = useLang();
  const cost = priceInGold(product, goldPrice);

  return (
    <button
      type="button"
      data-demo-id={`product-${product.id}`}
      onClick={() => openSheet(product)}
      className="overflow-hidden rounded-2xl bg-white text-left shadow-sm"
    >
      {/* eGIFT 비주얼 */}
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-orange-400 to-rose-500">
        <span className="absolute left-2.5 top-2.5 text-[9px] font-semibold text-white/90">{product.brand}</span>
        <span className="text-[22px] font-extrabold italic tracking-tight text-white">eGIFT</span>
        <span className="absolute bottom-2.5 left-2.5 h-1 w-7 rounded-full bg-white/70" />
      </div>
      <div className="p-2.5">
        <p className="text-[10px] text-zinc-400">{product.brand}</p>
        <p className="truncate text-[12.5px] font-bold text-zinc-800">{pick(product.name, lang)}</p>
        <div className="mt-1.5 flex items-center justify-end gap-1">
          <Coin className="h-3.5 w-3.5 text-[8px]" />
          <motion.span
            key={cost}
            initial={{ scale: 1.18, color: '#f97316' }}
            animate={{ scale: 1, color: '#f59e0b' }}
            transition={{ duration: 0.4 }}
            className="text-[12.5px] font-bold tabular-nums"
          >
            {cost.toLocaleString('en-US')}
          </motion.span>
        </div>
      </div>
    </button>
  );
}

/** 상품 상세 — 하단에서 올라오는 bottom sheet */
function ProductSheet() {
  const { sheetProduct, gold, goldPrice, closeSheet, exchange } = useGoldStore();
  const lang = useLang();
  const cur = CURRENCY[lang];

  return (
    <AnimatePresence>
      {sheetProduct && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSheet}
            className="absolute inset-0 z-10 bg-black/40"
          />
          <motion.div
            data-demo-id="product-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl bg-white p-5 pb-6"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-zinc-200" />
            <div className="mt-4 flex gap-3">
              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500">
                <span className="text-[16px] font-extrabold italic text-white">eGIFT</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-zinc-400">{sheetProduct.brand}</p>
                <p className="text-[15px] font-bold leading-tight text-zinc-900">{pick(sheetProduct.name, lang)}</p>
                <p className="mt-1 text-[12px] text-zinc-500">
                  {pick(STR.faceValue, lang)} {money(sheetProduct.faceUnits * cur.perFaceUnit, cur)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-3">
              <span className="text-[12px] text-zinc-500">{pick(STR.priceLive, lang)}</span>
              <span className="flex items-center gap-1.5">
                <Coin className="h-4 w-4 text-[9px]" />
                <span className="text-[16px] font-bold tabular-nums text-zinc-900">
                  {priceInGold(sheetProduct, goldPrice).toLocaleString('en-US')}
                </span>
              </span>
            </div>
            <p className="mt-1.5 px-1 text-[10.5px] text-zinc-400">
              {fmt(pick(STR.pegNote, lang), { n: gold.toLocaleString('en-US') })}
            </p>

            <button
              type="button"
              data-demo-id="exchange-btn"
              onClick={exchange}
              className="mt-4 w-full rounded-xl bg-orange-500 py-3.5 text-[15px] font-bold text-white"
            >
              {pick(STR.exchange, lang)}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** 교환 완료 오버레이 — 성공 체크 애니메이션 + 쿠폰함 저장 안내 */
function ExchangedOverlay() {
  const { exchanged } = useGoldStore();
  const lang = useLang();

  return (
    <AnimatePresence>
      {exchanged && (
        <motion.div
          data-demo-id="exchanged-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 px-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 220 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500"
          >
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </motion.div>
          <p className="mt-5 text-[19px] font-bold text-zinc-900">{pick(STR.exchangedTitle, lang)}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
            {pick(STR.exchangedSavedLine1, lang)}
            <br />
            {pick(STR.exchangedSavedLine2, lang)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function StoreScreen() {
  const { gold, goldFlash, category, coupons } = useGoldStore();
  const lang = useLang();
  const products = visibleProducts(category);

  return (
    <div className="relative flex h-full flex-col bg-[#f4f4f6]">
      <header className="flex shrink-0 items-center justify-between bg-[#f4f4f6] px-5 pb-2 pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-bold tracking-tight text-zinc-900">{pick(STR.store, lang)}</span>
          <Wordmark className="text-[12px] opacity-50" />
        </div>
        <GoldPill amount={gold} flash={goldFlash} />
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-4">
        <GoldCard />

        {/* My Coupon 행 */}
        <button
          type="button"
          data-demo-id="my-coupon"
          className="mt-3 flex w-full items-center justify-between rounded-2xl border border-orange-200 bg-white px-4 py-3"
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold text-orange-500">
            <Ticket className="h-4.5 w-4.5" />
            {pick(STR.myCoupon, lang)}
          </span>
          <span className="flex items-center gap-1 text-[12px] font-bold text-zinc-400">
            {coupons > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-500">{coupons}</span>
            )}
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>

        <CategoryChips />

        {/* 상품 그리드 */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <BottomNav active="store" />

      <ProductSheet />
      <ExchangedOverlay />
    </div>
  );
}

/** 화면 래퍼 — Mobile/Desktop 공용 (스토어는 단일 화면 + 시트/오버레이) */
export function AppScreens() {
  return <StoreScreen />;
}
