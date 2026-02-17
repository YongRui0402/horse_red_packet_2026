
export interface Scores {
  literary: number;    // 文采
  blessing: number;    // 福氣
  wealth: number;      // 發財
  puns: number;        // 諧音梗
  relevance: number;   // 應景
  memes: number;       // 網路迷因
}

export interface DimensionComments {
  literary: string;
  blessing: string;
  wealth: string;
  puns: string;
  relevance: string;
  memes: string;
}

export interface ResultData {
  nickname: string;
  amount: number;
  comment: string;
  scores: Scores;
  dimensionComments: DimensionComments;
  isEasterEgg: boolean;
  greeting: string;
}

export interface WallItem {
  id: string;
  greeting: string;
  amount: number;
  userName: string;
  comment?: string; // AI 鑑定結語
  isDismissed?: boolean;
}

export enum AppStage {
  HOME = 'HOME',
  SCORING = 'SCORING',
  RESULT = 'RESULT'
}
