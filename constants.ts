
import { WallItem } from './types';

export const THEME_RED = '#B30000';
export const THEME_GOLD = '#C5A059';

export const INITIAL_WALL_ITEMS: WallItem[] = [];

export const EASTER_EGG_KEYWORDS = ['奈米瑄', '筊白筍', '恐龍', '睿'];

export const SCORE_LEVELS = [
  { min: 95, amount: 1000, mood: '驚喜讚嘆' },
  { min: 88, amount: 800, mood: '大讚文采' },
  { min: 75, amount: 600, mood: '肯定誠意' },
  { min: 55, amount: 400, mood: '溫馨鼓勵' },
  { min: 30, amount: 200, mood: '幽默調侃' },
  { min: 0, amount: 0, mood: '再接再厲' },
];
