/** Every upload must be 2 MB or smaller — the backend rejects anything bigger. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = '2 MB';

/** Longest side of an uploaded photo. */
const MAX_DIMENSION = 1600;
/** JPEG/WebP qualities tried in order until the image fits under the cap. */
const QUALITY_STEPS = [0.8, 0.7, 0.55, 0.4];

/** Raster formats the browser can redraw. GIF (animation) and SVG are left as-is. */
const COMPRESSIBLE = /^image\/(jpeg|jpg|png|webp)$/i;

export class UploadTooLargeError extends Error {}

const loadImage = (file: File): Promise<HTMLImageElement> =>
new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    resolve(img);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Could not read the image.'));
  };
  img.src = url;
});

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> =>
new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const renamed = (name: string, ext: string) => `${name.replace(/\.[^.]+$/, '') || 'image'}.${ext}`;

/**
 * Resizes (longest side ≤ 1600px) and compresses an image on the device. PNGs
 * stay PNG so transparent icons keep their transparency. Returns the original
 * when it's already smaller.
 */
export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE.test(file.type)) return file;

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const isPng = /png$/i.test(file.type);
  let best: File | null = null;

  if (isPng) {
    const blob = await toBlob(canvas, 'image/png');
    if (blob) best = new File([blob], renamed(file.name, 'png'), { type: 'image/png' });
  } else {
    for (const quality of QUALITY_STEPS) {
      const blob = await toBlob(canvas, 'image/jpeg', quality);
      if (!blob) break;
      best = new File([blob], renamed(file.name, 'jpg'), { type: 'image/jpeg' });
      if (blob.size <= MAX_UPLOAD_BYTES) break;
    }
  }

  if (!best || best.size >= file.size) return file;
  return best;
}

/**
 * Compresses every image in an upload form and enforces the 2 MB cap on every
 * file (images, PDFs, anything). Throws UploadTooLargeError with a user-facing
 * message naming the file that is still too big.
 */
export async function prepareUploadForm(form: FormData): Promise<FormData> {
  const prepared = new FormData();
  for (const [key, value] of form.entries()) {
    if (!(value instanceof File)) {
      prepared.append(key, value);
      continue;
    }
    let file = value;
    if (file.type.startsWith('image/')) {
      try {
        file = await compressImage(file);
      } catch {
        /* unreadable image: send as-is and let the size check decide */
      }
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new UploadTooLargeError(`"${value.name}" is too large. Files must be ${MAX_UPLOAD_LABEL} or smaller.`);
    }
    prepared.append(key, file, file.name);
  }
  return prepared;
}
