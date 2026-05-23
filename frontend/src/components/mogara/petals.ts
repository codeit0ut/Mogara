/** Jasmine bloom layout — matches MogaraBloom reference (viewBox 48×48) */

export const FLOWER_CENTER = { x: 24, y: 22 };

export type PetalDef = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotOpen: number;
  rotClosed: number;
  z: number;
};

export const MOGARA_PETALS: PetalDef[] = [
  { cx: 24, cy: 10, rx: 6, ry: 10, rotOpen: -6, rotClosed: 10, z: 3 },
  { cx: 33, cy: 15, rx: 5.5, ry: 9, rotOpen: 48, rotClosed: 62, z: 1 },
  { cx: 35, cy: 24, rx: 6, ry: 8.5, rotOpen: 108, rotClosed: 122, z: 0 },
  { cx: 28, cy: 32, rx: 5.5, ry: 8, rotOpen: 168, rotClosed: 182, z: 2 },
  { cx: 18, cy: 32, rx: 6, ry: 8.5, rotOpen: 228, rotClosed: 242, z: 4 },
  { cx: 12, cy: 24, rx: 5.5, ry: 9, rotOpen: 288, rotClosed: 302, z: 5 },
  { cx: 14, cy: 15, rx: 5, ry: 9.5, rotOpen: 330, rotClosed: 344, z: 6 },
].sort((a, b) => a.z - b.z);

export type PetalPose = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
};

/** Interpolate petal pose for bloom 0 (bud) → 1 (open) */
export function petalPose(p: PetalDef, bloom: number): PetalPose {
  const clutch = 1 - bloom;
  const cx = p.cx + (FLOWER_CENTER.x - p.cx) * clutch * 0.55;
  const cy = p.cy + (FLOWER_CENTER.y - p.cy) * clutch * 0.55;
  const scale = 0.34 + bloom * 0.66;
  return {
    cx,
    cy,
    rx: p.rx * scale,
    ry: p.ry * (0.38 + bloom * 0.62),
    rot: p.rotClosed + bloom * (p.rotOpen - p.rotClosed),
  };
}
