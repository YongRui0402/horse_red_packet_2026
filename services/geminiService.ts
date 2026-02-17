
import { GoogleGenAI, Type } from "@google/genai";
import { Scores, ResultData, DimensionComments } from "../types";
import { EASTER_EGG_KEYWORDS, SCORE_LEVELS } from "../constants";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

function checkEasterEgg(text: string): boolean {
  // 彩蛋條件：包含特定關鍵字，或「馬」字出現次數達到 26 次
  const horseCount = (text.match(/馬/g) || []).length;
  return EASTER_EGG_KEYWORDS.some(k => text.includes(k)) || horseCount >= 26;
}

export async function analyzeGreeting(greeting: string, nickname: string): Promise<ResultData> {
  const isEasterEgg = checkEasterEgg(greeting);
  const ai = getAi();
  
  // 偵測內容是否具備宅屬性
  const otakuKeywords = ["動漫", "遊戲", "二檔", "領域展開", "元氣彈", "天元突破", "迷因", "Threads", "VTuber", "派對咖", "我推", "巨人", "咒術", "鬼滅", "白金之星", "歐拉", "心之鋼"];
  const hasOtakuVibe = otakuKeywords.some(k => greeting.includes(k));

  const prompt = `你是一位「2026 馬年智慧鑑定官」。
請對「${nickname}」的祝福語進行鑑定： "${greeting}"

【鑑定與評分核心規範 - 絕對遵守】：
1. **拒絕平庸六邊形**：除非觸發彩蛋 (isEasterEgg = ${isEasterEgg})，否則嚴禁給予平衡的高分。
2. **偏科生評分法**：
   - 請分析祝福內容，挑選 **1-2 個最突出的維度**（例如有動漫梗就選迷因/諧音）給予「巔峰分」 (88-99.5)。
   - 同時挑選 **1-2 個表現最弱或不相關的維度** 給予「地獄分」 (25-50.0)。
   - 其餘維度給予「平凡分」 (50-75.0)。
   - 目標是讓雷達圖呈現「尖刺狀」或「嚴重傾斜」，展現鑑定官的機車與專業。
3. **語氣設定**：
   - 內容有動漫/迷因梗 (hasOtakuVibe = ${hasOtakuVibe}) 時：請用熱血宅宅語氣，對於低分維度可以毒舌調侃（如：這文采簡直是雜魚等級）。
   - 一般內容：用 Z 世代鑑定官語氣，冷靜中帶點俏皮。
4. **彩蛋處理**：
   - 只有當 isEasterEgg = ${isEasterEgg} 為真時，才允許給予全 100 分並提到「解鎖隱藏彩蛋」。

【輸出 JSON 格式】：
- comment: 總評（50-60字，必須解釋為何某些分數這麼高，某些這麼低）。
- 各維度分數 (NUMBER, 帶一位小數)
- 各維度短評 (10字內，配合偏科評分) `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            literary: { type: Type.NUMBER },
            blessing: { type: Type.NUMBER },
            wealth: { type: Type.NUMBER },
            puns: { type: Type.NUMBER },
            relevance: { type: Type.NUMBER },
            memes: { type: Type.NUMBER },
            comment: { type: Type.STRING },
            literaryComment: { type: Type.STRING },
            blessingComment: { type: Type.STRING },
            wealthComment: { type: Type.STRING },
            punsComment: { type: Type.STRING },
            relevanceComment: { type: Type.STRING },
            memesComment: { type: Type.STRING }
          },
          required: [
            "literary", "blessing", "wealth", "puns", "relevance", "memes",
            "comment", "literaryComment", "blessingComment", "wealthComment",
            "punsComment", "relevanceComment", "memesComment"
          ]
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    
    const scores: Scores = {
      literary: data.literary,
      blessing: data.blessing,
      wealth: data.wealth,
      puns: data.puns,
      relevance: data.relevance,
      memes: data.memes
    };
    
    const dimensionComments: DimensionComments = {
      literary: data.literaryComment,
      blessing: data.blessingComment,
      wealth: data.wealthComment,
      puns: data.punsComment,
      relevance: data.relevanceComment,
      memes: data.memesComment
    };

    const avg = (scores.literary + scores.blessing + scores.wealth + scores.puns + scores.relevance + scores.memes) / 6;
    
    // 稍微放寬紅包門檻，因為評分拉開後平均分會下降
    const level = SCORE_LEVELS.find(l => avg >= l.min - 5) || SCORE_LEVELS[SCORE_LEVELS.length - 1];

    return {
      nickname: nickname || "匿名馬迷",
      amount: isEasterEgg ? 1000 : level.amount,
      comment: data.comment,
      scores,
      dimensionComments,
      isEasterEgg,
      greeting
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      nickname: nickname || "匿名客",
      amount: 400,
      comment: "這祝福含金量太高，鑑定儀器直接過載！鑑定官感受到你的誠意了，馬年祝你一馬當先！",
      scores: { literary: 92.4, blessing: 35.1, wealth: 40.8, puns: 98.3, relevance: 52.5, memes: 85.9 },
      dimensionComments: {
        literary: "文筆驚人", blessing: "福氣堪慮", wealth: "財運一般", puns: "諧音之王", relevance: "馬年應景", memes: "懂玩迷因"
      },
      isEasterEgg: false,
      greeting
    };
  }
}

export async function generateSingleComment(greeting: string, nickname: string): Promise<string> {
  const ai = getAi();
  const prompt = `你是個年輕的鑑定官。點評「${nickname}」的祝福：「${greeting}」。要求：30字內，要酷、要直白。如果是動漫內容請用宅語點評，一般內容則用活潑語氣。`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text.trim();
  } catch (err) {
    return "這內容很有靈魂，馬年我看好你！";
  }
}
