import { canUserPrintDocuments } from '../db/subscriptionStore';

// Canvas context helper for converting CSS color strings (oklch, lab, etc.)
let canvasCtx: CanvasRenderingContext2D | null = null;

function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!canvasCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvasCtx = canvas.getContext('2d');
  }
  return canvasCtx;
}

/**
 * Math fallback to parse OKLAB color function if Canvas2D is unavailable or fails
 */
function oklabToRgbMath(oklabStr: string): string {
  const regex = /oklab\(\s*([^\s,/]+)(?:[\s,]+)([^\s,/]+)(?:[\s,]+)([^\s,/]+)(?:\s*(?:\/|,)\s*([^\s,/)]+))?\s*\)/i;
  const match = oklabStr.match(regex);
  if (!match) return '#000000';

  let [, lStr, aStr, bStr, aValStr] = match;

  let L = lStr === 'none' ? 0 : lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
  let aAxis = aStr === 'none' ? 0 : aStr.endsWith('%') ? (parseFloat(aStr) / 100) * 0.4 : parseFloat(aStr);
  let bAxis = bStr === 'none' ? 0 : bStr.endsWith('%') ? (parseFloat(bStr) / 100) * 0.4 : parseFloat(bStr);
  let alpha = aValStr ? (aValStr === 'none' ? 1 : aValStr.endsWith('%') ? parseFloat(aValStr) / 100 : parseFloat(aValStr)) : 1;

  if (isNaN(L)) L = 0;
  if (isNaN(aAxis)) aAxis = 0;
  if (isNaN(bAxis)) bAxis = 0;
  if (isNaN(alpha)) alpha = 1;

  // OKLAB to Linear sRGB
  const l_ = L + 0.3963377774 * aAxis + 0.2158037573 * bAxis;
  const m_ = L - 0.1055613458 * aAxis - 0.0638541728 * bAxis;
  const s_ = L - 0.0894841775 * aAxis - 1.2914855480 * bAxis;

  const lComp = l_ * l_ * l_;
  const mComp = m_ * m_ * m_;
  const sComp = s_ * s_ * s_;

  const rLin = +4.0767416621 * lComp - 3.3077115913 * mComp + 0.2309699292 * sComp;
  const gLin = -1.2684380046 * lComp + 2.6097574011 * mComp - 0.3413193965 * sComp;
  const bLin = -0.0041960863 * lComp - 0.7034186147 * mComp + 1.7076147010 * sComp;

  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    const srgb = clamped > 0.0031308 ? 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055 : 12.92 * clamped;
    return Math.round(srgb * 255);
  };

  const r = toSrgb(rLin);
  const g = toSrgb(gLin);
  const b = toSrgb(bLin);

  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${b}, ${parseFloat(alpha.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Math fallback to parse OKLCH color function if Canvas2D is unavailable or fails
 */
function oklchToRgbMath(oklchStr: string): string {
  const regex = /oklch\(\s*([^\s,/]+)(?:[\s,]+)([^\s,/]+)(?:[\s,]+)([^\s,/]+)(?:\s*(?:\/|,)\s*([^\s,/)]+))?\s*\)/i;
  const match = oklchStr.match(regex);
  if (!match) return '#000000';

  let [, lStr, cStr, hStr, aStr] = match;

  let L = lStr === 'none' ? 0 : lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
  let C = cStr === 'none' ? 0 : cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
  let H = hStr === 'none' ? 0 : parseFloat(hStr.replace(/deg|rad|turn/i, ''));
  let A = aStr ? (aStr === 'none' ? 1 : aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr)) : 1;

  if (isNaN(L)) L = 0;
  if (isNaN(C)) C = 0;
  if (isNaN(H)) H = 0;
  if (isNaN(A)) A = 1;

  const hRad = (H * Math.PI) / 180;
  const aLab = C * Math.cos(hRad);
  const bLab = C * Math.sin(hRad);

  return oklabToRgbMath(`oklab(${L} ${aLab} ${bLab} / ${A})`);
}

/**
 * CIE Lab to sRGB math fallback
 */
