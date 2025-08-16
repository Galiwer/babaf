import { useState, useEffect } from 'react';
import { listVaccines } from '../services/vaccineService';

export function useVaccineSync() {
  const [vaccines, setVaccines] = useState(listVaccines());
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const refreshVaccines = () => {
    setVaccines(listVaccines());
    setUpdateTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vaccines_db') {
        refreshVaccines();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes every second as a fallback
    const interval = setInterval(() => {
      const currentVaccines = listVaccines();
      if (JSON.stringify(currentVaccines) !== JSON.stringify(vaccines)) {
        setVaccines(currentVaccines);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [vaccines]);

  return { vaccines, refreshVaccines, updateTrigger };
}
