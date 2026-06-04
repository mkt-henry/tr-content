import {
  ArrowLeft,
  Frame,
  Maximize,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  PanelTop,
  Square,
} from 'lucide-react';
import type { FeatureDefinition, DemoVariant } from '../registry/types';
import type { PlaybackStatus } from '../engine/playbackStore';
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
}

/** 하단 플로팅 컨트롤 바. 재생 중에는 숨고, 하단 가장자리에 마우스를 가져가면 나타난다. */
export function ControlBar({ feature, variant, status, onPlay, onStop, onReset, onFullscreen }: ControlBarProps) {
  const { device, phoneFrame, browserChrome, setVariant, backToGallery, toggleDevice, togglePhoneFrame, toggleBrowserChrome } =
    useShellStore();
  const playing = status === 'playing';

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
          <span className="max-w-36 truncate text-[12px] font-medium text-zinc-300">{feature.title}</span>
          <select
            value={variant.id}
            onChange={(e) => setVariant(e.target.value)}
            className="h-8 max-w-44 cursor-pointer truncate rounded-lg border border-white/10 bg-white/[0.06] px-2 text-[12px] text-zinc-200 outline-none hover:bg-white/[0.1]"
          >
            {feature.variants.map((v) => (
              <option key={v.id} value={v.id} className="bg-zinc-900">
                {v.label}
              </option>
            ))}
          </select>
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

        <Divider />

        <BarButton onClick={toggleDevice} label={device === 'desktop' ? '모바일로 (D)' : '데스크탑으로 (D)'}>
          {device === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </BarButton>
        {device === 'mobile' && (
          <BarButton onClick={togglePhoneFrame} label="폰 프레임 (P)" active={phoneFrame}>
            <Frame className="h-4 w-4" />
          </BarButton>
        )}
        <BarButton onClick={toggleBrowserChrome} label="브라우저 프레임 (B)" active={browserChrome}>
          <PanelTop className="h-4 w-4" />
        </BarButton>
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-zinc-100',
        active && 'bg-white/[0.08] text-brass-300',
        highlight && 'bg-brass-500/20 text-brass-300 hover:bg-brass-500/30',
      )}
    >
      {children}
    </button>
  );
}
