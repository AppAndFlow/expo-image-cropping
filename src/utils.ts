import type { Point } from './types';

export const fakeId = () => {
  return Date.now();
};

export const getLineLengthPx = (p1: Point, p2: Point) => {
  'worklet';
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.sqrt(dx ** 2 + dy ** 2);
};
