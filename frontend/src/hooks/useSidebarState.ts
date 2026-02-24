import { useState, useEffect } from 'react';

const SIDEBAR_STORAGE_KEY = 'sidebarCollapsed';

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    // Read from localStorage on mount, default to false (expanded)
    if (typeof window === 'undefined') return false;
    
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Save to localStorage whenever state changes
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const toggle = () => {
    setIsCollapsed(prev => !prev);
  };

  return {
    isCollapsed,
    toggle,
  };
}
