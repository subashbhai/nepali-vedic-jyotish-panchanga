import { DigitalReligiousBook, BookChapter } from '../../data/books/bookTypes';

export interface PaginatedBookPage {
  pageNumber: number;
  chapterIndex: number;
  chapterTitleNepali: string;
  chapterTitleSanskrit?: string;
  sanskritContent?: string;
  nepaliTikaContent?: string;
  notesNepali?: string;
  isCoverPage?: boolean;
  isFirstPage?: boolean;
  isLastPage?: boolean;
}

/**
 * Intelligent Book Paginator:
 * Breaks any book into structured pages following the user's exact classical rule:
 * 1. First Page: Official Balananda Letterhead Cover / Table of Contents Page
 * 2. Intermediate Pages:
 *    - If No Sanskrit: Full page filled with Nepali text (100% height, no empty half-page).
 *    - If Sanskrit Present: Page filled with top half Sanskrit (2-4 verses) and bottom half Nepali Tika.
 * 3. Last Page: Contains the Official Balananda Publisher Footer & seal.
 * 4. All pages wrapped in the authentic Patrika ॐ repeating border frame!
 */
export function paginateBookIntoPages(book: DigitalReligiousBook): PaginatedBookPage[] {
  const pages: PaginatedBookPage[] = [];

  // Page 1 is the Cover / Title Page with Letterhead Banner
  pages.push({
    pageNumber: 1,
    chapterIndex: -1,
    chapterTitleNepali: book.titleNepali,
    chapterTitleSanskrit: book.titleSanskrit,
    isCoverPage: true,
    isFirstPage: true,
  });

  let currentPageNum = 2;

  book.chapters.forEach((chapter, chIdx) => {
    const sanskritRaw = (chapter.contentSanskrit || '').trim();
    const tikaRaw = (chapter.contentNepaliTika || '').trim();

    // 1. SCENARIO A: NO SANSKRIT AT ALL (e.g., pure remedies, totke, vrat katha without Sanskrit)
    // -> Fill full pages with Nepali text!
    if (!sanskritRaw && tikaRaw) {
      // Chunk into ~1000-1200 character blocks so each A4 page is nicely filled
      const paragraphs = tikaRaw.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      let currentChunk = '';
      const chunks: string[] = [];

      for (const para of paragraphs) {
        if ((currentChunk + '\n\n' + para).length > 1100 && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = para;
        } else {
          currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
        }
      }
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      chunks.forEach((chunkText, cIdx) => {
        pages.push({
          pageNumber: currentPageNum++,
          chapterIndex: chIdx,
          chapterTitleNepali: chapter.titleNepali,
          chapterTitleSanskrit: chapter.titleSanskrit,
          sanskritContent: undefined, // no Sanskrit -> full page Nepali
          nepaliTikaContent: chunkText,
          notesNepali: cIdx === chunks.length - 1 ? chapter.notesNepali : undefined,
        });
      });
      return;
    }

    // 2. SCENARIO B: SANSKRIT IS PRESENT
    // Check if chapter has distinct numbered verses (e.g. ॥१॥, ॥२॥ or मन्त्र १, मन्त्र २)
    const hasVerseNumbers = /॥\d+॥/.test(sanskritRaw) || /॥[०-९]+॥/.test(sanskritRaw);

    if (hasVerseNumbers) {
      // Split Sanskrit into individual verses
      const sktParts = sanskritRaw.split(/(॥\d+॥|॥[०-९]+॥)/g);
      const verses: string[] = [];
      for (let i = 0; i < sktParts.length - 1; i += 2) {
        const verseText = (sktParts[i] + ' ' + (sktParts[i + 1] || '')).trim();
        if (verseText) verses.push(verseText);
      }
      if (sktParts.length % 2 === 1 && sktParts[sktParts.length - 1].trim()) {
        const last = sktParts[sktParts.length - 1].trim();
        if (verses.length > 0) {
          verses[verses.length - 1] += '\n' + last;
        } else {
          verses.push(last);
        }
      }

      // Split Nepali Tika into corresponding explanations
      const tikaHasNumbers = /(?:मन्त्र|श्लोक)\s*[०-९\d]+:?/.test(tikaRaw);
      let tikaBlocks: string[] = [];

      if (tikaHasNumbers) {
        const tParts = tikaRaw.split(/(?=(?:मन्त्र|श्लोक)\s*[०-९\d]+:?)/g);
        tikaBlocks = tParts.map((t) => t.trim()).filter(Boolean);
      } else {
        tikaBlocks = tikaRaw.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
      }

      // Chunk 2 to 4 verses per page so each page is well filled (top half Sanskrit, bottom half Tika)
      const versesPerPage = verses.length > 12 ? 4 : verses.length > 5 ? 3 : 2;

      for (let vIdx = 0; vIdx < verses.length; vIdx += versesPerPage) {
        const chunkSkt = verses.slice(vIdx, vIdx + versesPerPage).join('\n\n');
        
        let chunkTika = '';
        if (tikaBlocks.length > 0) {
          const ratio = tikaBlocks.length / verses.length;
          const startT = Math.floor(vIdx * ratio);
          const endT = Math.min(tikaBlocks.length, Math.ceil((vIdx + versesPerPage) * ratio));
          chunkTika = tikaBlocks.slice(startT, endT).join('\n\n');
        }

        pages.push({
          pageNumber: currentPageNum++,
          chapterIndex: chIdx,
          chapterTitleNepali: chapter.titleNepali,
          chapterTitleSanskrit: chapter.titleSanskrit,
          sanskritContent: chunkSkt,
          nepaliTikaContent: chunkTika || (vIdx === 0 ? tikaRaw : '—'),
          notesNepali: vIdx + versesPerPage >= verses.length ? chapter.notesNepali : undefined,
        });
      }
    } else {
      // Long prose Sanskrit + Nepali (like dhyana, nyasa, vidhi):
      const combinedLen = sanskritRaw.length + tikaRaw.length;

      if (combinedLen > 1200) {
        const sktParagraphs = sanskritRaw ? sanskritRaw.split(/\n\s*\n/) : [];
        const tikaParagraphs = tikaRaw ? tikaRaw.split(/\n\s*\n/) : [];

        const totalChunks = Math.max(2, Math.ceil(combinedLen / 1100));
        const sktChunkSize = Math.max(1, Math.ceil(sktParagraphs.length / totalChunks));
        const tikaChunkSize = Math.max(1, Math.ceil(tikaParagraphs.length / totalChunks));

        for (let pIdx = 0; pIdx < totalChunks; pIdx++) {
          const chunkSkt = sktParagraphs.slice(pIdx * sktChunkSize, (pIdx + 1) * sktChunkSize).join('\n\n');
          const chunkTika = tikaParagraphs.slice(pIdx * tikaChunkSize, (pIdx + 1) * tikaChunkSize).join('\n\n');

          if (chunkSkt || chunkTika) {
            pages.push({
              pageNumber: currentPageNum++,
              chapterIndex: chIdx,
              chapterTitleNepali: chapter.titleNepali,
              chapterTitleSanskrit: chapter.titleSanskrit,
              sanskritContent: chunkSkt || undefined,
              nepaliTikaContent: chunkTika || undefined,
              notesNepali: pIdx === totalChunks - 1 ? chapter.notesNepali : undefined,
            });
          }
        }
      } else {
        pages.push({
          pageNumber: currentPageNum++,
          chapterIndex: chIdx,
          chapterTitleNepali: chapter.titleNepali,
          chapterTitleSanskrit: chapter.titleSanskrit,
          sanskritContent: sanskritRaw || undefined,
          nepaliTikaContent: tikaRaw || undefined,
          notesNepali: chapter.notesNepali,
        });
      }
    }
  });

  // Mark first and last page flags
  if (pages.length > 0) {
    pages[0].isFirstPage = true;
    pages[pages.length - 1].isLastPage = true;
  }

  return pages;
}
