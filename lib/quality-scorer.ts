/**
 * Quality Scoring Modules
 *
 * Implements SSIM, pHash, edge quality, and geometry consistency checks
 * to ensure image modification quality meets P0/P1/P2 standards.
 */

interface QualityScores {
  ssim: number;
  ssimDiff: number;
  phashDistance: number;
  edgeScore: number;
  geomDelta: number;
  overallScore: number;
}

interface QualityResult {
  passed: boolean;
  errorLevel: 'P0' | 'P1' | 'P2' | 'OK';
  reasons: string[];
  scores: QualityScores;
}

interface QualityThresholds {
  ssimMinDiff: number;
  phashMinDist: number;
  geomMaxDelta: number;
  edgeMinScore: number;
}

const DEFAULT_THRESHOLDS: QualityThresholds = {
  ssimMinDiff: 0.30,
  phashMinDist: 12,
  geomMaxDelta: 0.03,
  edgeMinScore: 0.6,
};

async function loadImageData(imageUrl: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

function grayscale(imageData: ImageData): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(imageData.width * imageData.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  return gray;
}

export function calcSSIM(img1: ImageData, img2: ImageData): number {
  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error('Images must have the same dimensions for SSIM calculation');
  }

  const gray1 = grayscale(img1);
  const gray2 = grayscale(img2);

  const k1 = 0.01;
  const k2 = 0.03;
  const L = 255;
  const c1 = (k1 * L) ** 2;
  const c2 = (k2 * L) ** 2;

  let sumX = 0, sumY = 0;
  let sumX2 = 0, sumY2 = 0;
  let sumXY = 0;
  const n = gray1.length;

  for (let i = 0; i < n; i++) {
    sumX += gray1[i];
    sumY += gray2[i];
    sumX2 += gray1[i] * gray1[i];
    sumY2 += gray2[i] * gray2[i];
    sumXY += gray1[i] * gray2[i];
  }

  const meanX = sumX / n;
  const meanY = sumY / n;
  const varX = sumX2 / n - meanX * meanX;
  const varY = sumY2 / n - meanY * meanY;
  const covXY = sumXY / n - meanX * meanY;

  const ssim = ((2 * meanX * meanY + c1) * (2 * covXY + c2)) /
               ((meanX * meanX + meanY * meanY + c1) * (varX + varY + c2));

  return Math.max(0, Math.min(1, ssim));
}

function dctHash(gray: Uint8ClampedArray, width: number, height: number): string {
  const size = 32;
  const resized = new Uint8ClampedArray(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const srcX = Math.floor(x * width / size);
      const srcY = Math.floor(y * height / size);
      resized[y * size + x] = gray[srcY * width + srcX];
    }
  }

  const dctSize = 8;
  const dct = new Float32Array(dctSize * dctSize);

  for (let v = 0; v < dctSize; v++) {
    for (let u = 0; u < dctSize; u++) {
      let sum = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          sum += resized[y * size + x] *
                 Math.cos((2 * x + 1) * u * Math.PI / (2 * size)) *
                 Math.cos((2 * y + 1) * v * Math.PI / (2 * size));
        }
      }
      dct[v * dctSize + u] = sum;
    }
  }

  const avg = dct.slice(1).reduce((a, b) => a + b, 0) / (dctSize * dctSize - 1);

  let hash = '';
  for (let i = 1; i < dctSize * dctSize; i++) {
    hash += dct[i] > avg ? '1' : '0';
  }

  return hash;
}

export function calcPHash(img1: ImageData, img2: ImageData): number {
  const gray1 = grayscale(img1);
  const gray2 = grayscale(img2);

  const hash1 = dctHash(gray1, img1.width, img1.height);
  const hash2 = dctHash(gray2, img2.width, img2.height);

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }

  return distance;
}

function sobelEdgeDetection(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const edges = new Uint8ClampedArray(width * height);
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kidx = (ky + 1) * 3 + (kx + 1);
          gx += gray[idx] * sobelX[kidx];
          gy += gray[idx] * sobelY[kidx];
        }
      }

      edges[y * width + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
    }
  }

  return edges;
}

export function calcEdgeQuality(img: ImageData): number {
  const gray = grayscale(img);
  const edges = sobelEdgeDetection(gray, img.width, img.height);

  let edgeCount = 0;
  let strongEdgeCount = 0;
  const threshold = 50;
  const strongThreshold = 100;

  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > threshold) {
      edgeCount++;
      if (edges[i] > strongThreshold) {
        strongEdgeCount++;
      }
    }
  }

  const edgeRatio = edgeCount / edges.length;
  const strongEdgeRatio = strongEdgeCount / Math.max(1, edgeCount);

  return Math.min(1, edgeRatio * 10 * (0.5 + strongEdgeRatio * 0.5));
}

