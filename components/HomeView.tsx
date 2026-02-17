
import React, { useState, useEffect, useRef } from 'react';
import { WallItem } from '../types';
import { generateSingleComment } from '../services/geminiService';
import { databaseService } from '../services/databaseService';

interface Props {
  onStart: () => void;
  wallItems: WallItem[];
  stats: { totalAmount: number; totalCount: number };
  isLoading: boolean;
  isError?: boolean;
}

interface StickyItem extends WallItem {
  x: number;
  y: number;
  rotate: number;
  color: string;
  zIndex: number;
  gridIndex: number;
}

const STICKY_COLORS = [
  '#FFF9C4', '#F8BBD0', '#C8E6C9', '#B3E5FC', '#FFE0B2', '#F3E5F5',
];

const APP_VERSION = "v1.1.1";
const MAX_ON_SCREEN = 6;

const GRID_COLS = 4;
const GRID_ROWS = 4;
const GRID_CELLS = Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);
  return {
    x: 5 + col * 22.5,
    y: 5 + row * 22.5
  };
});

const HomeView: React.FC<Props> = ({ onStart, wallItems, stats, isLoading, isError }) => {
  const [stickies, setStickies] = useState<StickyItem[]>([]);
  const [zoomedId, setZoomedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const topZIndex = useRef(100);

  useEffect(() => {
    if (wallItems.length > 0 && stickies.length < MAX_ON_SCREEN) {
      const existingIds = new Set(stickies.map(s => s.id));
      const occupiedGrids = new Set(stickies.map(s => s.gridIndex));
      const availableItems = wallItems.filter(w => !existingIds.has(w.id));
      
      if (availableItems.length > 0) {
        const needed = MAX_ON_SCREEN - stickies.length;
        const availableGrids = GRID_CELLS.map((_, i) => i).filter(i => !occupiedGrids.has(i));
        const shuffledGrids = [...availableGrids].sort(() => Math.random() - 0.5);
        
        const toAdd = availableItems.slice(0, needed).map((item, index) => {
          const gridIdx = shuffledGrids[index % shuffledGrids.length];
          const cell = GRID_CELLS[gridIdx];
          const x = cell.x + (Math.random() * 12 - 6);
          const y = cell.y + (Math.random() * 12 - 6);

          return {
            ...item,
            x,
            y,
            rotate: (Math.random() - 0.5) * 20, 
            color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
            zIndex: topZIndex.current + index,
            gridIndex: gridIdx
          };
        });
        
        topZIndex.current += needed;
        setStickies(prev => [...prev, ...toAdd]);
      }
    }
  }, [wallItems, stickies.length]);

  const handleDrop = (id: string) => {
    setStickies(prev => prev.filter(s => s.id !== id));
  };

  const updatePosition = (id: string, x: number, y: number, lift: boolean = false) => {
    setStickies(prev => prev.map(s => 
      s.id === id ? { ...s, x, y, zIndex: lift ? ++topZIndex.current : s.zIndex } : s
    ));
  };

  const handleUpdateComment = (id: string, comment: string) => {
    setStickies(prev => prev.map(s => s.id === id ? { ...s, comment } : s));
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden font-sans select-none relative">
      <div className="flex-1 flex flex-col imperial-texture">
        <header className="pt-8 pb-2 px-6 text-center shrink-0 z-10">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-[#C5A059] font-serif">2026 龍馬精神</h1>
          <p className="text-[10px] mt-1 opacity-70 font-serif text-white tracking-[0.3em] uppercase">AI 紅包鑑定 · 祝福貼牆</p>
        </header>

        <section className="px-6 mb-4 shrink-0 z-10">
          <div className="bg-[#1F0000]/95 backdrop-blur-xl p-3 rounded-2xl border border-[#C5A059]/30 flex justify-around text-center shadow-2xl">
            <div className="flex-1">
              <p className="text-[9px] text-[#E2C98C] opacity-60 uppercase tracking-tighter">總鑑定金額</p>
              <p className="text-lg font-bold text-[#E2C98C] tabular-nums">NT$ {stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="w-px bg-[#C5A059]/20 my-1"></div>
            <div className="flex-1">
              <p className="text-[9px] text-[#E2C98C] opacity-60 uppercase tracking-tighter">鑑定人數</p>
              <p className="text-lg font-bold text-[#E2C98C] tabular-nums">{stats.totalCount.toLocaleString()} 人</p>
            </div>
          </div>
        </section>

        <main ref={containerRef} className="flex-1 relative bg-black/40 mx-4 mb-24 rounded-[2.5rem] border border-[#C5A059]/10 shadow-inner overflow-hidden">
          {isLoading && stickies.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-pulse opacity-20 text-[#C5A059]">🐎</span>
            </div>
          ) : (
            stickies.map((s) => (
              <StickyNote 
                key={s.id} 
                item={s} 
                containerRef={containerRef}
                onDrop={() => handleDrop(s.id)}
                onUpdatePos={(x, y, lift) => updatePosition(s.id, x, y, lift)}
                isZoomed={zoomedId === s.id}
                onZoom={() => setZoomedId(zoomedId === s.id ? null : s.id)}
                onUpdateComment={(comment) => handleUpdateComment(s.id, comment)}
              />
            ))
          )}

          {zoomedId && (
            <div 
              className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-all duration-500 z-[19000]"
              onClick={() => setZoomedId(null)}
            />
          )}
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#B30000] via-[#B30000]/90 to-transparent z-[10001] flex flex-col items-center pointer-events-none">
          <button
            onClick={onStart}
            className="w-full max-w-xs bg-[#C5A059] text-[#4A0000] font-bold py-4 rounded-full shadow-2xl transform active:scale-95 transition-all text-xl tracking-[0.4em] font-serif hover:brightness-110 pointer-events-auto flex items-center justify-center gap-3"
          >
            <span>🧧</span> 開始鑑定 <span>🧧</span>
          </button>
          <span className="mt-4 text-[9px] text-white/20 font-mono tracking-widest uppercase">{APP_VERSION}</span>
        </footer>
      </div>
    </div>
  );
};

interface StickyProps {
  item: StickyItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDrop: () => void;
  onUpdatePos: (x: number, y: number, lift: boolean) => void;
  isZoomed: boolean;
  onZoom: () => void;
  onUpdateComment: (comment: string) => void;
}

const StickyNote: React.FC<StickyProps> = ({ item, containerRef, onDrop, onUpdatePos, isZoomed, onZoom, onUpdateComment }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  
  const dragStartPos = useRef({ x: 0, y: 0, itemX: 0, itemY: 0 });
  const containerSize = useRef({ w: 1, h: 1 });
  const hasMovedRef = useRef(false);
  const backfillLock = useRef(false);

  const clickTimer = useRef<number | null>(null);
  const lastClickTime = useRef(0);

  useEffect(() => {
    if (isZoomed && !item.comment && !isBackfilling && !backfillLock.current) {
      const runBackfill = async () => {
        setIsBackfilling(true);
        backfillLock.current = true;
        try {
          const newComment = await generateSingleComment(item.greeting, item.userName);
          onUpdateComment(newComment);
          await databaseService.updateWallItemComment(item.id, newComment);
        } catch (err) {
          console.error("Backfill failed:", err);
          backfillLock.current = false;
        } finally {
          setIsBackfilling(false);
        }
      };
      runBackfill();
    }
  }, [isZoomed, item.id, item.comment]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFalling) return;
    
    hasMovedRef.current = false;

    if (!isZoomed && containerRef.current) {
      containerSize.current = {
        w: containerRef.current.clientWidth,
        h: containerRef.current.clientHeight
      };
      setIsDragging(true);
      dragStartPos.current = { 
        x: e.clientX, 
        y: e.clientY, 
        itemX: item.x, 
        itemY: item.y 
      };
      onUpdatePos(item.x, item.y, true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isZoomed) return;
    
    const dx_px = e.clientX - dragStartPos.current.x;
    const dy_px = e.clientY - dragStartPos.current.y;
    
    if (Math.abs(dx_px) > 2 || Math.abs(dy_px) > 2) {
      hasMovedRef.current = true;
    }
    
    const dx_pct = (dx_px / containerSize.current.w) * 100;
    const dy_pct = (dy_px / containerSize.current.h) * 100;
    
    onUpdatePos(
      dragStartPos.current.itemX + dx_pct, 
      dragStartPos.current.itemY + dy_pct, 
      false
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }

    if (!hasMovedRef.current) {
      const now = Date.now();
      if (now - lastClickTime.current < 300) {
        if (clickTimer.current) clearTimeout(clickTimer.current);
        setIsFalling(true);
        setTimeout(onDrop, 800);
      } else {
        clickTimer.current = window.setTimeout(() => onZoom(), 250);
      }
      lastClickTime.current = now;
    }
  };

  const dynamicStyle: any = isZoomed ? {
    position: 'absolute',
    left: '50%',
    top: '48%',
    transform: 'translate3d(-50%, -48%, 0) scale(1)',
    zIndex: 20000, 
    width: '90%',
    maxWidth: '420px',
    backgroundColor: item.color,
    boxShadow: '0 60px 120px -30px rgba(0,0,0,0.8)',
    borderRadius: '2rem',
    padding: '1.5rem',
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    touchAction: 'none'
  } : {
    position: 'absolute',
    left: `${item.x}%`,
    top: `${item.y}%`,
    transform: isFalling ? undefined : `translate3d(0, 0, 0) rotate(${item.rotate}deg)`,
    '--initial-rotate': `${item.rotate}deg`,
    zIndex: item.zIndex,
    width: '120px',
    height: '120px',
    backgroundColor: item.color,
    willChange: 'transform, left, top',
    transition: isDragging ? 'none' : 'transform 0.3s ease-out, box-shadow 0.2s ease',
    boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.1)',
    touchAction: 'none'
  };

  return (
    <div 
      className={`sticky-note cursor-grab active:cursor-grabbing flex flex-col shadow-lg overflow-hidden ${isFalling ? 'animate-fall' : ''} ${!isZoomed ? 'p-3' : ''}`}
      style={dynamicStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className={`flex justify-between items-center border-b border-black/10 shrink-0 ${isZoomed ? 'mb-4 pb-4' : 'mb-2 pb-1'}`}>
        <span className={`${isZoomed ? 'text-xl' : 'text-[11px]'} font-black text-gray-800 truncate w-32 uppercase tracking-tighter`}>
          {item.userName}
        </span>
        <span className={`${isZoomed ? 'text-3xl' : 'text-xs'} font-black text-red-700 font-mono tracking-tighter`}>
          ${item.amount}
        </span>
      </div>

      <div className={`overflow-y-auto px-1 scroll-smooth hide-scrollbar ${isZoomed ? 'mb-4 max-h-[35vh]' : 'flex-1 pointer-events-none'}`}>
        <p className={`text-gray-900 font-serif italic leading-relaxed break-words ${isZoomed ? 'text-lg' : 'text-[10px]'}`}>
          "{item.greeting}"
        </p>
      </div>

      {isZoomed && (
        <div className="shrink-0 pt-4 border-t border-black/5">
          <div className="bg-black/5 p-4 rounded-xl mb-4 border-l-4 border-red-600">
            <p className="text-[10px] text-red-700 font-black mb-1 opacity-70 uppercase tracking-widest flex items-center gap-1">
              <span>✨</span> AI 鑑定大師結語
            </p>
            {isBackfilling ? (
              <p className="text-[14px] text-gray-400 font-serif italic animate-pulse">
                鑑定官正在整理思緒...
              </p>
            ) : (
              <p className="text-[14px] text-gray-800 font-serif leading-relaxed italic">
                「{item.comment || "祝您馬年好運馬上有！"}」
              </p>
            )}
          </div>
          <div className="text-[10px] text-center text-red-500/50 font-black animate-pulse uppercase tracking-[0.2em]">
            點擊關閉 • 雙擊移除
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
