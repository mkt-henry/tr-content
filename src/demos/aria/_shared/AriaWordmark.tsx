import wordmark from '../../../assets/aria/Logo1_White.png';
import { cn } from '../../../lib/cn';

/**
 * ARIA 워드마크 로고 (화이트, 어두운 헤더/사이드바 배경용).
 * 높이는 className으로 지정 — 비율 283:85(약 3.33:1)이 자동 유지된다.
 */
export function AriaWordmark({ className, alt = 'ARIA' }: { className?: string; alt?: string }) {
  return (
    <img
      src={wordmark}
      alt={alt}
      draggable={false}
      className={cn('inline-block w-auto select-none', className)}
    />
  );
}
