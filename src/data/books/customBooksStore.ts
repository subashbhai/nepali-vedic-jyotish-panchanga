import { DigitalReligiousBook } from './bookTypes';
import { PUBLISHED_LETTERHEAD_BOOKS } from './publishedLetterheadBooksData';

const CUSTOM_BOOKS_STORAGE_KEY = 'balananda_custom_digital_books_v1';

/**
 * Get all custom / admin uploaded religious books from localStorage
 */
export function getCustomBooks(): DigitalReligiousBook[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BOOKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load custom digital books:', err);
    return [];
  }
}

/**
 * Save or update a custom book in localStorage
 */
export function saveCustomBook(book: DigitalReligiousBook): void {
  if (typeof window === 'undefined') return;
  try {
    const currentBooks = getCustomBooks();
    const existingIndex = currentBooks.findIndex((b) => b.id === book.id);
    let updated: DigitalReligiousBook[];
    if (existingIndex >= 0) {
      updated = [...currentBooks];
      updated[existingIndex] = book;
    } else {
      updated = [book, ...currentBooks];
    }
    localStorage.setItem(CUSTOM_BOOKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom digital book:', err);
  }
}

/**
 * Delete a custom book by ID
 */
export function deleteCustomBook(bookId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const currentBooks = getCustomBooks();
    const filtered = currentBooks.filter((b) => b.id !== bookId);
    localStorage.setItem(CUSTOM_BOOKS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete custom digital book:', err);
  }
}

/**
 * Get all combined books: Built-in 6 core books + Admin uploaded books
 */
export function getCombinedBooksList(): DigitalReligiousBook[] {
  const custom = getCustomBooks();
  // Filter out any built-in books that might share an ID
  const customFiltered = custom.filter(
    (cb) => !PUBLISHED_LETTERHEAD_BOOKS.some((pb) => pb.id === cb.id)
  );
  return [...customFiltered, ...PUBLISHED_LETTERHEAD_BOOKS];
}
