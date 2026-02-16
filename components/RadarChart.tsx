
import React from 'react';
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
  const data = [
    { subject: '文采', A: scores.literary, fullMark: 100 },
    { subject: '應景', A: scores.relevance, fullMark: 100 },
    { subject: '情緒', A: scores.emotion, fullMark: 100 },
    { subject: '發財', A: scores.wealth, fullMark: 100 },
    { subject: '福氣', A: scores.blessing, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#E2C98C" strokeOpacity={0.3} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 14 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke={THEME_GOLD}
            fill={THEME_GOLD}
            fillOpacity={0.6}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