function labToRgbMath(labStr: string): string {
  const regex = /lab\(\s*([^\s,/]+)(?:[\s,]+)([^\s,/]+)(?:[\s,]+)([^\s,/]+)(?:\s*(?:\/|,)\s*([^\s,/)]+))?\s*\)/i;
  const match = labStr.match(regex);
  if (!match) return '#000000';
  let [, lStr, aStr, bStr, alphaStr] = match;
  let L = parseFloat(lStr);
  let aAxis = parseFloat(aStr);
  let bAxis = parseFloat(bStr);
  let A = alphaStr ? (alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr)) : 1;
  if (isNaN(L)) L = 0;
  if (isNaN(aAxis)) aAxis = 0;
  if (isNaN(bAxis)) bAxis = 0;
  if (isNaN(A)) A = 1;

  let y = (L + 16) / 116;
  let x = aAxis / 500 + y;
  let z = y - bAxis / 200;

  const fn = (t: number) => (t * t * t > 0.008856 ? t * t * t : (t - 16 / 116) / 7.787);
  x = 0.95047 * fn(x);
  y = 1.00000 * fn(y);
  z = 1.08883 * fn(z);

  let rLin = x * 3.2406 - y * 1.5372 - z * 0.4986;
  let gLin = -x * 0.9689 + y * 1.8758 + z * 0.0415;
  let bLin = x * 0.0557 - y * 0.2040 + z * 1.0570;

  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    const srgb = clamped > 0.0031308 ? 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055 : 12.92 * clamped;
    return Math.round(srgb * 255);
  };

  const r = toSrgb(rLin);
  const g = toSrgb(gLin);
  const b = toSrgb(bLin);

  return A < 1 ? `rgba(${r}, ${g}, ${b}, ${parseFloat(A.toFixed(3))})` : `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts a single modern color expression (oklab, oklch, lab, lch, color-mix) to rgb/rgba
 */
function parseSingleModernColorToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return '#000000';
  const trimmed = colorStr.trim();

  // If already standard format, return directly
  if (trimmed.startsWith('#') || trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
    return trimmed;
  }

  // Try Canvas 2D first - modern Chromium / Electron natively parses oklab, oklch, lab, color-mix
  const ctx = getCanvasCtx();
  if (ctx) {
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = trimmed;
      let res = ctx.fillStyle;
      if (res && res !== '#000000' && !res.includes('okl') && !res.includes('lab') && !res.includes('color(') && !res.includes('color-mix')) {
        return res;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillStyle = trimmed;
      if (ctx.fillStyle === '#000000') {
        return '#000000';
      }
      res = ctx.fillStyle;
      if (res && res !== '#ffffff' && !res.includes('okl') && !res.includes('lab') && !res.includes('color(') && !res.includes('color-mix')) {
        return res;
      }
    } catch {
      // Fall through to math
    }
  }

  // Math & pattern fallbacks
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('oklab(')) {
    return oklabToRgbMath(trimmed);
  }
  if (lower.startsWith('oklch(')) {
    return oklchToRgbMath(trimmed);
  }
  if (lower.startsWith('lab(')) {
    return labToRgbMath(trimmed);
  }
  if (lower.startsWith('lch(')) {
    return oklchToRgbMath(trimmed);
  }
  if (lower.startsWith('color-mix(')) {
    // Matches e.g. color-mix(in oklab, #166534 50%, transparent)
    const transparentMatch = trimmed.match(/color-mix\(\s*in\s+[a-z0-9_-]+,\s*([^,%]+?)\s*(\d+%)?\s*,\s*transparent/i);
    if (transparentMatch) {
      const baseCol = transparentMatch[1].trim();
      const pctStr = transparentMatch[2] || '100%';
      const alpha = parseFloat(pctStr) / 100;
      let rgb = parseSingleModernColorToRgb(baseCol);
      if (rgb.startsWith('rgb(')) {
        return rgb.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
      }
      if (rgb.startsWith('#') && rgb.length === 7) {
        const r = parseInt(rgb.slice(1, 3), 16);
        const g = parseInt(rgb.slice(3, 5), 16);
        const b = parseInt(rgb.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return `rgba(0, 0, 0, ${alpha})`;
    }
    return '#666666';
  }

  if (lower.includes('transparent')) return 'rgba(0, 0, 0, 0)';
  if (lower.includes('white')) return 'rgb(255, 255, 255)';
  return '#333333';
}

const HAS_MODERN_COLOR_REGEX = /(?:oklch|oklab|lab|lch|light-dark|color-mix|color)\s*\(/i;
const MODERN_COLOR_CAPTURE_REGEX = /\b(?:oklch|oklab|lab|lch|light-dark|color-mix|color)\s*\((?:[^()]+|\([^()]*\))*\)/gi;

/**
 * Converts all modern CSS color occurrences in any string to standard rgb/rgba
 */
export function convertAllModernColorsInString(str: string): string {
  if (!str || typeof str !== 'string' || !HAS_MODERN_COLOR_REGEX.test(str)) {
    return str;
  }

  let result = str;
  let iterations = 0;
  while (iterations < 4 && HAS_MODERN_COLOR_REGEX.test(result)) {
    const prev = result;
    result = result.replace(MODERN_COLOR_CAPTURE_REGEX, (match) => parseSingleModernColorToRgb(match));
    if (result === prev) {
      // Force sanitize any leftover unparsed modern color functions so html2canvas never crashes
      result = result.replace(/(?:oklch|oklab|lab|lch|light-dark|color-mix|color)\s*\([^)]*\)/gi, '#000000');
      break;
    }
    iterations++;
  }
  return result;
}

/**
 * Shared DOM clone sanitizer for html2canvas to safely convert modern CSS colors (oklab, oklch, lab, color-mix)
 * and ensure all nested containers are visible for high-fidelity PDF and PNG capture.
 */
export function sanitizeCloneForCanvas(clonedDoc: Document, clonedElement: HTMLElement) {
  // 0. Ensure clonedElement and all its ancestors are visible and not hidden off-screen
  try {
    let current: HTMLElement | null = clonedElement;
    while (current && current !== clonedDoc.body) {
      current.style.position = 'static';
      current.style.left = '0';
      current.style.top = '0';
      current.style.transform = 'none';
      current.style.visibility = 'visible';
      current.style.opacity = '1';
      current.style.display = 'block';
      current = current.parentElement;
    }
  } catch {
    // Ignore style adjustment errors
  }

  // 1. Process and inline parent document stylesheets (converting modern colors to rgb/rgba)
  try {
    const parentDoc = typeof document !== 'undefined' ? document : clonedDoc;
    const parentSheets = Array.from(parentDoc.styleSheets || []);
    parentSheets.forEach((sheet) => {
      try {
        const rules = sheet.cssRules;
        if (rules && rules.length > 0) {
          let sheetCss = '';
          for (let i = 0; i < rules.length; i++) {
            sheetCss += rules[i].cssText + '\n';
          }
          if (sheetCss && HAS_MODERN_COLOR_REGEX.test(sheetCss)) {
            const cleanCss = convertAllModernColorsInString(sheetCss);
            const inlineTag = clonedDoc.createElement('style');
            inlineTag.setAttribute('data-sanitized-inlined', 'true');
            inlineTag.textContent = cleanCss;
            clonedDoc.head.appendChild(inlineTag);
          }
        }
      } catch {
        // Cross-origin stylesheet rules (e.g. google fonts) cannot be read; safe to ignore
      }
    });

    // Remove local link[rel="stylesheet"] from clonedDoc so html2canvas doesn't fetch and crash on raw modern CSS
    const links = Array.from(clonedDoc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.includes('fonts.googleapis.com') && !href.includes('fonts.gstatic.com')) {
        link.remove();
      }
    });
  } catch {
    // Ignore stylesheet inlining errors
  }

  // 2. Process all <style> elements in clonedDoc
  try {
    const styleElements = clonedDoc.querySelectorAll('style');
    styleElements.forEach((styleEl) => {
      if (styleEl.textContent && HAS_MODERN_COLOR_REGEX.test(styleEl.textContent)) {
        styleEl.textContent = convertAllModernColorsInString(styleEl.textContent);
      }
    });
  } catch {
    // Ignore style element errors
  }

  // 3. Process all styleSheets in clonedDoc directly
  try {
    const sheets = Array.from(clonedDoc.styleSheets || []);
    sheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule, idx) => {
          if (rule.cssText && HAS_MODERN_COLOR_REGEX.test(rule.cssText)) {
            const newCssText = convertAllModernColorsInString(rule.cssText);
            try {
              sheet.deleteRule(idx);
              sheet.insertRule(newCssText, idx);
            } catch {
              if ((rule as CSSStyleRule).style) {
                const style = (rule as CSSStyleRule).style;
                for (let i = 0; i < style.length; i++) {
                  const prop = style[i];
                  const val = style.getPropertyValue(prop);
                  if (val && HAS_MODERN_COLOR_REGEX.test(val)) {
                    style.setProperty(prop, convertAllModernColorsInString(val));
                  }
                }
              }
            }
          }
        });
      } catch {
        // Ignore cross-origin stylesheet errors
      }
    });
  } catch {
    // Ignore stylesheet iteration errors
  }

  // 4. Process DOM elements in clonedElement
  const win = clonedDoc.defaultView || window;
  const allElements = Array.from(clonedElement.querySelectorAll('*')) as HTMLElement[];
  if (!allElements.includes(clonedElement)) {
    allElements.push(clonedElement);
  }

  const colorProperties = [
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'text-decoration-color',
    'box-shadow',
    'text-shadow',
    'fill',
    'stroke',
    'stop-color',
    'caret-color',
    'accent-color',
  ];

  allElements.forEach((el) => {
    if (!el) return;

    // 4a. Replace inline style string if present
    const styleAttr = el.getAttribute('style');
    if (styleAttr && HAS_MODERN_COLOR_REGEX.test(styleAttr)) {
      el.setAttribute('style', convertAllModernColorsInString(styleAttr));
    }

    // 4b. Check SVG attributes
    ['fill', 'stroke', 'stop-color', 'color'].forEach((attr) => {
      const attrVal = el.getAttribute(attr);
      if (attrVal && HAS_MODERN_COLOR_REGEX.test(attrVal)) {
        el.setAttribute(attr, convertAllModernColorsInString(attrVal));
      }
    });

    // 4c. Check computed styles and override with inline RGB values
    if (el.style) {
      try {
        const computed = win.getComputedStyle(el);
        colorProperties.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (val && HAS_MODERN_COLOR_REGEX.test(val)) {
            const convertedVal = convertAllModernColorsInString(val);
            el.style.setProperty(prop, convertedVal, 'important');
          }
        });
      } catch {
        // Ignore computed style read failure
      }
    }
  });
}

export async function exportElementToPDF(
  elementId: string, 
  filename: string = 'Astrology_Report.pdf',
  pageSize: 'a4' | 'a5' | 'letter' = 'a4'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return false;
  }

  try {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Check if the container element has discrete pages marked with .print-page or .printable-page
    const directPages = Array.from(
      element.querySelectorAll<HTMLElement>('.print-page, .printable-page')
    );

    if (directPages.length > 0) {
      for (let i = 0; i < directPages.length; i++) {
        const pageEl = directPages[i];
        const pageCanvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFDF7',
          windowWidth: 1200,
          onclone: (clonedDoc, clonedEl) => sanitizeCloneForCanvas(clonedDoc, clonedEl),
        });

        const imgData = pageCanvas.toDataURL('image/png');
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      try {
        pdf.save(filename);
      } catch (saveErr) {
        console.warn('pdf.save direct error:', saveErr);
      }

      // Safe anchor download fallback to ensure file always downloads
      try {
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
      } catch (blobErr) {
        console.error('Blob anchor error:', blobErr);
      }

      return true;
    }

    // Fallback: single canvas with height pagination
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc, clonedEl) => sanitizeCloneForCanvas(clonedDoc, clonedEl),
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdfWidth - 20; // 10mm margin
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    try {
      pdf.save(filename);
    } catch (saveErr) {
      console.warn('pdf.save direct error:', saveErr);
    }

    try {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1500);
    } catch (blobErr) {
      console.error('Blob anchor error:', blobErr);
    }

    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return false;
  }
}

/**
 * Generates a PDF File/Blob object from a DOM element, suitable for navigator.share or WhatsApp dispatch.
 */
export async function generatePDFFileFromElement(
  elementId: string,
  filename: string = 'Astrology_Report.pdf',
  pageSize: 'a4' | 'a5' | 'letter' = 'a4',
  autoDownload: boolean = true
): Promise<{ success: boolean; file?: File; blob?: Blob; error?: string }> {
  const docType = elementId.includes('vastu') ? 'vastu' : (elementId.includes('kundali') || elementId.includes('cheena') || elementId.includes('patrika') || elementId.includes('tipan') || elementId.includes('print_preview') || elementId.includes('faladesh')) ? 'kundali' : 'general';
  const check = canUserPrintDocuments(docType);
  if (!check.allowed) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType } }));
    }
    return { success: false, error: check.reasonNepali };
  }

  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: `Element #${elementId} not found` };
  }

  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const directPages = Array.from(
      element.querySelectorAll<HTMLElement>('.print-page, .printable-page')
    );

    if (directPages.length > 0) {
      for (let i = 0; i < directPages.length; i++) {
        const pageEl = directPages[i];
        if (i > 0) pdf.addPage();

        const pageCanvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
          onclone: (clonedDoc, clonedEl) => sanitizeCloneForCanvas(clonedDoc, clonedEl),
        });

        const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(pageImg, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    } else {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: (clonedDoc, clonedEl) => sanitizeCloneForCanvas(clonedDoc, clonedEl),
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    const blob = pdf.output('blob');
    const file = new File([blob], filename, { type: 'application/pdf' });

    if (autoDownload) {
      pdf.save(filename);
    }

    return { success: true, file, blob };
  } catch (err: any) {
    console.error('generatePDFFileFromElement Error:', err);
    return { success: false, error: err?.message || 'Failed to generate PDF file' };
  }
}

