import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderTree, X, Hourglass, Images } from 'lucide-react';
import { projects, getFeaturesByProject } from '../registry';
import { getAssetsByProject } from '../registry/assets';
import { useShellStore } from '../store/shellStore';
import { cn } from '../lib/cn';
import { FeatureCard } from './FeatureCard';

/** 런처: 프로젝트 탭 → 기능 카드 그리드 → 버전/소구점 선택 → 스테이지 진입 */
export function Gallery() {
  const [showGuide, setShowGuide] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const projectId = useShellStore((s) => s.projectId);
  const setProject = useShellStore((s) => s.setProject);

  const project = projects.find((p) => p.id === projectId) ?? projects[0];
  const features = getFeaturesByProject(project.id);
  const assets = getAssetsByProject(project.id);

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
            Treasurer Content Inbox
          </p>

          {/* 프로젝트 탭 */}
          <div className="mt-6 flex items-center gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProject(p.id)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  p.id === project.id
                    ? 'border-brass-500/50 bg-brass-500/15 text-brass-200'
                    : 'border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-300',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>

          <h1 className="mt-5 text-6xl font-bold tracking-tight text-zinc-100">
            {project.name}
            {project.tagline && (
              <span className="font-medium text-brass-300"> — {project.tagline}</span>
            )}
          </h1>
          <div className="mt-4 flex items-end justify-between gap-6">
            <p className="max-w-xl text-[15px] leading-relaxed text-zinc-400">
              {project.description}
            </p>
            {assets.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAssets(true)}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-brass-500/25 bg-brass-500/[0.08] px-4 py-2.5 text-[13px] font-medium text-brass-300 transition-colors hover:border-brass-500/50 hover:bg-brass-500/15"
              >
                <Images className="h-4 w-4" />
                참고 에셋 보기
                <span className="rounded-md bg-brass-500/20 px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
                  {assets.length}
                </span>
              </button>
            )}
          </div>
        </motion.header>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} />
          ))}

          {features.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] text-zinc-500"
            >
              <Hourglass className="h-7 w-7" />
              <span className="text-sm font-medium">데모 준비 중</span>
              <span className="text-xs text-zinc-600">아직 등록된 데모가 없습니다</span>
            </motion.div>
          )}

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
              <code className="rounded bg-white/[0.07] px-1.5 py-0.5 text-brass-300">src/demos/{project.id}/</code> 아래에
              폴더를 만들고 <code className="rounded bg-white/[0.07] px-1.5 py-0.5 text-brass-300">index.ts</code>
              에서 FeatureDefinition을 export하면 자동으로 갤러리에 등록됩니다.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-zinc-300">
{`src/demos/${project.id}/my-feature/
├─ index.ts      # FeatureDefinition export
├─ state.ts      # Zustand store (자동/수동 공유)
├─ scenario.ts   # 자동 재생 시나리오
├─ Desktop.tsx   # 데스크탑 UI
├─ Mobile.tsx    # 모바일 UI (선택)
└─ data.ts       # 한국어 더미 데이터`}
            </pre>
            <p className="mt-3 text-xs text-zinc-500">
              버전·소구점 변형은 variants 배열에 추가하면 컨트롤 바에서 전환할 수 있습니다. 참고
              에셋 이미지는 <code className="rounded bg-white/[0.07] px-1.5 py-0.5 text-brass-300">src/assets/{project.id}/</code>에
              넣으면 자동으로 등록됩니다.
            </p>
          </motion.div>
        </div>
      )}

      {/* 참고 에셋 뷰어 */}
      {showAssets && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setShowAssets(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#17161a] p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Images className="h-5 w-5 text-brass-400" />
                <h2 className="text-lg font-semibold text-zinc-100">{project.name} 참고 에셋</h2>
              </div>
              <button onClick={() => setShowAssets(false)} className="text-zinc-500 hover:text-zinc-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              <code className="rounded bg-white/[0.07] px-1.5 py-0.5 text-brass-300">src/assets/{project.id}/</code>의
              이미지가 자동으로 표시됩니다. 클릭하면 원본 크기로 볼 수 있습니다.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {assets.map((a) => (
                <button
                  key={a.url}
                  type="button"
                  onClick={() => setLightbox(a.url)}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left transition-colors hover:border-brass-500/40"
                >
                  <img src={a.url} alt={a.name} className="aspect-video w-full object-cover" />
                  <span className="block truncate px-3 py-2 font-mono text-[11px] text-zinc-400 group-hover:text-brass-300">
                    {a.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* 에셋 원본 확대 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-8 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
