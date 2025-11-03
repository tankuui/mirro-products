export const DEMO_IMAGES = [
  "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=800",
];

export const MODIFIED_DEMO_IMAGES = [
  "https://images.pexels.com/photos/3682152/pexels-photo-3682152.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3735169/pexels-photo-3735169.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/6567607/pexels-photo-6567607.jpeg?auto=compress&cs=tinysrgb&w=800",
];

export function generateRandomSimilarity(modificationLevel: number): number {
  const baseSimilarity = 100 - modificationLevel;
  const variance = 15;
  const randomOffset = (Math.random() - 0.5) * variance;
  return Math.max(20, Math.min(85, baseSimilarity + randomOffset));
}
