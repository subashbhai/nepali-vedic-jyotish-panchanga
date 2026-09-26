/**
 * Utility functions for Image Processing, Compression, Cropping, and Default SVG generation
 * for Balananda Jyotish, Vastu Tatha Karmakanda Sewa (बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा)
 */

export interface CropAspectPreset {
  label: string;
  value: number; // width / height ratio
}

export const CROP_ASPECT_PRESETS: CropAspectPreset[] = [
  { label: 'वर्गाकार (१:१)', value: 1 },
  { label: 'आयताकार (४:३)', value: 4 / 3 },
  { label: 'ठाडो फोटो (३:४)', value: 3 / 4 },
  { label: 'वाइड (१६:९)', value: 16 / 9 },
];

/**
 * Resizes and compresses an image file or base64 string to avoid large storage payloads.
 */
export async function compressAndResizeImage(
  input: File | string,
  maxDimension = 800,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof input === 'string' ? input : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = (err) => reject(err);

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Crop an image using canvas coordinates
 */
export async function cropCanvasImage(
  imageSrc: string,
  cropArea: { x: number; y: number; width: number; height: number },
  targetWidth = 400,
  targetHeight = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        targetWidth,
        targetHeight
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}

/**
 * Generates high-resolution default brand Logo for बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा
 */
export function getDefaultLogoSvg(): string {
  return '/logo.png';
}

/**
 * Generates default main Hero photo Data URL for बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा
 */
export function getDefaultMainPhotoSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E1B18" />
        <stop offset="50%" stop-color="#3B2511" />
        <stop offset="100%" stop-color="#180E05" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FBBF24" />
        <stop offset="50%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
    </defs>
    <rect width="800" height="400" fill="url(#bg)" />
    <circle cx="400" cy="200" r="160" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4" />
    <circle cx="400" cy="200" r="120" fill="none" stroke="#F59E0B" stroke-width="1" opacity="0.3" />
    <text x="400" y="160" font-family="'Mukta', sans-serif" font-size="70" font-weight="bold" fill="url(#gold)" text-anchor="middle">ॐ</text>
    <text x="400" y="225" font-family="'Mukta', sans-serif" font-size="28" font-weight="bold" fill="#FEF3C7" text-anchor="middle">बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा</text>
    <text x="400" y="270" font-family="'Mukta', sans-serif" font-size="18" font-weight="bold" fill="#D97706" text-anchor="middle">नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा</text>
    <text x="400" y="315" font-family="'Mukta', sans-serif" font-size="14" fill="#A8A29E" text-anchor="middle">सम्पर्क: +९७७-९७६४४००५३३ | इमेल: suwashdmk@gmail.com</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
