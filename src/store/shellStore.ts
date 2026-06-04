import { create } from 'zustand';
import type { DeviceMode } from '../registry/types';

interface ShellState {
  /** null이면 갤러리 화면 */
  featureId: string | null;
  variantId: string | null;
  device: DeviceMode;
  /** 모바일일 때 폰 목업 프레임 표시 여부 */
  phoneFrame: boolean;
  /** 브라우저 프레임 표시 여부 */
  browserChrome: boolean;
  open: (featureId: string, variantId: string) => void;
  setVariant: (variantId: string) => void;
  backToGallery: () => void;
  setDevice: (device: DeviceMode) => void;
  toggleDevice: () => void;
  togglePhoneFrame: () => void;
  toggleBrowserChrome: () => void;
}

export const useShellStore = create<ShellState>((set) => ({
  featureId: null,
  variantId: null,
  device: 'desktop',
  phoneFrame: true,
  browserChrome: true,
  open: (featureId, variantId) => set({ featureId, variantId }),
  setVariant: (variantId) => set({ variantId }),
  backToGallery: () => set({ featureId: null, variantId: null }),
  setDevice: (device) => set({ device }),
  toggleDevice: () => set((s) => ({ device: s.device === 'desktop' ? 'mobile' : 'desktop' })),
  togglePhoneFrame: () => set((s) => ({ phoneFrame: !s.phoneFrame })),
  toggleBrowserChrome: () => set((s) => ({ browserChrome: !s.browserChrome })),
}));