/**
 * Generates a PNG Image File/Blob from a DOM element and downloads it.
 */
export async function generatePNGFileFromElement(
  elementId: string,
  filename: string = 'Report.png',
  autoDownload: boolean = true
): Promise<{ success: boolean; file?: File; blob?: Blob; error?: string }> {
  const docType = elementId.includes('vastu')
    ? 'vastu'
    : elementId.includes('kundali') || elementId.includes('cheena') || elementId.includes('patrika') || elementId.includes('tipan') || elementId.includes('print_preview') || elementId.includes('faladesh')
    ? 'kundali'
    : 'general';
  const check = canUserPrintDocuments(docType);
  if (!check.allowed) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType } }));
    }
    return { success: false, error: check.reasonNepali };
  }

  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: `Element #${elementId} not found` };
  }

  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
      onclone: (clonedDoc, clonedEl) => sanitizeCloneForCanvas(clonedDoc, clonedEl),
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ success: false, error: 'Blob creation failed' });
          return;
        }
        const file = new File([blob], filename, { type: 'image/png' });
        if (autoDownload) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }
        resolve({ success: true, file, blob });
      }, 'image/png');
    });
  } catch (err: any) {
    console.error('generatePNGFileFromElement Error:', err);
    return { success: false, error: err?.message || 'Failed to generate PNG' };
  }
}

