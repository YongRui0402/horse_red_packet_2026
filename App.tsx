
import React, { useState, useEffect } from 'react';
import { AppStage, ResultData, WallItem } from './types';
import { INITIAL_WALL_ITEMS } from './constants';
import HomeView from './components/HomeView';
import ScoringView from './components/ScoringView';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.HOME);
  const [result, setResult] = useState<ResultData | null>(null);
  const [wallItems, setWallItems] = useState<WallItem[]>(INITIAL_WALL_ITEMS);
  const [stats, setStats] = useState({ totalAmount: 0, totalCount: 0 });

  useEffect(() => {
    const total = wallItems.reduce((acc, curr) => acc + curr.amount, 0);
    setStats({ totalAmount: total, totalCount: wallItems.length });
  }, [wallItems]);

  const handleStart = () => {
    setStage(AppStage.SCORING);
  };

  const handleResult = (data: ResultData) => {
    setResult(data);
    setStage(AppStage.RESULT);
    
    const newItem: WallItem = {
      id: Date.now().toString(),
      greeting: data.greeting,
      amount: data.amount,
      userName: data.nickname || '匿名'
    };
    setWallItems(prev => [newItem, ...prev.slice(0, 14)]);
  };

  const handleBackHome = () => {
    setStage(AppStage.HOME);
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {stage === AppStage.HOME && (
        <HomeView onStart={handleStart} wallItems={wallItems} stats={stats} />
      )}
      {stage === AppStage.SCORING && (
        <ScoringView onComplete={handleResult} onCancel={handleBackHome} />
      )}
      {stage === AppStage.RESULT && result && (
        <ResultView result={result} onBack={handleBackHome} />
      )}
    </div>
  );
};

export default App;
