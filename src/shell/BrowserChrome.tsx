import { Lock, RotateCw, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { DeviceMode } from '../registry/types';

/** CSS로만 그린 가짜 브라우저 크롬. device에 따라 데스크탑/모바일 스타일. */
export function BrowserChrome({ url, device }: { url: string; device: DeviceMode }) {
  if (device === 'mobile') {
    return (
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#1a191d] px-3 pt-9 pb-2">
        <div className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/[0.07] text-[11px] text-zinc-300">
          <Lock className="h-3 w-3 text-zinc-500" />
          {url}
        </div>
        <RotateCw className="h-3.5 w-3.5 text-zinc-500" />
      </div>
    );
  }
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#1a191d] px-4">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex items-center gap-1.5 text-zinc-600">
        <ChevronLeft className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <RotateCw className="h-3.5 w-3.5" />
      </div>
      <div className="flex h-7 max-w-md flex-1 items-center gap-2 rounded-full bg-white/[0.07] px-3.5 text-[12px] text-zinc-300">
        <Lock className="h-3 w-3 shrink-0 text-zinc-500" />
        <span className="truncate">{url}</span>
      </div>
      <Plus className="h-4 w-4 text-zinc-600" />
    </div>
  );
}
