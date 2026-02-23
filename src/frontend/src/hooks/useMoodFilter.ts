import { useState, useMemo } from 'react';
import { getGenresForMoods, type Mood } from '../utils/moodMappings';

export function useMoodFilter() {
  const [selectedMoods, setSelectedMoods] = useState<Mood[]>([]);

  const toggleMood = (mood: Mood) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const clearMoods = () => {
    setSelectedMoods([]);
  };

  const genresFromMoods = useMemo(() => {
    return getGenresForMoods(selectedMoods);
  }, [selectedMoods]);

  return {
    selectedMoods,
    toggleMood,
    clearMoods,
    genresFromMoods,
  };
}