export interface PDFProgressInfo {
  currentPage: number;
  totalPages: number;
  currentProfileIndex?: number;
  totalProfiles?: number;
  profileName?: string;
  message: string;
}

/**
 * Exports multiple profiles rendered in a container into a single merged PDF file.
 * Automatically discovers all .print-page and .printable-page elements, renders them with html2canvas,
 * and appends them sequentially to a single jsPDF document.
 */
export async function exportMergedProfilesPDF(
  containerElementId: string,
  filename: string = 'Family_Kundali_Collection.pdf',
  pageSize: 'a4' | 'letter' = 'a4',
  onProgress?: (progress: PDFProgressInfo) => void
): Promise<boolean> {
  const container = document.getElementById(containerElementId);
  if (!container) {
    console.error(`Container element with ID ${containerElementId} not found.`);
    return false;
  }

  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    // Discover all discrete pages (.print-page or .printable-page) across all profiles
    const pages = Array.from(
      container.querySelectorAll<HTMLElement>('.print-page, .printable-page')
    );

    if (pages.length === 0) {
      console.warn('No printable pages found in container. Falling back to single element export.');
      return exportElementToPDF(containerElementId, filename, pageSize);
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const totalPages = pages.length;

    for (let i = 0; i < totalPages; i++) {
      const pageEl = pages[i];
      const pageProfileName = pageEl.getAttribute('data-profile-name') || '';

      if (onProgress) {
        onProgress({
          currentPage: i + 1,
          totalPages,
          profileName: pageProfileName,
          message: `पृष्ठ ${i + 1} / ${totalPages} मुद्रण हुँदैछ... ${pageProfileName ? `(${pageProfileName})` : ''}`,
        });
      }

      // Allow UI thread a tiny tick to update progress bar
      await new Promise((res) => setTimeout(res, 20));

      const pageCanvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFDF7',
        windowWidth: 1200,
        onclone: (clonedDoc, clonedEl) => sanitizeCloneForCanvas(clonedDoc, clonedEl),
      });

      const imgData = pageCanvas.toDataURL('image/png');
      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    if (onProgress) {
      onProgress({
        currentPage: totalPages,
        totalPages,
        message: 'PDF फाइल तयार भयो, डाउनलोड सुरु हुँदैछ...',
      });
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Merged Profiles PDF Generation Error:', error);
    return false;
  }
}

