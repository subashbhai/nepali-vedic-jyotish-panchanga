import React, { useEffect, useState } from 'react';
import { transliterateWord, transliterateFullText, setNativeInputValue } from '../../utils/nepaliTransliteration';

const STORAGE_KEY = 'nepali_typing_global_enabled';
const EXCLUDED_INPUT_TYPES = new Set([
  'password',
  'email',
  'number',
  'file',
  'checkbox',
  'radio',
  'range',
  'color',
  'date',
  'time',
  'datetime-local',
  'month',
  'week',
  'url'
]);

/**
 * Universal Romanized English to Nepali Transliteration Manager
 * Enables auto-conversion across all text inputs & textareas in the software.
 * Supports hotkey Ctrl+M to toggle on/off.
 */
export const GlobalNepaliInputManager: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleNepaliTyping = () => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch (e) {
        console.error(e);
      }
      triggerToast(
        next
          ? '🇳🇵 नेपाली युनिकोड टाइपिङ सक्रिय गरियो (English -> नेपाली)'
          : '🇬🇧 अङ्ग्रेजी टाइपिङ सक्रिय (English Typing Only)'
      );
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle hotkey: Ctrl+M or Cmd+M
      if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleNepaliTyping();
        return;
      }

      if (!isEnabled) return;

      // Only handle Space and Enter for phonetic word expansion
      if (e.key !== ' ' && e.key !== 'Enter') return;

      const target = e.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return;
      }

      if (target.readOnly || target.disabled) return;

      if (target instanceof HTMLInputElement) {
        const type = (target.type || 'text').toLowerCase();
        if (EXCLUDED_INPUT_TYPES.has(type)) return;
      }

      // Respect data-no-transliterate attribute
      if (target.dataset.noTransliterate === 'true' || target.dataset.lang === 'en') {
        return;
      }

      const cursor = target.selectionStart ?? 0;
      const selEnd = target.selectionEnd ?? cursor;
      if (cursor !== selEnd) return; // Do not alter selected ranges

      const val = target.value;
      const textBefore = val.substring(0, cursor);
      const textAfter = val.substring(cursor);

      // Match last English alphanumeric word right before cursor
      const match = textBefore.match(/([a-zA-Z0-9]+)$/);
      if (!match || match.index === undefined) return;

      const englishWord = match[1];

      // Avoid transliterating URLs, file extensions, or technical protocols
      if (/^(https?|ftp|www|com|org|net|gov|edu|io|html?|php|jpg|png|webp|mp4|pdf)$/i.test(englishWord)) {
        return;
      }

      // Check preceding character (e.g. url slashes or email @)
      const prevChar = match.index > 0 ? textBefore.charAt(match.index - 1) : '';
      if (prevChar === '/' || prevChar === '@' || prevChar === ':' || prevChar === '.' || prevChar === '#') {
        return;
      }

      const nepaliWord = transliterateWord(englishWord);
      if (!nepaliWord || nepaliWord === englishWord) return;

      e.preventDefault();
      const sep = e.key === 'Enter' ? '\n' : ' ';
      const newBefore = textBefore.substring(0, match.index) + nepaliWord + sep;
      const newFull = newBefore + textAfter;

      setNativeInputValue(target, newFull);

      requestAnimationFrame(() => {
        target.selectionStart = newBefore.length;
        target.selectionEnd = newBefore.length;
      });
    };

    const handleBlur = (e: FocusEvent) => {
      if (!isEnabled) return;
      const target = e.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (target.readOnly || target.disabled) return;

      if (target instanceof HTMLInputElement) {
        const type = (target.type || 'text').toLowerCase();
        if (EXCLUDED_INPUT_TYPES.has(type)) return;
      }

      if (target.dataset.noTransliterate === 'true' || target.dataset.lang === 'en') return;

      const val = target.value;
      if (!val || !/[a-zA-Z]/.test(val)) return;

      // Skip URLs, emails, codes
      if (
        val.includes('http://') ||
        val.includes('https://') ||
        val.includes('@') ||
        val.includes('.com') ||
        val.includes('.net') ||
        val.includes('.org')
      ) {
        return;
      }

      const converted = transliterateFullText(val);
      if (converted && converted !== val) {
        setNativeInputValue(target, converted);
      }
    };

    // Attach in capture mode to intercept before default key handlers
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('blur', handleBlur, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, [isEnabled]);

  // Check if admin command center is active
  const [isAdminPresent, setIsAdminPresent] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const el = document.querySelector('[data-admin-command-center]');
      const isHashAdmin = typeof window !== 'undefined' && window.location.hash.includes('admin');
      setIsAdminPresent(!!el || isHashAdmin);
    };
    checkAdmin();
    const timer = setInterval(checkAdmin, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Discreet Floating Typing Pill (Hidden inside Super Admin Command Center) */}
      {!isAdminPresent && (
        <div className="fixed bottom-4 left-4 z-40 print:hidden select-none flex items-center gap-2 animate-fadeIn">
          <button
            type="button"
            onClick={toggleNepaliTyping}
            title="नेपाली युनिकोड टाइपिङ स्विच गर्नुहोस् (Shortcut: Ctrl+M)"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all border backdrop-blur-md cursor-pointer ${
              isEnabled
                ? 'bg-amber-950/85 text-amber-200 border-amber-500/50 hover:bg-amber-900/90 shadow-amber-950/30'
                : 'bg-stone-900/85 text-stone-400 border-stone-700/60 hover:bg-stone-800 shadow-stone-950/30'
            }`}
          >
            <span className="text-sm">{isEnabled ? '🇳🇵' : '🇬🇧'}</span>
            <span>{isEnabled ? 'नेपाली टाइपिङ [Ctrl+M]' : 'English [Ctrl+M]'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isEnabled ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-stone-500'
              }`}
            />
          </button>
        </div>
      )}

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-14 left-4 z-50 pointer-events-none animate-bounce">
          <div className="px-3.5 py-2 rounded-xl bg-stone-900/95 text-white text-xs font-semibold shadow-2xl border border-amber-500/40 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};
