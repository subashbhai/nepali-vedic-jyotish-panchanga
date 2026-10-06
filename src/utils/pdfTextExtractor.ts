import * as pdfjsLib from 'pdfjs-dist';
import { cleanAndDecodePdfText, isChanakyaOrLegacyFont } from './legacyFontDecoder';

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
 * Checks if a string looks like raw unrecoverable binary garbage
 */
export function isBinaryGarbage(text: string): boolean {
  if (!text || text.length === 0) return false;
  
  // If it's Chanakya / Walkman Chanakya / Kruti Dev, it is DECODABLE, not garbage!
  if (isChanakyaOrLegacyFont(text)) {
    return false;
  }

  // Count replacement characters \uFFFD or binary control characters
  let badChars = 0;
  const sample = text.slice(0, 500);
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (sample[i] === '\uFFFD' || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
      badChars++;
    }
  }

  // If more than 15% of characters are non-printable/replacement, it's binary garbage
  return badChars / sample.length > 0.15;
}

/**
 * Extracts readable Unicode / Devanagari text from a PDF File or ArrayBuffer.
 * Automatically detects and decodes legacy fonts (Chanakya, Walkman Chanakya, Kruti Dev).
 */
export async function extractTextFromPdfFile(
  file: File,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<{ text: string; pageCount: number; isScanned: boolean; wasLegacyDecoded: boolean }> {
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
    let hadLegacyFont = false;

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

      const rawPageJoined = lines.join('\n').trim();
      if (rawPageJoined) {
        if (isChanakyaOrLegacyFont(rawPageJoined)) {
          hadLegacyFont = true;
        }
        // Automatically decode legacy Chanakya / Kruti Dev to clean Devanagari Unicode
        const decodedPage = cleanAndDecodePdfText(rawPageJoined);
        pagesText.push(`\n\n--- पृष्ठ ${pageNum} ---\n` + decodedPage);
        totalChars += decodedPage.length;
      }
    }

    let fullText = pagesText.join('\n\n').trim();
    if (isChanakyaOrLegacyFont(fullText)) {
      hadLegacyFont = true;
      fullText = cleanAndDecodePdfText(fullText);
    }

    const isScanned = totalChars < 50 && totalPages > 0;

    return {
      text: fullText,
      pageCount: totalPages,
      isScanned,
      wasLegacyDecoded: hadLegacyFont,
    };
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    throw err;
  }
}

/**
 * Renders PDF pages to high-resolution PNG Data URLs using HTML5 Canvas.
 * Used for AI Vision scanning and OCR of physical/scanned PDFs.
 */
export async function renderPdfPagesToImages(
  file: File,
  options?: { maxPages?: number; scale?: number; onProgress?: (current: number, total: number) => void }
): Promise<{ pageNumber: number; dataUrl: string }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const max = options?.maxPages ? Math.min(options.maxPages, pdf.numPages) : pdf.numPages;
  const scale = options?.scale || 2.0; // 2x scale for sharp OCR resolution
  const results: { pageNumber: number; dataUrl: string }[] = [];

  for (let pageNum = 1; pageNum <= max; pageNum++) {
    if (options?.onProgress) {
      options.onProgress(pageNum, max);
    }

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (ctx) {
      // White background for clean OCR
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      results.push({ pageNumber: pageNum, dataUrl });
    }
  }

  return results;
}

/**
 * Scans a PDF file immediately using high-res Canvas rendering and AI Vision OCR
 * Extracts clean Devanagari Sanskrit mantras and Nepali tika directly from scanned/photo pages.
 */
export async function scanPdfWithAiVisionOcr(
  file: File,
  onProgress?: (progress: { current: number; total: number; stage: string }) => void
): Promise<{ text: string; pageCount: number }> {
  try {
    if (onProgress) onProgress({ current: 0, total: 1, stage: 'PDF पृष्ठहरू उच्च गुणस्तरमा स्क्यान गरिँदैछ...' });

    // Step 1: Render pages to images
    const pages = await renderPdfPagesToImages(file, {
      scale: 2.0,
      onProgress: (current, total) => {
        if (onProgress) {
          onProgress({
            current,
            total,
            stage: `पृष्ठ ${current} / ${total} क्यानभास स्क्यान गरिँदैछ...`
          });
        }
      }
    });

    if (pages.length === 0) {
      throw new Error('PDF बाट कुनै पृष्ठ रेन्डर गर्न सकिएन।');
    }

    const ocrResults: string[] = [];

    // Step 2: Send each page to server Vision OCR endpoint
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: pages.length,
          stage: `पृष्ठ ${i + 1} / ${pages.length} AI दृष्टि (Vision OCR) मार्फत मन्त्र तथा टीका पढिँदैछ...`
        });
      }

      try {
        const resp = await fetch('/api/pdf/scan-ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: page.dataUrl,
            pageNumber: page.pageNumber,
            totalPages: pages.length,
          }),
        });

        if (!resp.ok) {
          throw new Error(`सर्भर OCR असफल: ${resp.statusText}`);
        }

        const data = await resp.json();
        if (data.text && data.text.trim()) {
          const cleanPageText = cleanAndDecodePdfText(data.text);
          ocrResults.push(`\n\n--- पृष्ठ ${page.pageNumber} ---\n` + cleanPageText);
        }
      } catch (pageErr) {
        console.warn(`Page ${page.pageNumber} OCR error:`, pageErr);
      }
    }

    const fullOcrText = ocrResults.join('\n\n').trim();
    return {
      text: fullOcrText,
      pageCount: pages.length,
    };
  } catch (err) {
    console.error('Scan PDF OCR error:', err);
    throw err;
  }
}