export function printElement(elementId: string) {
  const docType = elementId.includes('vastu') ? 'vastu' : (elementId.includes('kundali') || elementId.includes('cheena') || elementId.includes('patrika') || elementId.includes('tipan') || elementId.includes('print_preview') || elementId.includes('faladesh')) ? 'kundali' : 'general';
  const check = canUserPrintDocuments(docType);
  if (!check.allowed) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType } }));
    }
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Print element #${elementId} not found`);
    return;
  }

  // Remove existing mount if already present
  const existingMount = document.getElementById('balananda-isolated-print-mount');
  if (existingMount) {
    existingMount.remove();
  }

  // Create isolated print mount attached directly to body
  const mount = document.createElement('div');
  mount.id = 'balananda-isolated-print-mount';

  // Deep clone the report element
  const clone = element.cloneNode(true) as HTMLElement;

  // Preserve and replicate canvas bitmap data if any
  const originalCanvases = element.querySelectorAll('canvas');
  const cloneCanvases = clone.querySelectorAll('canvas');
  originalCanvases.forEach((orig, idx) => {
    const dest = cloneCanvases[idx];
    if (dest) {
      dest.width = orig.width;
      dest.height = orig.height;
      const ctx = dest.getContext('2d');
      if (ctx) {
        ctx.drawImage(orig, 0, 0);
      }
    }
  });

  mount.appendChild(clone);
  document.body.appendChild(mount);
  document.body.classList.add('is-printing-report');

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.body.classList.remove('is-printing-report');
    if (document.body.contains(mount)) {
      document.body.removeChild(mount);
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Short delay to allow browser to lay out the cloned DOM before print dialog
  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.error('window.print error:', err);
      cleanup();
    }
    // Safety cleanup in case user closes dialog without afterprint firing
    setTimeout(cleanup, 3000);
  }, 120);
}

