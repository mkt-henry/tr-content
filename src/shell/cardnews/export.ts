import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const OPT = { pixelRatio: 1, cacheBust: true, width: 1080, height: 1080, skipFonts: true } as const;

async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, OPT);
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
export async function exportSlidePng(node: HTMLElement, deckId: string, lang: string, index: number) {
  download(await nodeToPng(node), `${deckId}-${lang}-${String(index + 1).padStart(2, '0')}.png`);
}

/** 모든 슬라이드 PNG 순차 다운로드 */
export async function exportAllPng(nodes: HTMLElement[], deckId: string, lang: string) {
  for (let i = 0; i < nodes.length; i++) {
    download(await nodeToPng(nodes[i]), `${deckId}-${lang}-${String(i + 1).padStart(2, '0')}.png`);
  }
}

/** 덱 전체 PDF (1:1 페이지) */
export async function exportPdf(nodes: HTMLElement[], deckId: string, lang: string) {
  const pdf = new jsPDF({ unit: 'px', format: [1080, 1080] });
  for (let i = 0; i < nodes.length; i++) {
    const img = await nodeToPng(nodes[i]);
    if (i > 0) pdf.addPage([1080, 1080], 'portrait');
    pdf.addImage(img, 'PNG', 0, 0, 1080, 1080);
  }
  pdf.save(`${deckId}-${lang}.pdf`);
}
