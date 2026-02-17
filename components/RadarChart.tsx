
import React, { useState, useEffect } from 'react';
import {
  Radar, RadarChart as RechartsRadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { Scores } from '../types';
import { THEME_GOLD } from '../constants';

interface Props {
  scores: Scores;
  height?: number;
}

const RadarChart: React.FC<Props> = ({ scores, height = 240 }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 600);
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
    <div className="w-full min-w-0 relative flex items-center justify-center" style={{ height: `${height}px`, minHeight: `${height}px` }}>
      {!isReady && (
        <div className="flex flex-col items-center justify-center text-[#C5A059]/30 italic text-[10px]">
          <span className="animate-spin mb-1 text-lg">🐎</span>
        </div>
      )}
      {isReady && (
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
            <PolarGrid stroke="#E2C98C" strokeOpacity={0.2} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#8B4513', fontSize: 9, fontWeight: 'bold' }} 
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
              fillOpacity={0.4}
              animationBegin={100}
              animationDuration={800}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RadarChart;
