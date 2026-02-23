import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { getAllMoods, getMoodEmoji, type Mood } from '../utils/moodMappings';

interface MoodFilterChipsProps {
  selectedMoods: Mood[];
  onToggleMood: (mood: Mood) => void;
}

export default function MoodFilterChips({ selectedMoods, onToggleMood }: MoodFilterChipsProps) {
  const moods = getAllMoods();

  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => {
        const isSelected = selectedMoods.includes(mood);
        return (
          <button
            key={mood}
            onClick={() => onToggleMood(mood)}
            className="transition-all duration-200 hover:scale-105"
          >
            <Badge
              variant={isSelected ? 'default' : 'outline'}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium rounded-full ${
                isSelected
                  ? 'bg-vangogh-yellow text-vangogh-blue hover:bg-vangogh-yellow/90 border-vangogh-yellow'
                  : 'bg-white/10 text-white border-white/30 hover:bg-vangogh-yellow/20 hover:border-vangogh-yellow/60'
              }`}
            >
              <span className="mr-1.5">{getMoodEmoji(mood)}</span>
              {mood}
              {isSelected && <Check className="ml-1.5 h-3 w-3" />}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
