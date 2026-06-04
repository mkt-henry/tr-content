import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderTree, X } from 'lucide-react';
import { features } from '../registry';
import { FeatureCard } from './FeatureCard';

/** 런처: 기능 카드 그리드 → 버전/소구점 선택 → 스테이지 진입 */
export function Gallery() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div
      className="grain relative h-full w-full overflow-y-auto"
      style={{
        background:
          'radial-gradient(ellipse 90% 60% at 70% -10%, rgba(154,108,58,0.22), transparent 60%), radial-gradient(ellipse 70% 50% at 10% 110%, rgba(74,52,30,0.25), transparent 60%), linear-gradient(180deg, #121014 0%, #0a090b 100%)',
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl px-8 pb-20 pt-16">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-brass-400">
            insightre.ai · by Treasurer
          </p>
          <h1 className="mt-3 text-6xl font-bold tracking-tight text-zinc-100">
            ARIA <span className="font-medium text-brass-300">— Reinsurance Intelligence</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            재보험 중개 AI 에이전트 ARIA의 데모 스튜디오 — 기능과 소구점을 고르고, 자동 재생을
            켜고, 화면을 녹화하세요. 모든 데모는 더미 데이터로 실제처럼 동작합니다.
          </p>
        </motion.header>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} />
          ))}

          {/* 새 데모 추가 가이드 */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + features.length * 0.08 }}
            onClick={() => setShowGuide(true)}
            className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 text-zinc-500 transition-colors hover:border-brass-500/40 hover:text-brass-300"
          >
            <Plus className="h-7 w-7" />
            <span className="text-sm font-medium">새 데모 추가</span>
            <span className="text-xs text-zinc-600">폴더 하나로 자동 등록</span>
          </motion.button>
        </div>
      </div>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setShowGuide(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#17161a] p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <FolderTree className="h-5 w-5 text-brass-400" />
                <h2 className="text-lg font-semibold text-zinc-100">새 데모 추가하기</h2>
              </div>
              <button onClick={() => setShowGuide(false)} className="text-zinc-500 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              <code className="rounded bg-white/[0.07] px-1.5 py-0.5 text-brass-300">src/demos/</code> 아래에
              폴더를 만들고 <code className="rounded bg-white/[0.07] px-1.5 py-0.5 text-brass-300">index.ts</code>
              에서 FeatureDefinition을 export하면 자동으로 갤러리에 등록됩니다.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-zinc-300">
{`src/demos/my-feature/
├─ index.ts      # FeatureDefinition export
├─ state.ts      # Zustand store (자동/수동 공유)
├─ scenario.ts   # 자동 재생 시나리오
├─ Desktop.tsx   # 데스크탑 UI
├─ Mobile.tsx    # 모바일 UI (선택)
└─ data.ts       # 한국어 더미 데이터`}
            </pre>
            <p className="mt-3 text-xs text-zinc-500">
              버전·소구점 변형은 variants 배열에 추가하면 컨트롤 바에서 전환할 수 있습니다.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
