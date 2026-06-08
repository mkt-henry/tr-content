import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { FeatureDefinition, DemoVariant } from '../registry/types';
import { useShellStore } from '../store/shellStore';

/**
 * 변형 카드 — 기능의 변형(version × 소구점) 하나가 곧 하나의 카드다.
 * 같은 기능의 여러 변형은 각각 독립 카드로 갤러리에 펼쳐진다(드롭다운 없음).
 */
export function VariantCard({
  feature,
  variant,
  index,
}: {
  feature: FeatureDefinition;
  variant: DemoVariant;
  index: number;
}) {
  const open = useShellStore((s) => s.open);
  const thumb = variant.background;
  const Icon = feature.icon;

  return (
    <motion.button
      type="button"
      onClick={() => open(feature.id, variant.id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left transition-colors hover:border-white/[0.16]"
    >
      {/* 썸네일: 변형 배경 미리보기 */}
      <div
        className="relative h-44 w-full overflow-hidden"
        style={thumb.kind === 'gradient' ? { background: thumb.css } : undefined}
      >
        {thumb.kind === 'image' && (
          <img src={thumb.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute left-4 top-4 flex gap-1.5 opacity-60">
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
          <span className="h-2 w-2 rounded-full bg-white/25" />
        </div>
        {Icon && (
          <div
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/15 bg-black/30 backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
            style={{ color: feature.accent }}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-[12px] font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Play className="h-3.5 w-3.5" /> 데모 열기
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* 출처 기능 태그 + 버전 + 소구점 */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
          <span className="font-medium" style={{ color: feature.accent }}>
            {feature.title}
          </span>
          {variant.version && <span className="font-mono text-zinc-500">{variant.version}</span>}
          {variant.sellingPoint && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-400">
              {variant.sellingPoint}
            </span>
          )}
        </div>

        {/* 제목 = 변형 라벨 */}
        <h3 className="mt-1.5 text-[16px] font-semibold text-zinc-100">{variant.label}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">{feature.description}</p>
      </div>
    </motion.button>
  );
}