export async function exportFaladeshPDF(reportData: any): Promise<boolean> {
  return await exportElementToPDF('printable-faladesh-report', `Faladesh_Report_${reportData?.profile?.name || 'Client'}.pdf`, 'a4');
}

export async function exportDailyHoroscopePDF(elementId: string = 'printable-daily-horoscope-report', filename: string = 'Daily_Horoscope_Report.pdf'): Promise<boolean> {
  return await exportElementToPDF(elementId, filename, 'a4');
}

export async function exportKundaliPDF(
  elementId: string = 'printable-kundali-document',
  filename: string = 'Kundali_Report.pdf'
): Promise<boolean> {
  return await exportElementToPDF(elementId, filename, 'a4');
}

/**
 * Shares a generated PDF file directly to WhatsApp:
 * 1. Generates the PDF file from element ID using generatePDFFileFromElement.
 * 2. Uses Web Share API Level 2 (navigator.share with files) if supported (e.g. mobile Chrome, Safari),
 *    which directly opens the WhatsApp app with the PDF file attached!
 * 3. Desktop/fallback: Automatically downloads the PDF file and opens WhatsApp web/app with the message.
 */
export async function sharePDFToWhatsApp(
  elementId: string,
  filename: string = 'Astrology_Report.pdf',
  messageText: string = 'नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग प्रतिवेदन',
  recipientPhone?: string
): Promise<{ success: boolean; method: string; error?: string }> {
  try {
    const res = await generatePDFFileFromElement(elementId, filename, 'a4', false);
    if (!res.success || !res.file) {
      return { success: false, method: 'none', error: res.error || 'PDF सिर्जना हुन सकेन।' };
    }

    // Standardize recipient phone
    let cleanPhone = recipientPhone ? recipientPhone.replace(/\D/g, '') : '';
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '977' + cleanPhone;
    }

    // Try Web Share API Level 2 (Direct file attachment on mobile)
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [res.file] })
    ) {
      try {
        await navigator.share({
          files: [res.file],
          title: filename,
          text: messageText,
        });
        return { success: true, method: 'web-share' };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { success: false, method: 'aborted', error: 'प्रयोगकर्ताले सेयर रद्द गर्यो।' };
        }
        // Fallback to manual download + WhatsApp link
      }
    }

    // Open WhatsApp Web or App directly without downloading file to user's device
    const encodedText = encodeURIComponent(messageText);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(waUrl, '_blank');
    return { success: true, method: 'whatsapp' };
  } catch (err: any) {
    console.error('sharePDFToWhatsApp error:', err);
    return { success: false, method: 'error', error: err?.message || 'WhatsApp सेयर गर्न असफल भयो।' };
  }
}



