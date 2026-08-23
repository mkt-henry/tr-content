import { AnimatePresence, motion } from 'framer-motion';
import { useShellStore } from '../../../store/shellStore';

import { ORIGINAL_SCREENS, type OriginalScreenId } from './original.generated';

/**
 * 보여줄 원본 화면은 갤러리에서 고른 변형(variant)이 곧 화면 번호다 — variant id가 '1a'~'1f'.
 * 별도 store를 두면 자동 재생을 눌러야 화면이 바뀌므로 shell 선택값을 그대로 읽는다.
 */
export function useOriginalScreenId(): OriginalScreenId {
  const variantId = useShellStore((s) => s.variantId);
  return variantId && variantId in ORIGINAL_SCREENS ? (variantId as OriginalScreenId) : '1a';
}

/**
 * 원본 설계 문서의 화면 마크업을 그대로 렌더한다.
 * HTML은 저장소에 커밋된 자동 생성 파일(original.generated.ts)에서만 오고 사용자 입력이 섞이지 않으므로
 * dangerouslySetInnerHTML로 원문을 보존한다 — 값을 다시 옮겨 적으면 색·여백이 틀어진다.
 */
export function OriginalScreen() {
  const screen = useOriginalScreenId();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        data-demo-id="screen-scroll"
        // items-start — 원본 프레임이 컨테이너 높이로 눌리지 않고 제 높이대로 서야 한다
        className="demo-scroll flex h-full items-start justify-center overflow-y-auto"
      >
        <div dangerouslySetInnerHTML={{ __html: ORIGINAL_SCREENS[screen] }} />
      </motion.div>
    </AnimatePresence>
  );
}
