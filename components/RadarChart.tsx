
import React, { useState, useEffect } from 'react';
import {
  Radar, RadarChart as RechartsRadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { Scores } from '../types';
import { THEME_GOLD } from '../constants';

interface Props {
  scores: Scores;
}

const RadarChart: React.FC<Props> = ({ scores }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 增加延遲，確保父容器動畫結束且 DOM 寬高已計算完成
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const data = [
    { subject: '文采', A: scores.literary, fullMark: 100 },
    { subject: '福氣', A: scores.blessing, fullMark: 100 },
    { subject: '發財', A: scores.wealth, fullMark: 100 },
    { subject: '諧音', A: scores.puns, fullMark: 100 },
    { subject: '應景', A: scores.relevance, fullMark: 100 },
    { subject: '迷因', A: scores.memes, fullMark: 100 },
  ];

  return (
    // 加入 min-width: 0 與明確的 min-height 解決 Recharts 警告
    <div className="w-full h-72 md:h-80 min-w-0 relative flex items-center justify-center" style={{ minHeight: '280px' }}>
      {!isReady && (
        <div className="flex flex-col items-center justify-center text-[#C5A059]/30 italic text-[10px]">
          <span className="animate-spin mb-2">🐎</span>
          繪製能力圖譜中...
        </div>
      )}
      {isReady && (
        <ResponsiveContainer width="100%" height="100%" debounce={100}>
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#E2C98C" strokeOpacity={0.2} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#8B4513', fontSize: 12, fontWeight: 'bold' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              axisLine={false} 
              tick={false} 
            />
            <Radar
              name="Score"
              dataKey="A"
              stroke={THEME_GOLD}
              fill={THEME_GOLD}
              fillOpacity={0.5}
              animationBegin={200}
              animationDuration={1000}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RadarChart;
