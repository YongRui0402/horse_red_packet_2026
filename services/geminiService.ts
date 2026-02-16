
import { GoogleGenAI, Type } from "@google/genai";
import { Scores, ResultData, DimensionComments } from "../types";
import { EASTER_EGG_KEYWORDS, SCORE_LEVELS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

function checkEasterEgg(text: string): boolean {
  if (EASTER_EGG_KEYWORDS.some(k => text.includes(k))) return true;
  const horseMatch = text.match(/馬/g);
  if (horseMatch && horseMatch.length >= 5) return true;
  return false;
}

export async function analyzeGreeting(greeting: string, nickname: string): Promise<ResultData> {
  const isEasterEgg = checkEasterEgg(greeting);
  
  if (isEasterEgg) {
    return {
      nickname: nickname || "神秘嘉賓",
      amount: 1000,
      comment: "恭喜觸發隱藏彩蛋！您的誠意震天動地，無視評分直接發送最高金額！",
      scores: { literary: 100, relevance: 100, emotion: 100, wealth: 100, blessing: 100 },
      dimensionComments: {
        literary: "出神入化，文思泉湧！",
        relevance: "馬到功成，氣勢磅礴！",
        emotion: "至誠如神，感人肺腑！",
        wealth: "金玉滿堂，富貴逼人！",
        blessing: "福壽齊天，祥瑞盈門！"
      },
      isEasterEgg: true,
      greeting
    };
  }

  const prompt = `你是一位精通中華文化與2026馬年(丙午年)春節祝福的AI紅包閱卷官。
請分析以下來自「${nickname}」的吉祥話： "${greeting}"

評分維度說明 (0-100)：
1. 文采分析 (literary): 詞藻優美、押韻、文學深度。
2. 應景程度 (relevance): 與 2026 馬年 的關聯性。
3. 情緒價值 (emotion): 偵測真誠度。
4. 發財指數 (wealth): 對財富、事業的祝福力。
5. 福氣點數 (blessing): 對健康、平安、家庭的加持。

請針對每個維度給予一個5-10字的精煉短評，並提供一個整體的幽默短評。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            literary: { type: Type.NUMBER },
            relevance: { type: Type.NUMBER },
            emotion: { type: Type.NUMBER },
            wealth: { type: Type.NUMBER },
            blessing: { type: Type.NUMBER },
            comment: { type: Type.STRING },
            literaryComment: { type: Type.STRING },
            relevanceComment: { type: Type.STRING },
            emotionComment: { type: Type.STRING },
            wealthComment: { type: Type.STRING },
            blessingComment: { type: Type.STRING }
          },
          required: [
            "literary", "relevance", "emotion", "wealth", "blessing", "comment",
            "literaryComment", "relevanceComment", "emotionComment", "wealthComment", "blessingComment"
          ]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    const scores: Scores = {
      literary: data.literary,
      relevance: data.relevance,
      emotion: data.emotion,
      wealth: data.wealth,
      blessing: data.blessing
    };
    
    const dimensionComments: DimensionComments = {
      literary: data.literaryComment,
      relevance: data.relevanceComment,
      emotion: data.emotionComment,
      wealth: data.wealthComment,
      blessing: data.blessingComment
    };

    const avg = (scores.literary + scores.relevance + scores.emotion + scores.wealth + scores.blessing) / 5;
    const level = SCORE_LEVELS.find(l => avg >= l.min) || SCORE_LEVELS[SCORE_LEVELS.length - 1];

    return {
      nickname: nickname || "匿名馬迷",
      amount: level.amount,
      comment: data.comment,
      scores,
      dimensionComments,
      isEasterEgg: false,
      greeting
    };
  } catch (error) {
    console.error("AI Analysis failed", error);
    return {
      nickname: nickname || "匿名馬迷",
      amount: 0,
      comment: "AI 好像在趕路去馬年，隨機發個紅包給你！",
      scores: { literary: 50, relevance: 50, emotion: 50, wealth: 50, blessing: 50 },
      dimensionComments: {
        literary: "普普通通", relevance: "尚可", emotion: "平淡", wealth: "有望", blessing: "安康"
      },
      isEasterEgg: false,
      greeting
    };
  }
}
