import { create } from 'zustand';
import type { SegmentId } from './data';

interface PersonalizedTabState {
  /** 현재 맞춤 탭이 조립된 기준 유저군 */
  segment: SegmentId;
  /** 기준 변경 바텀시트 */
  pickerOpen: boolean;

  setSegment: (segment: SegmentId) => void;
  openPicker: () => void;
  closePicker: () => void;
  reset: () => void;
}

export const usePersonalizedTab = create<PersonalizedTabState>((set) => ({
  segment: 'commodity',
  pickerOpen: false,

  // 기준을 고르면 시트가 닫히고 화면이 그 유저군 순서로 다시 조립된다
  setSegment: (segment) => set({ segment, pickerOpen: false }),
  openPicker: () => set({ pickerOpen: true }),
  closePicker: () => set({ pickerOpen: false }),

  reset: () => set({ segment: 'commodity', pickerOpen: false }),
}));
