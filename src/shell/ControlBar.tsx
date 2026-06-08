import {
  ArrowLeft,
  Clapperboard,
  Frame,
  Maximize,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  PanelTop,
  Square,
  Video,
} from 'lucide-react';
import type { FeatureDefinition, DemoVariant } from '../registry/types';
import type { PlaybackStatus } from '../engine/playbackStore';
import { getProjectIdOfFeature, getProject } from '../registry';
import { getBranding } from '../branding';
import { useShellStore } from '../store/shellStore';
import { cn } from '../lib/cn';

interface ControlBarProps {
  feature: FeatureDefinition;
  variant: DemoVariant;
  status: PlaybackStatus;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onFullscreen: () => void;
  onRecord: () => void;
  canRecord: boolean;
}

/** 하단 플로팅 컨트롤 바. 재생 중에는 숨고, 하단 가장자리에 마우스를 가져가면 나타난다. */
export function ControlBar({ feature, variant, status, onPlay, onStop, onReset, onFullscreen, onRecord, canRecord }: ControlBarProps) {
  const { device, phoneFrame, browserChrome, backToGallery, toggleDevice, togglePhoneFrame, toggleBrowserChrome } =
    useShellStore();
  const projectLang = useShellStore((s) => s.projectLang);
  const setProjectLang = useShellStore((s) => s.setProjectLang);
  const playing = status === 'playing';

  // 프로젝트 단위 언어 전환 — 지원 프로젝트(Treazer 등)의 데모에서만 노출
  const projectId = getProjectIdOfFeature(feature.id);
  const languages = projectId ? getProject(projectId)?.languages : undefined;
  const lang = projectId ? (projectLang[projectId] ?? languages?.[0]?.id) : undefined;
  const mobileOnly = !!(projectId && getProject(projectId)?.mobileOnly);
  const effDevice = mobileOnly ? 'mobile' : device;

  const includeBranding = useShellStore((s) => s.includeBranding);
  const toggleBranding = useShellStore((s) => s.toggleBranding);
  const hasBranding = !!getBranding(projectId);

  return (
    <div
      className={cn(
        'group absolute inset-x-0 bottom-0 z-50 flex justify-center pb-5 pt-10',
        playing ? 'pointer-events-auto' : '',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/10 bg-black/60 px-2 py-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300',
          playing && 'translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
        )}
      >
        <BarButton onClick={backToGallery} label="갤러리로">
          <ArrowLeft className="h-4 w-4" />
        </BarButton>

        <Divider />

        <div className="flex items-center gap-2 px-2">
          {/* 변형은 갤러리에서 독립 카드로 선택 — 여기선 현재 기능·변형을 정적으로 표시 */}
          <span className="max-w-72 truncate text-[12px] text-zinc-300">
            <span className="font-medium" style={{ color: feature.accent }}>
              {feature.title}
            </span>
            <span className="mx-1.5 text-zinc-600">·</span>
            {variant.label}
          </span>

          {languages && projectId && (
            <select
              value={lang}
              onChange={(e) => setProjectLang(projectId, e.target.value)}
              title="데모 언어"
              className="h-8 cursor-pointer rounded-lg border border-white/10 bg-white/[0.06] px-2 text-[12px] text-zinc-200 outline-none hover:bg-white/[0.1]"
            >
              {languages.map((l) => (
                <option key={l.id} value={l.id} className="bg-zinc-900">
                  {l.flag} {l.id.toUpperCase()}
                </option>
              ))}
            </select>
          )}
        </div>

        <Divider />

        {playing ? (
          <BarButton onClick={onStop} label="정지" highlight>
            <Square className="h-4 w-4" />
          </BarButton>
        ) : (
          <BarButton onClick={onPlay} label="자동 재생 (Space)" highlight>
            <Play className="h-4 w-4" />
          </BarButton>
        )}
        <BarButton onClick={onReset} label="리셋 (R)">
          <RotateCcw className="h-4 w-4" />
        </BarButton>

        {hasBranding && (
          <BarButton onClick={toggleBranding} label="인트로/아웃트로" active={includeBranding}>
            <Clapperboard className="h-4 w-4" />
          </BarButton>
        )}

        {canRecord && (
          <BarButton onClick={onRecord} label="녹화 (전체화면)" disabled={playing}>
            <Video className="h-4 w-4 text-red-400" />
          </BarButton>
        )}

        <Divider />

        {!mobileOnly && (
          <BarButton onClick={toggleDevice} label={effDevice === 'desktop' ? '모바일로 (D)' : '데스크탑으로 (D)'}>
            {effDevice === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </BarButton>
        )}
        {effDevice === 'mobile' && (
          <BarButton onClick={togglePhoneFrame} label="폰 프레임 (P)" active={phoneFrame}>
            <Frame className="h-4 w-4" />
          </BarButton>
        )}
        {effDevice === 'desktop' && (
          <BarButton onClick={toggleBrowserChrome} label="브라우저 프레임 (B)" active={browserChrome}>
            <PanelTop className="h-4 w-4" />
          </BarButton>
        )}
        <BarButton onClick={onFullscreen} label="전체 화면 (F)">
          <Maximize className="h-4 w-4" />
        </BarButton>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px bg-white/10" />;
}

function BarButton({
  children,
  onClick,
  label,
  active,
  highlight,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-zinc-100',
        active && 'bg-white/[0.08] text-brass-300',
        highlight && 'bg-brass-500/20 text-brass-300 hover:bg-brass-500/30',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {children}
    </button>
  );
}
