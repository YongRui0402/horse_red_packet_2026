
import { WallItem } from './types';

export const THEME_RED = '#B30000';
export const THEME_GOLD = '#C5A059';

export const INITIAL_WALL_ITEMS: WallItem[] = [
  { id: '1', greeting: '馬到成功，富貴傳家！', amount: 1000, userName: '匿名馬迷' },
  { id: '2', greeting: '龍馬精神，萬事如意。', amount: 800, userName: '吉祥物' },
  { id: '3', greeting: '春風得意馬蹄疾，一日看盡長安花。', amount: 1000, userName: '文青大師' },
  { id: '4', greeting: '今年馬上有錢，好運連連。', amount: 600, userName: '祝發財' },
  { id: '5', greeting: '身體健康，平安喜樂。', amount: 400, userName: '健康第一' },
];

export const EASTER_EGG_KEYWORDS = ['奈米瑄', '筊白筍', '恐龍', '睿'];

export const SCORE_LEVELS = [
  { min: 90, amount: 1000, mood: '驚喜讚嘆' },
  { min: 75, amount: 800, mood: '大讚文采' },
  { min: 60, amount: 600, mood: '肯定誠意' },
  { min: 40, amount: 400, mood: '溫馨鼓勵' },
  { min: 20, amount: 200, mood: '幽默調侃' },
  { min: 0, amount: 0, mood: '再接再厲' },
];
