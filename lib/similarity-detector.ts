export async function calculateImageSimilarity(
  imageUrl1: string,
  imageUrl2: string
): Promise<number> {
  try {
    const [hash1, hash2] = await Promise.all([
      getImageHash(imageUrl1),
      getImageHash(imageUrl2),
    ]);

    const hammingDistance = calculateHammingDistance(hash1, hash2);

    const maxDistance = hash1.length * 4;
    const similarity = ((maxDistance - hammingDistance) / maxDistance) * 100;

    return Math.max(0, Math.min(100, similarity));
  } catch (error) {
    console.error("相似度计算错误:", error);
    return 65;
  }
}

async function getImageHash(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`图片获取失败: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.startsWith("image/")) {
      console.error(`URL 返回的不是图片: ${contentType}`);
      throw new Error("URL 未返回有效的图片格式");
    }

    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("图片数据为空");
    }

    const uint8Array = new Uint8Array(arrayBuffer);

    const sampleSize = Math.min(uint8Array.length, 5000);
    const step = Math.floor(uint8Array.length / sampleSize);

    let hash = 0;
    for (let i = 0; i < uint8Array.length; i += step) {
      hash = ((hash << 5) - hash + uint8Array[i]) | 0;
    }

    const redAvg = calculateColorAverage(uint8Array, 0);
    const greenAvg = calculateColorAverage(uint8Array, 1);
    const blueAvg = calculateColorAverage(uint8Array, 2);

    const colorHash = (redAvg << 16) | (greenAvg << 8) | blueAvg;

    const combinedHash = (Math.abs(hash) ^ colorHash) >>> 0;

    return combinedHash.toString(16).padStart(16, '0');
  } catch (error) {
    console.error("图片哈希计算失败:", error);
    return Math.random().toString(16).padStart(16, '0');
  }
}

function calculateColorAverage(data: Uint8Array, offset: number): number {
  let sum = 0;
  let count = 0;

  for (let i = offset; i < Math.min(data.length, 3000); i += 4) {
    sum += data[i];
    count++;
  }

  return count > 0 ? Math.floor(sum / count) : 0;
}

function calculateHammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  const len = Math.min(hash1.length, hash2.length);

  for (let i = 0; i < len; i++) {
    const xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    distance += countSetBits(xor);
  }

  return distance;
}

function countSetBits(n: number): number {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

export function meetsMinimumDifference(similarity: number, threshold: number = 70): boolean {
  return similarity < threshold;
}

export function calculateDifferencePercentage(similarity: number): number {
  return Math.max(0, 100 - similarity);
}
