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
 * Math fallback to parse OKLCH color function if Canvas2D is unavailable or fails
 */
function oklchToRgbMath(oklchStr: string): string {
  // Matches oklch(L C H [/ A]) or oklch(L, C, H[, A])
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

  // OKLCH to OKLAB
  const hRad = (H * Math.PI) / 180;
  const aLab = C * Math.cos(hRad);
  const bLab = C * Math.sin(hRad);

  // OKLAB to Linear sRGB
  const l_ = L + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m_ = L - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s_ = L - 0.0894841775 * aLab - 1.2914855480 * bLab;

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

  if (A < 1) {
    return `rgba(${r}, ${g}, ${b}, ${parseFloat(A.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts a single oklch(...) expression to rgb/rgba
 */
function parseSingleOklchToRgb(oklchMatch: string): string {
  const ctx = getCanvasCtx();
  if (ctx) {
    try {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = oklchMatch;
      const result = ctx.fillStyle;
      if (result && result !== '#000000') {
        return result;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillStyle = oklchMatch;
      if (ctx.fillStyle === '#000000') {
        return '#000000';
      }
      if (ctx.fillStyle && ctx.fillStyle !== '#ffffff') {
        return ctx.fillStyle;
      }
    } catch {
      // Fall through to math
    }
  }
  return oklchToRgbMath(oklchMatch);
}

/**
 * Converts all oklch(...) occurrences in any string to standard rgb/rgba
 */
function convertAllOklchInString(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) {
    return str;
  }
  return str.replace(/oklch\([^)]+\)/gi, (match) => parseSingleOklchToRgb(match));
}

/**
 * Shared DOM clone sanitizer for html2canvas to safely convert modern CSS colors (oklch, lab)
 * and ensure all nested containers are visible for high-fidelity PDF capture.
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

  // 1. Process all <style> elements in clonedDoc
  const styleElements = clonedDoc.querySelectorAll('style');
  styleElements.forEach((styleEl) => {
    if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
      styleEl.textContent = convertAllOklchInString(styleEl.textContent);
    }
  });

  // 2. Process all styleSheets in clonedDoc directly
  try {
    const sheets = Array.from(clonedDoc.styleSheets);
    sheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule, idx) => {
          if (rule.cssText && rule.cssText.includes('oklch')) {
            const newCssText = convertAllOklchInString(rule.cssText);
            try {
              sheet.deleteRule(idx);
              sheet.insertRule(newCssText, idx);
            } catch {
              if ((rule as CSSStyleRule).style) {
                const style = (rule as CSSStyleRule).style;
                for (let i = 0; i < style.length; i++) {
                  const prop = style[i];
                  const val = style.getPropertyValue(prop);
                  if (val && val.includes('oklch')) {
                    style.setProperty(prop, convertAllOklchInString(val));
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

  // 3. Process DOM elements in clonedElement only
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
    'caret-color'
  ];

  allElements.forEach((el) => {
    if (!el) return;

    // Replace inline style string if present
    const styleAttr = el.getAttribute('style');
    if (styleAttr && styleAttr.includes('oklch')) {
      el.setAttribute('style', convertAllOklchInString(styleAttr));
    }

    // Check SVG attributes
    ['fill', 'stroke', 'stop-color', 'color'].forEach((attr) => {
      const attrVal = el.getAttribute(attr);
      if (attrVal && attrVal.includes('oklch')) {
        el.setAttribute(attr, convertAllOklchInString(attrVal));
      }
    });

    // Check computed styles and override with inline rgb styles
    if (el.style) {
      try {
        const computed = win.getComputedStyle(el);
        colorProperties.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (val && val.includes('oklch')) {
            const convertedVal = convertAllOklchInString(val);
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
  const docType = elementId.includes('vastu') ? 'vastu' : (elementId.includes('kundali') || elementId.includes('cheena') || elementId.includes('patrika') || elementId.includes('tipan')) ? 'kundali' : 'general';
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
    : elementId.includes('kundali') || elementId.includes('cheena') || elementId.includes('patrika') || elementId.includes('tipan')
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
  const docType = elementId.includes('vastu') ? 'vastu' : (elementId.includes('kundali') || elementId.includes('cheena') || elementId.includes('patrika') || elementId.includes('tipan')) ? 'kundali' : 'general';
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

  // Create an invisible iframe for isolated printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const pri = iframe.contentWindow;
  if (!pri) {
    console.error('Failed to access print iframe window');
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
    return;
  }

  // Extract all stylesheets and style blocks from current document
  const stylesheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  pri.document.open();
  pri.document.write(`
    <!DOCTYPE html>
    <html lang="ne">
      <head>
        <meta charset="utf-8" />
        <title>नेपाली वैदिक ज्योतिष प्रतिवेदन</title>
        ${stylesheets}
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .no-print, button, input, select, textarea {
            display: none !important;
          }
          .printable-page, .print-page {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 auto !important;
            box-shadow: none !important;
          }
          .printable-page:last-child, .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  pri.document.close();

  setTimeout(() => {
    try {
      pri.focus();
      pri.print();
    } catch (err) {
      console.error('Print iframe error:', err);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  }, 400);
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

    // Fallback: Download file automatically to user's device
    if (res.blob) {
      const blobUrl = URL.createObjectURL(res.blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(blobUrl);
    }

    // Open WhatsApp Web or App
    const note = '\n\n(सूचना: प्रतिवेदन PDF फाइल तपाईंको डिभाइसमा डाउनलोड भएको छ, कृपया यस च्याटमा पठाउनुहोस्।)';
    const encodedText = encodeURIComponent(messageText + note);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(waUrl, '_blank');
    return { success: true, method: 'download-and-whatsapp' };
  } catch (err: any) {
    console.error('sharePDFToWhatsApp error:', err);
    return { success: false, method: 'error', error: err?.message || 'WhatsApp सेयर गर्न असफल भयो।' };
  }
}



