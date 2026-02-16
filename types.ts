
export interface Scores {
  literary: number; // 文采
  relevance: number; // 應景
  emotion: number;   // 情緒
  wealth: number;    // 發財
  blessing: number;  // 福氣
}

export interface DimensionComments {
  literary: string;
  relevance: string;
  emotion: string;
  wealth: string;
  blessing: string;
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
}

export enum AppStage {
  HOME = 'HOME',
  SCORING = 'SCORING',
  RESULT = 'RESULT'
}
