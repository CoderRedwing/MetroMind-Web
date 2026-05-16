import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dmrc_saved_routes';

export function useSavedRoutes() {
  const [savedRoutes, setSavedRoutes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  const saveRoute = (from, to, label = '') => {
    const newRoute = {
      id: Date.now(),
      from,
      to,
      label: label || `${from.name} → ${to.name}`,
      savedAt: new Date().toISOString(),
    };
    setSavedRoutes((prev) => {
      // Avoid duplicates
      const exists = prev.find((r) => r.from.id === from.id && r.to.id === to.id);
      if (exists) return prev;
      return [newRoute, ...prev].slice(0, 10); // max 10 saved
    });
    return newRoute;
  };

  const removeRoute = (id) => {
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = () => setSavedRoutes([]);

  const isAlreadySaved = (fromId, toId) =>
    savedRoutes.some((r) => r.from.id === fromId && r.to.id === toId);

  return { savedRoutes, saveRoute, removeRoute, clearAll, isAlreadySaved };
}
