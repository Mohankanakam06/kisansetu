/**
 * Client-Side Mobile Image Compression Utility
 *
 * Shrinks multi-megabyte camera photos taken on mobile devices (typically 5-15MB)
 * down to ~150-300KB using HTML5 Canvas before uploading over 2G/3G/4G rural networks.
 * Preserves optimal resolution (1280px) for OpenCV, HSV entropy & AI Vision grading.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
  compressionRatio: number;
}

export async function compressImageFile(
  fileOrBlob: File | Blob,
  maxDimension = 1280,
  quality = 0.82
): Promise<CompressionResult> {
  const originalSizeBytes = fileOrBlob.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("ERR_IMAGE_READ_FAILED: Could not read image file."));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error("ERR_IMAGE_DECODE_FAILED: Could not decode image format."));
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect ratio scaling
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to original if canvas context unavailable
          const fallbackDataUrl = e.target?.result as string;
          resolve({
            dataUrl: fallbackDataUrl,
            originalSizeBytes,
            compressedSizeBytes: originalSizeBytes,
            width,
            height,
            compressionRatio: 1,
          });
          return;
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        // Calculate approximate byte size of base64 data URL
        const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(",") + 1);
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeBytes,
          compressedSizeBytes,
          width,
          height,
          compressionRatio: originalSizeBytes > 0 ? compressedSizeBytes / originalSizeBytes : 1,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
