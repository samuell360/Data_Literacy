/**
 * Slide Analytics Hook
 * 
 * Tracks slide viewing metrics and progress
 */

import { useState, useEffect } from 'react';

interface SlideMetrics {
  slideId: string;
  timeSpent: number;
  timestamp: number;
}

export function useSlideAnalytics(lessonId: string) {
  const [slideMetrics, setSlideMetrics] = useState<SlideMetrics[]>([]);
  const [slideStartTime, setSlideStartTime] = useState<number>(Date.now());
  
  const recordSlideView = (slideId: string) => {
    const now = Date.now();
    const timeSpent = now - slideStartTime;
    
    setSlideMetrics(prev => [
      ...prev,
      { slideId, timeSpent, timestamp: now }
    ]);
    
    setSlideStartTime(now);
    
    // Store in localStorage for persistence
    const key = `lesson-analytics-${lessonId}`;
    const existing = localStorage.getItem(key);
    const data = existing ? JSON.parse(existing) : [];
    data.push({ slideId, timeSpent, timestamp: now });
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  const getAverageTimePerSlide = () => {
    if (slideMetrics.length === 0) return 0;
    const total = slideMetrics.reduce((sum, m) => sum + m.timeSpent, 0);
    return Math.round(total / slideMetrics.length / 1000); // seconds
  };
  
  const getTotalTimeSpent = () => {
    const total = slideMetrics.reduce((sum, m) => sum + m.timeSpent, 0);
    return Math.round(total / 1000); // seconds
  };
  
  return {
    recordSlideView,
    getAverageTimePerSlide,
    getTotalTimeSpent,
    slideMetrics
  };
}
