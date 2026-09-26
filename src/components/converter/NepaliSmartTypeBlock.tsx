import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Keyboard,
  Mic,
  MicOff,
  Camera,
  Languages,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sparkles,
  AlertTriangle,
  Loader2,
  FileText,
  Volume2,
  X,
  Upload
} from 'lucide-react';
import {
  transliterateWord,
  transliterateFullText,
  countWords,
  MAX_NEPALI_WORD_LIMIT
} from '../../utils/nepaliTransliteration';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

// Extended Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    Tesseract: any;
  }
}

export const NepaliSmartTypeBlock: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isRomanizedOn, setIsRomanizedOn] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [limitWarning, setLimitWarning] = useState<string>('');

  // Speech to Text State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Camera & OCR State
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrError, setOcrError] = useState<string>('');
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Translation State
  const [sourceLang, setSourceLang] = useState<'ne' | 'en' | 'hi' | 'sa'>('ne');
  const [targetLang, setTargetLang] = useState<'en' | 'ne' | 'hi'>('en');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [transCopied, setTransCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update word count
  useEffect(() => {
    const count = countWords(text);
    setWordCount(count);
    if (count >= MAX_NEPALI_WORD_LIMIT) {
      setLimitWarning(`अधिकतम सीमा (${MAX_NEPALI_WORD_LIMIT} शब्द) पूरा भएको छ। थप शब्द लेख्न मिल्दैन।`);
    } else if (count >= MAX_NEPALI_WORD_LIMIT - 50) {
      setLimitWarning(`सावधानी: तपाईंको शब्द सङ्ख्या ${count}/${MAX_NEPALI_WORD_LIMIT} पुगेको छ।`);
    } else {
      setLimitWarning('');
    }
  }, [text]);

  // Handle Spacebar / Punctuation Transliteration
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isRomanizedOn) return;

    // When Space (keyCode 32) or Enter (keyCode 13) is pressed
    if (e.key === ' ' || e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart;
      const textBeforeCursor = text.substring(0, cursor);
      const textAfterCursor = text.substring(cursor);

      // Find the last word before the cursor
      const match = textBeforeCursor.match(/([a-zA-Z0-9]+)$/);
      if (match) {
        e.preventDefault(); // Intercept to insert transliterated word + space/newline
        const englishWord = match[1];
        const nepaliWord = transliterateWord(englishWord);

        // Check word limit before appending
        const candidateText = textBeforeCursor.substring(0, match.index) + nepaliWord + (e.key === 'Enter' ? '\n' : ' ') + textAfterCursor;
        if (countWords(candidateText) > MAX_NEPALI_WORD_LIMIT) {
          setLimitWarning(`अधिकतम सीमा (${MAX_NEPALI_WORD_LIMIT} शब्द) नाघेको छ।`);
          return;
        }

        const newTextBefore = textBeforeCursor.substring(0, match.index) + nepaliWord + (e.key === 'Enter' ? '\n' : ' ');
        const newFullText = newTextBefore + textAfterCursor;
        setText(newFullText);

        // Restore cursor position
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = newTextBefore.length;
            textareaRef.current.selectionEnd = newTextBefore.length;
          }
        });
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const currentWords = countWords(val);
    if (currentWords > MAX_NEPALI_WORD_LIMIT) {
      setLimitWarning(`अधिकतम सीमा (${MAX_NEPALI_WORD_LIMIT} शब्द) पूरा भएको छ।`);
      return;
    }
    setText(val);
  };

  // Convert all text at once
  const handleConvertAll = () => {
    const converted = transliterateFullText(text);
    setText(converted);
  };

  // Web Speech Recognition (बोलेर टाइप)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ne-NP'; // Nepali (Nepal)

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }

      if (finalTranscript) {
        setText((prev) => {
          const combined = (prev ? prev.trim() + ' ' : '') + finalTranscript.trim();
          if (countWords(combined) > MAX_NEPALI_WORD_LIMIT) {
            setLimitWarning(`शब्द सीमा नाघेको छ।`);
            return prev;
          }
          return combined;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech Recognition Error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('तपाईंको ब्राउजरमा भ्वाइस टाइपिंग सुविधा उपलब्ध छैन। कृपया Chrome वा Edge प्रयोग गर्नुहोस्।');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Dynamic Tesseract Loader for Document OCR
  const loadTesseract = useCallback((): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => reject(new Error('Tesseract script load failed'));
      document.body.appendChild(script);
    });
  }, []);

  // Handle Photo Capture or Upload for OCR
  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError('');
    setIsOcrProcessing(true);
    setOcrProgress(5);

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const Tesseract = await loadTesseract();
      setOcrProgress(20);

      const worker = await Tesseract.createWorker('nep+hin+eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text' && m.progress) {
            setOcrProgress(Math.round(m.progress * 80) + 20);
          }
        },
      });

      const ret = await worker.recognize(file);
      await worker.terminate();

      const recognizedText = ret.data.text.trim();
      if (recognizedText) {
        setText((prev) => {
          const combined = (prev ? prev.trim() + '\n\n' : '') + recognizedText;
          if (countWords(combined) > MAX_NEPALI_WORD_LIMIT) {
            setLimitWarning(`डकुमेन्टको अक्षर थप्दा शब्द सीमा नाघेको छ। केही शब्द छाँटियो।`);
            return combined.split(/\s+/).slice(0, MAX_NEPALI_WORD_LIMIT).join(' ');
          }
          return combined;
        });
      } else {
        setOcrError('तस्बिरबाट अक्षर स्पष्ट पहिचान हुन सकेन। कृपया राम्रो उज्यालोमा पुनः फोटो खिच्नुहोस्।');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      // Fallback simple image text alert
      setOcrError('अक्षर पहिचान गर्न सकिएन वा इन्टरनेट कमजोर छ। कृपया स्पष्ट फोटो खिचेर प्रयास गर्नुहोस्।');
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(100);
    }
  };

  // Handle Translation
  const handleTranslate = async () => {
    if (!text.trim()) return;

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const langPair = `${sourceLang}|${targetLang}`;
      const query = encodeURIComponent(text.substring(0, 1200)); // API limit safety
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${query}&langpair=${langPair}`);
      const data = await response.json();

      if (data.responseData && data.responseData.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setTranslatedText('अनुवाद प्रक्रिया सम्पन्न हुन सकेन। कृपया छोटो वाक्य लेखेर पुन: प्रयास गर्नुहोस्।');
      }
    } catch (err) {
      console.error('Translation Error:', err);
      // Offline fallback dictionary for common astrological / daily terms
      setTranslatedText('इन्टरनेट सेवामा समस्या देखिएको छ। कृपया केही क्षणपछि पुनः अनुवाद गर्नुहोस्।');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleCopyTranslation = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setTransCopied(true);
    setTimeout(() => setTransCopied(false), 1600);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepali_text_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('के तपाईं लेखिएको सम्पूर्ण टेक्स्ट खाली गर्न चाहनुहुन्छ?')) {
      setText('');
      setTranslatedText('');
      setCapturedImagePreview(null);
      setLimitWarning('');
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-md p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-[#7A1C1C] text-white shadow-xs">
              <Keyboard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                <span>नेपालीमा टाइप गर्नुहोस् (Type in Nepali Unicode)</span>
                <span className="text-[11px] font-sans font-bold bg-amber-500/15 text-[#B45309] dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  अधिकतम १००० शब्द
                </span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                अङ्ग्रेजी रोमानाइज्ड (उदा: <i>mero desh nepal</i>) लेखेर स्पेस दिँदा तत्काल नेपाली युनिकोडमा रूपान्तरण हुन्छ
              </p>
            </div>
          </div>
        </div>

        {/* Live Word Count Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-colors flex items-center gap-1.5 ${
            wordCount >= MAX_NEPALI_WORD_LIMIT
              ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300'
              : wordCount >= MAX_NEPALI_WORD_LIMIT - 50
              ? 'bg-amber-500/15 border-amber-500 text-amber-800 dark:text-amber-200'
              : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
          }`}>
            <span>शब्द:</span>
            <span className="text-sm font-black">{toDevanagariNumerals(wordCount)}</span>
            <span>/</span>
            <span>{toDevanagariNumerals(MAX_NEPALI_WORD_LIMIT)}</span>
          </div>

          {/* Toggle Romanized */}
          <button
            type="button"
            onClick={() => setIsRomanizedOn(!isRomanizedOn)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isRomanizedOn
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-300 dark:border-stone-700'
            }`}
            title="रोमानाइज्ड रूपान्तरण अन/अफ गर्नुहोस्"
          >
            रोमानाइज्ड: {isRomanizedOn ? 'चालु' : 'बन्द'}
          </button>
        </div>
      </div>

      {/* Warning if nearing or reaching limit */}
      {limitWarning && (
        <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{limitWarning}</span>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative mb-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={6}
          placeholder="यहाँ अङ्ग्रेजी रोमानाइज्ड नेपाली टाइप गर्नुहोस् (उदा: namaste, mero desh nepal ho, aaja shubha din chha) र स्पेस दिनुहोस्... वा तलको माइकबाट बोलेर लेख्नुहोस् वा क्यामेराबाट डकुमेन्ट स्क्यान गर्नुहोस्..."
          className="w-full p-3.5 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500/80 shadow-inner font-sans resize-y"
        />

        {/* Listening Indicator Overlay */}
        {isListening && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>नेपालीमा सुन्दैछ... बोल्नुहोस्</span>
          </div>
        )}
      </div>

      {/* Multi-Tool Action Bar: Voice, Camera OCR, Convert, Copy, Download, Clear */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 pb-4 border-b border-[#E6E0D5] dark:border-stone-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. बोलेर टाइप गर्नुहोस् (Voice Typing) */}
          <button
            type="button"
            onClick={toggleListening}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs ${
              isListening
                ? 'bg-red-600 text-white border-red-700 animate-bounce'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
            }`}
            title="माइक अन गरी बोलेर नेपालीमा टाइप गर्नुहोस्"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-red-600 dark:text-red-400" />}
            <span>{isListening ? 'माइक बन्द गर्नुहोस्' : 'बोलेर टाइप (Voice)'}</span>
          </button>

          {/* 2. क्यामेरा / डकुमेन्ट स्क्यान (Camera OCR) */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="क्यामेराबाट कागज वा डकुमेन्टको फोटो खिचेर अक्षर निकाल्नुहोस्"
          >
            <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>क्यामेरा फोटो खिच्नुहोस्</span>
          </button>

          {/* Hidden Camera Input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageSelected}
          />

          {/* 3. ग्यालरीबाट फाइल अपलोड */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="तस्बिर फाइल अपलोड गर्नुहोस्"
          >
            <Upload className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">फाइल अपलोड</span>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelected}
          />

          {/* 4. सबैलाई एकैपटक युनिकोडमा बदल्ने */}
          <button
            type="button"
            onClick={handleConvertAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="सम्पूर्ण टेक्स्टलाई नेपाली युनिकोडमा रूपान्तरण गर्नुहोस्"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>सबै रूपान्तरण</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* प्रतिलिपि */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            title="क्लिपबोर्डमा प्रतिलिपि गर्नुहोस्"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'प्रतिलिपि भयो' : 'प्रतिलिपि'}</span>
          </button>

          {/* डाउनलोड .txt */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            title="टेक्स्ट फाइल डाउनलोड गर्नुहोस्"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">डाउनलोड</span>
          </button>

          {/* खाली गर्नुहोस् */}
          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="p-2 bg-stone-100 hover:bg-red-100 dark:bg-stone-800 dark:hover:bg-red-950/40 text-stone-500 hover:text-red-600 rounded-xl border border-stone-300 dark:border-stone-700 transition-all cursor-pointer disabled:opacity-40"
            title="सबै खाली गर्नुहोस्"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OCR Scanner Progress or Image Preview */}
      {isOcrProcessing && (
        <div className="my-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col items-center gap-2 text-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
            क्यामेरा/डकुमेन्टबाट अक्षरहरू पढ्दैछ... ({ocrProgress}%)
          </p>
          <div className="w-full max-w-xs bg-stone-200 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
          </div>
        </div>
      )}

      {capturedImagePreview && !isOcrProcessing && (
        <div className="my-3 p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={capturedImagePreview} alt="Captured Document" className="w-12 h-12 object-cover rounded-lg border border-stone-300 shadow-2xs" />
            <div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">डकुमेन्ट फोटो स्क्यान सम्पन्न</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">तस्बिरबाट निकालिएका अक्षरहरू माथिको बाकसमा थपिएका छन्</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCapturedImagePreview(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {ocrError && (
        <div className="my-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 dark:text-red-300">
          {ocrError}
        </div>
      )}

      {/* Language Translation Section (अनुवाद गर्नुहोस्) */}
      <div className="mt-4 pt-4 bg-gradient-to-r from-stone-50 to-amber-50/40 dark:from-stone-900/60 dark:to-stone-900/40 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-[#D97706]" />
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              डकुमेन्ट तथा टेक्स्ट अनुवाद (Language Translator)
            </h4>
          </div>

          {/* Language Pair Selectors */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200"
            >
              <option value="ne">नेपाली (Nepali)</option>
              <option value="en">English (अंग्रेजी)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="sa">संस्कृत (Sanskrit)</option>
            </select>

            <span className="text-stone-400">→</span>

            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200"
            >
              <option value="en">English (अंग्रेजी)</option>
              <option value="ne">नेपाली (Nepali)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={!text.trim() || isTranslating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7A1C1C] hover:bg-[#8B2323] text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 shadow-2xs"
            >
              {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
              <span>{isTranslating ? 'अनुवाद हुँदैछ...' : 'अनुवाद गर्नुहोस्'}</span>
            </button>
          </div>
        </div>

        {/* Translation Output Box */}
        {translatedText && (
          <div className="p-3 bg-white dark:bg-stone-800/80 rounded-xl border border-stone-300 dark:border-stone-700 shadow-2xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-2 mb-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                अनुवादित नतिजा ({targetLang.toUpperCase()}):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTranslation}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  {transCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{transCopied ? 'प्रतिलिपि भयो' : 'प्रतिलिपि'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setText((prev) => prev + '\n\n' + translatedText)}
                  className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  टेक्स्टमा थप्नुहोस्
                </button>
              </div>
            </div>
            <p className="text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
              {translatedText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
