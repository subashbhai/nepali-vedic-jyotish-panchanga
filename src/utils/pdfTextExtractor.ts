import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source using unpkg CDN fallback or local bundle
try {
  if (typeof window !== 'undefined') {
    // Set worker URL to matching version or cdn
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker initialization notice:', e);
}

/**
 * Checks if a string looks like raw binary garbage instead of Devanagari/readable text
 */
export function isBinaryGarbage(text: string): boolean {
  if (!text || text.length === 0) return false;
  
  // Count replacement characters \uFFFD or binary control characters
  let badChars = 0;
  const sample = text.slice(0, 500);
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (sample[i] === '\uFFFD' || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
      badChars++;
    }
  }

  // If more than 10% of characters are non-printable/replacement, it's binary garbage
  return badChars / sample.length > 0.08;
}

/**
 * Extracts readable Unicode / Devanagari text from a PDF File or ArrayBuffer
 */
export async function extractTextFromPdfFile(
  file: File,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<{ text: string; pageCount: number; isScanned: boolean }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const pagesText: string[] = [];
    let totalChars = 0;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (onProgress) {
        onProgress({ current: pageNum, total: totalPages });
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let lastY: number | null = null;
      let currentLine = '';
      const lines: string[] = [];

      for (const item of textContent.items as any[]) {
        if ('str' in item && typeof item.str === 'string') {
          const str = item.str.trim();
          if (!str) continue;

          // If Y position difference is significant, treat as a new line
          const y = item.transform ? item.transform[5] : null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 6) {
            if (currentLine) lines.push(currentLine);
            currentLine = str;
          } else {
            currentLine = currentLine ? `${currentLine} ${str}` : str;
          }
          if (y !== null) lastY = y;
        }
      }

      if (currentLine) lines.push(currentLine);

      const pageJoined = lines.join('\n').trim();
      if (pageJoined) {
        pagesText.push(`\n\n--- पृष्ठ ${pageNum} ---\n` + pageJoined);
        totalChars += pageJoined.length;
      }
    }

    const fullText = pagesText.join('\n\n').trim();
    const isScanned = totalChars < 50 && totalPages > 0;

    return {
      text: fullText,
      pageCount: totalPages,
      isScanned,
    };
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    throw err;
  }
}