function detectSubjectMask(img: ImageData): Uint8ClampedArray {
  const gray = grayscale(img);
  const edges = sobelEdgeDetection(gray, img.width, img.height);

  const mask = new Uint8ClampedArray(img.width * img.height);

  let minX = img.width, maxX = 0;
  let minY = img.height, maxY = 0;

  const edgeThreshold = 30;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = y * img.width + x;
      if (edges[idx] > edgeThreshold) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const padding = Math.min(img.width, img.height) * 0.05;
  minX = Math.max(0, minX - padding);
  maxX = Math.min(img.width - 1, maxX + padding);
  minY = Math.max(0, minY - padding);
  maxY = Math.min(img.height - 1, maxY + padding);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      mask[y * img.width + x] = 255;
    }
  }

  return mask;
}

export function calcGeomConsistency(img1: ImageData, img2: ImageData): number {
  const mask1 = detectSubjectMask(img1);
  const mask2 = detectSubjectMask(img2);

  let area1 = 0, area2 = 0;
  let centerX1 = 0, centerY1 = 0;
  let centerX2 = 0, centerY2 = 0;

  for (let y = 0; y < img1.height; y++) {
    for (let x = 0; x < img1.width; x++) {
      const idx = y * img1.width + x;
      if (mask1[idx] > 0) {
        area1++;
        centerX1 += x;
        centerY1 += y;
      }
      if (mask2[idx] > 0) {
        area2++;
        centerX2 += x;
        centerY2 += y;
      }
    }
  }

  if (area1 === 0 || area2 === 0) {
    return 1.0;
  }

  centerX1 /= area1;
  centerY1 /= area1;
  centerX2 /= area2;
  centerY2 /= area2;

  const areaDelta = Math.abs(area1 - area2) / Math.max(area1, area2);

  const centerDelta = Math.sqrt(
    Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2)
  ) / Math.sqrt(img1.width * img1.width + img1.height * img1.height);

  return (areaDelta + centerDelta) / 2;
}

export async function scoreImageQuality(
  originalUrl: string,
  candidateUrl: string,
  thresholds: Partial<QualityThresholds> = {}
): Promise<QualityResult> {
  const config = { ...DEFAULT_THRESHOLDS, ...thresholds };

  const [origImg, candImg] = await Promise.all([
    loadImageData(originalUrl),
    loadImageData(candidateUrl)
  ]);

  if (origImg.width !== candImg.width || origImg.height !== candImg.height) {
    return {
      passed: false,
      errorLevel: 'P1',
      reasons: ['Image dimensions do not match'],
      scores: {
        ssim: 0,
        ssimDiff: 1,
        phashDistance: 64,
        edgeScore: 0,
        geomDelta: 1,
        overallScore: 0,
      }
    };
  }

  const ssim = calcSSIM(origImg, candImg);
  const ssimDiff = 1 - ssim;
  const phashDistance = calcPHash(origImg, candImg);
  const edgeScore = calcEdgeQuality(candImg);
  const geomDelta = calcGeomConsistency(origImg, candImg);

  const w1 = 0.3, w2 = 0.25, w3 = 0.25, w4 = 0.2;
  const normalizedPhash = Math.min(1, phashDistance / 64);
  const overallScore = w1 * ssimDiff + w2 * normalizedPhash + w3 * edgeScore + w4 * (1 - geomDelta);

  const reasons: string[] = [];
  let errorLevel: 'P0' | 'P1' | 'P2' | 'OK' = 'OK';

  if (geomDelta > config.geomMaxDelta) {
    reasons.push(`Geometry changed too much: ${(geomDelta * 100).toFixed(1)}% (max ${(config.geomMaxDelta * 100).toFixed(1)}%)`);
    errorLevel = 'P0';
  }

  if (ssimDiff < config.ssimMinDiff) {
    reasons.push(`Not different enough: ${(ssimDiff * 100).toFixed(1)}% difference (min ${(config.ssimMinDiff * 100).toFixed(1)}%)`);
    if (errorLevel === 'OK') errorLevel = 'P1';
  }

  if (phashDistance < config.phashMinDist) {
    reasons.push(`Perceptual hash too similar: ${phashDistance} distance (min ${config.phashMinDist})`);
    if (errorLevel === 'OK') errorLevel = 'P1';
  }

  if (edgeScore < config.edgeMinScore) {
    reasons.push(`Poor edge quality: ${(edgeScore * 100).toFixed(1)}% (min ${(config.edgeMinScore * 100).toFixed(1)}%)`);
    if (errorLevel === 'OK') errorLevel = 'P2';
  }

  const passed = errorLevel === 'OK' || errorLevel === 'P2';

  return {
    passed,
    errorLevel,
    reasons,
    scores: {
      ssim,
      ssimDiff,
      phashDistance,
      edgeScore,
      geomDelta,
      overallScore,
    }
  };
}

export async function scoreMultipleImages(
  originalUrl: string,
  candidateUrls: string[],
  thresholds: Partial<QualityThresholds> = {}
): Promise<QualityResult[]> {
  return Promise.all(
    candidateUrls.map(url => scoreImageQuality(originalUrl, url, thresholds))
  );
}
