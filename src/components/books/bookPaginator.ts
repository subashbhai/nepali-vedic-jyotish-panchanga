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
}

/**
 * Intelligent Book Paginator:
 * Breaks any book into structured pages following the user's exact classical rule:
 * 1. Page 1: Official Balananda Letterhead Cover / Table of Contents Page
 * 2. Subsequent Pages:
 *    - Upper Half (५०%): मूल संस्कृत मन्त्र / श्लोक (as many as fit nicely, usually 2 to 4 verses)
 *    - Lower Half (५०%): प्रामाणिक नेपाली टीका एवं विधि for those exact verses
 * 3. All pages wrapped in the authentic Patrika ॐ repeating border frame!
 */
export function paginateBookIntoPages(book: DigitalReligiousBook): PaginatedBookPage[] {
  const pages: PaginatedBookPage[] = [];

  // Page 1 is the Cover / Title Page
  pages.push({
    pageNumber: 1,
    chapterIndex: -1,
    chapterTitleNepali: book.titleNepali,
    chapterTitleSanskrit: book.titleSanskrit,
    isCoverPage: true,
  });

  let currentPageNum = 2;

  book.chapters.forEach((chapter, chIdx) => {
    const sanskritRaw = (chapter.contentSanskrit || '').trim();
    const tikaRaw = (chapter.contentNepaliTika || '').trim();

    // Check if chapter has distinct numbered verses (e.g. ॥१॥, ॥२॥ or मन्त्र १, मन्त्र २)
    const hasVerseNumbers = /॥\d+॥/.test(sanskritRaw) || /॥[०-९]+॥/.test(sanskritRaw);

    if (hasVerseNumbers) {
      // Split Sanskrit into individual verses
      // Match delimiter with capturing group
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
      // Look for मन्त्र १, मन्त्र २ or श्लोक १, श्लोक २ or blank lines
      const tikaHasNumbers = /(?:मन्त्र|श्लोक)\s*[०-९\d]+:?/.test(tikaRaw);
      let tikaBlocks: string[] = [];

      if (tikaHasNumbers) {
        const tParts = tikaRaw.split(/(?=(?:मन्त्र|श्लोक)\s*[०-९\d]+:?)/g);
        tikaBlocks = tParts.map((t) => t.trim()).filter(Boolean);
      } else {
        // Split by double newline paragraphs
        tikaBlocks = tikaRaw.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
      }

      // Chunk 2 to 4 verses per page (depending on length)
      const versesPerPage = verses.length > 10 ? 4 : verses.length > 4 ? 3 : 2;

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
      // Long prose or ritual procedure:
      // If text is long (> 1200 characters), split into 2 or more balanced pages
      const combinedLen = sanskritRaw.length + tikaRaw.length;

      if (combinedLen > 1400) {
        // Split into chunks
        const sktParagraphs = sanskritRaw ? sanskritRaw.split(/\n\s*\n/) : [];
        const tikaParagraphs = tikaRaw ? tikaRaw.split(/\n\s*\n/) : [];

        const totalChunks = Math.max(
          2,
          Math.ceil(combinedLen / 1200)
        );

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
        // Fits comfortably on a single A4 Patrika page
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

  return pages;
}
