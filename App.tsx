
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
  const [stats, setStats] = useState({ totalAmount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchCloudData = async () => {
      if (stage !== AppStage.HOME) return;

      setLoading(true);
      setIsError(false);
      try {
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
      userName: data.nickname || '匿名馬迷',
      comment: data.comment
    };

    try {
      await databaseService.saveWallItem(newItem);
    } catch (err) {
      console.error("Failed to sync result to cloud:", err);
    }
  };

  const handleBackHome = () => {
    setStage(AppStage.HOME);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 w-full flex justify-center items-center bg-[#2A0000] overflow-hidden">
      {/* 移除 404 圖片，改用純 CSS 裝飾紋理 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      {/* 全域 App 容器 */}
      <div className="w-full max-w-[500px] h-[100dvh] flex flex-col bg-[#B30000] relative shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden z-10">
        {stage === AppStage.HOME && (
          <HomeView 
            onStart={handleStart} 
            wallItems={wallItems} 
            stats={stats} 
            isLoading={loading}
            isError={isError}
          />
        )}
        
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center">
          {stage === AppStage.SCORING && (
            <div className="p-6 w-full flex-1 flex flex-col justify-center">
              <ScoringView onComplete={handleResult} onCancel={handleBackHome} />
            </div>
          )}
          {stage === AppStage.RESULT && result && (
            <div className="w-full py-4">
              <ResultView result={result} onBack={handleBackHome} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
