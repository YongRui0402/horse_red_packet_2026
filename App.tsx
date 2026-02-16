import React, { useState, useEffect } from 'react';
import { AppStage, ResultData, WallItem } from './types';
import { databaseService } from './services/databaseService';
import HomeView from './components/HomeView';
import ScoringView from './components/ScoringView';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.HOME);
  const [result, setResult] = useState<ResultData | null>(null);
  const [wallItems, setWallItems] = useState<WallItem[]>([]);
  // 初始值設為 0
  const [stats, setStats] = useState({ totalAmount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // 初始化載入「雲端」資料
  useEffect(() => {
    const fetchCloudData = async () => {
      if (stage !== AppStage.HOME) return;

      setLoading(true);
      setIsError(false);
      try {
        if (!databaseService) {
          throw new Error("Cloud Database Service Unavailable");
        }

        const [items, currentStats] = await Promise.all([
          databaseService.getWallItems(),
          databaseService.getStats()
        ]);
        
        if (items) setWallItems(items);
        if (currentStats) setStats(currentStats);
      } catch (err) {
        console.error("Cloud synchronization failed:", err);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCloudData();
  }, [stage]);

  const handleStart = () => {
    setStage(AppStage.SCORING);
  };

  const handleResult = async (data: ResultData) => {
    setResult(data);
    setStage(AppStage.RESULT);
    
    const newItem: WallItem = {
      id: Date.now().toString(),
      greeting: data.greeting,
      amount: data.amount,
      userName: data.nickname || '匿名馬迷'
    };

    try {
      if (databaseService && typeof databaseService.saveWallItem === 'function') {
        await databaseService.saveWallItem(newItem);
      }
    } catch (err) {
      console.error("Failed to sync result to cloud:", err);
    }
  };

  const handleBackHome = () => {
    setStage(AppStage.HOME);
    setResult(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {stage === AppStage.HOME && (
        <HomeView 
          onStart={handleStart} 
          wallItems={wallItems} 
          stats={stats} 
          isLoading={loading}
          isError={isError}
        />
      )}
      <div className="p-4 w-full flex flex-col items-center justify-center">
        {stage === AppStage.SCORING && (
          <ScoringView onComplete={handleResult} onCancel={handleBackHome} />
        )}
        {stage === AppStage.RESULT && result && (
          <ResultView result={result} onBack={handleBackHome} />
        )}
      </div>
    </div>
  );
};

export default App;
