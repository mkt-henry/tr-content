import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export interface Dims { width: number; height: number }
const SQUARE: Dims = { width: 1080, height: 1080 };

/** 내보내기에 임베드할 자체 호스팅 폰트(한글 명조 + Space Grotesk + IBM Plex Mono).
   라틴 시스템 폰트는 임베드 불필요하지만, 테마별 웹폰트는 반드시 임베드해야 PNG에 반영됨 */
const FACES = [
  { family: 'Nanum Myeongjo', weight: 400, url: '/fonts/nanum-myeongjo-korean-400-normal.woff2' },
  { family: 'Nanum Myeongjo', weight: 700, url: '/fonts/nanum-myeongjo-korean-700-normal.woff2' },
  { family: 'Space Grotesk', weight: 400, url: '/fonts/space-grotesk-latin-400-normal.woff2' },
  { family: 'Space Grotesk', weight: 500, url: '/fonts/space-grotesk-latin-500-normal.woff2' },
  { family: 'Space Grotesk', weight: 600, url: '/fonts/space-grotesk-latin-600-normal.woff2' },
  { family: 'Space Grotesk', weight: 700, url: '/fonts/space-grotesk-latin-700-normal.woff2' },
  { family: 'IBM Plex Mono', weight: 400, url: '/fonts/ibm-plex-mono-latin-400-normal.woff2' },
  { family: 'IBM Plex Mono', weight: 500, url: '/fonts/ibm-plex-mono-latin-500-normal.woff2' },
  { family: 'IBM Plex Mono', weight: 600, url: '/fonts/ibm-plex-mono-latin-600-normal.woff2' },
];

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(bin);
}

/** 자체 폰트만 data-URI @font-face로. fontEmbedCSS를 직접 주어 교차출처 Google Fonts 스캔을 회피 */
let fontEmbedCssPromise: Promise<string> | null = null;
function getFontEmbedCSS(): Promise<string> {
  if (!fontEmbedCssPromise) {
    fontEmbedCssPromise = Promise.all(
      FACES.map(async (f) => {
        const buf = await fetch(f.url).then((r) => r.arrayBuffer());
        return `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};src:url(data:font/woff2;base64,${toBase64(buf)}) format('woff2');}`;
      }),
    ).then((faces) => faces.join('')).catch(() => '');
  }
  return fontEmbedCssPromise;
}

async function nodeToPng(node: HTMLElement, dims: Dims): Promise<string> {
  const fontEmbedCSS = await getFontEmbedCSS();
  return toPng(node, { pixelRatio: 1, cacheBust: true, width: dims.width, height: dims.height, fontEmbedCSS });
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** 슬라이드 한 장 PNG */
export async function exportSlidePng(node: HTMLElement, deckId: string, lang: string, index: number, dims: Dims = SQUARE) {
  download(await nodeToPng(node, dims), `${deckId}-${lang}-${String(index + 1).padStart(2, '0')}.png`);
}

/** 모든 슬라이드 PNG를 ZIP 한 개로 묶어 다운로드 */
export async function exportAllPng(nodes: HTMLElement[], deckId: string, lang: string, dims: Dims = SQUARE) {
  const zip = new JSZip();
  for (let i = 0; i < nodes.length; i++) {
    const dataUrl = await nodeToPng(nodes[i], dims);
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    zip.file(`${deckId}-${lang}-${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true });
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  download(url, `${deckId}-${lang}.zip`);
  URL.revokeObjectURL(url);
}

/** 덱 전체 PDF (슬라이드 1장 = 1페이지) */
export async function exportPdf(nodes: HTMLElement[], deckId: string, lang: string, dims: Dims = SQUARE) {
  const { width, height } = dims;
  const pdf = new jsPDF({ unit: 'px', format: [width, height] });
  for (let i = 0; i < nodes.length; i++) {
    const img = await nodeToPng(nodes[i], dims);
    if (i > 0) pdf.addPage([width, height], width > height ? 'landscape' : 'portrait');
    pdf.addImage(img, 'PNG', 0, 0, width, height);
  }
  pdf.save(`${deckId}-${lang}.pdf`);
}
