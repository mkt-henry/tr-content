import { create } from 'zustand';
import type { DeviceMode } from '../registry/types';

interface ShellState {
  /** 갤러리에서 선택된 프로젝트 탭 */
  projectId: string;
  /** 프로젝트별 선택 언어 — 미설정 시 프로젝트 languages의 첫 항목 */
  projectLang: Record<string, string>;
  /** null이면 갤러리 화면 */
  featureId: string | null;
  variantId: string | null;
  /** 프로젝트별 갤러리 모드 — 'video'(기본) | 'cardnews' */
  galleryMode: Record<string, 'video' | 'cardnews'>;
  setGalleryMode: (projectId: string, mode: 'video' | 'cardnews') => void;
  /** null이 아니면 카드뉴스 뷰어 화면 */
  cardnewsId: string | null;
  openCardnews: (deckId: string) => void;
  device: DeviceMode;
  /** 모바일일 때 폰 목업 프레임 표시 여부 */
  phoneFrame: boolean;
  /** 브라우저 프레임 표시 여부 */
  browserChrome: boolean;
  setProject: (projectId: string) => void;
  setProjectLang: (projectId: string, lang: string) => void;
  open: (featureId: string, variantId: string) => void;
  backToGallery: () => void;
  setDevice: (device: DeviceMode) => void;
  toggleDevice: () => void;
  togglePhoneFrame: () => void;
  toggleBrowserChrome: () => void;
  /** 인트로 삽입 여부 (브랜딩 정의된 프로젝트에서만 의미) */
  includeIntro: boolean;
  /** 아웃트로 삽입 여부 */
  includeOutro: boolean;
  toggleIntro: () => void;
  toggleOutro: () => void;
}

export const useShellStore = create<ShellState>((set) => ({
  projectId: 'aria',
  projectLang: {},
  featureId: null,
  variantId: null,
  device: 'desktop',
  phoneFrame: true,
  browserChrome: true,
  includeIntro: false,
  includeOutro: false,
  setProject: (projectId) => set({ projectId }),
  setProjectLang: (projectId, lang) =>
    set((s) => ({ projectLang: { ...s.projectLang, [projectId]: lang } })),
  galleryMode: {},
  cardnewsId: null,
  setGalleryMode: (projectId, mode) =>
    set((s) => ({ galleryMode: { ...s.galleryMode, [projectId]: mode } })),
  openCardnews: (deckId) => set({ cardnewsId: deckId }),
  open: (featureId, variantId) => set({ featureId, variantId }),
  backToGallery: () => set({ featureId: null, variantId: null, cardnewsId: null }),
  setDevice: (device) => set({ device }),
  toggleDevice: () => set((s) => ({ device: s.device === 'desktop' ? 'mobile' : 'desktop' })),
  togglePhoneFrame: () => set((s) => ({ phoneFrame: !s.phoneFrame })),
  toggleBrowserChrome: () => set((s) => ({ browserChrome: !s.browserChrome })),
  toggleIntro: () => set((s) => ({ includeIntro: !s.includeIntro })),
  toggleOutro: () => set((s) => ({ includeOutro: !s.includeOutro })),
}));
