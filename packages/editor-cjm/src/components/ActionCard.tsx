import type { CjmAction } from '@enablement-map-studio/dsl';

interface ActionCardProps {
  action: CjmAction;
  isSelected: boolean;
  onClick: () => void;
}

// Emotion score to color mapping
const getEmotionColor = (score: number): string => {
  if (score >= 2) return 'bg-green-100 border-green-400';
  if (score >= 1) return 'bg-green-50 border-green-300';
  if (score === 0) return 'bg-gray-100 border-gray-300';
  if (score >= -1) return 'bg-orange-50 border-orange-300';
  return 'bg-red-100 border-red-400';
};

export function ActionCard({ action, isSelected, onClick }: ActionCardProps) {
  const colorClass = getEmotionColor(action.emotion_score);

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border-2 bg-white p-4 text-left shadow transition-all ${
        isSelected ? 'border-blue-500 shadow-lg' : colorClass
      }`}
    >
      {/* Action name */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900">{action.name}</h3>
      </div>

      {/* Touchpoints */}
      {action.touchpoints && action.touchpoints.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium uppercase text-gray-500">
            Touchpoints
          </h4>
          <ul className="mt-1 space-y-1 text-sm text-gray-700">
            {action.touchpoints.map((tp, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{tp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Thoughts & Feelings */}
      {action.thoughts_feelings && action.thoughts_feelings.length > 0 && (
        <div className="mb-2">
          <h4 className="text-xs font-medium uppercase text-gray-500">
            Thoughts & Feelings
          </h4>
          <ul className="mt-1 space-y-1 text-sm italic text-gray-600">
            {action.thoughts_feelings.map((tf, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-1">💭</span>
                <span>{tf}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emotion score indicator */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-2">
        <span className="text-xs text-gray-500">Emotion Score</span>
        <span className="font-semibold text-gray-900">{action.emotion_score}</span>
      </div>
    </button>
  );
}
