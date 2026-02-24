import React from 'react';
import { useMoodFilter } from '../hooks/useMoodFilter';
import { getMoodEmoji, type Mood } from '../utils/moodMappings';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MoodFilterChips() {
  const { selectedMoods, toggleMood, clearMoods } = useMoodFilter();

  const moods: Mood[] = [
    'Happy',
    'Exciting',
    'Inspiring',
    'Romantic',
    'Suspenseful',
    'Thought-provoking',
    'Relaxing',
    'Dark',
    'Uplifting',
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => {
          const isSelected = selectedMoods.includes(mood);
          const emoji = getMoodEmoji(mood);

          return (
            <button
              key={mood}
              onClick={() => toggleMood(mood)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              <span>{emoji}</span>
              <span>{mood}</span>
              {isSelected && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>

      {selectedMoods.length > 0 && (
        <button
          onClick={clearMoods}
          className="text-sm text-muted-foreground hover:text-foreground underline min-h-[44px] px-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
