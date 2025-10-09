import type { CjmPhase, CjmAction } from '@enablement-map-studio/dsl';
import { ActionCard } from './ActionCard';

interface PhaseColumnProps {
  phase: CjmPhase;
  actions: CjmAction[];
  isSelected: boolean;
  selectedActionId?: string;
  onPhaseClick: () => void;
  onActionClick: (action: CjmAction) => void;
}

export function PhaseColumn({
  phase,
  actions,
  isSelected,
  selectedActionId,
  onPhaseClick,
  onActionClick,
}: PhaseColumnProps) {
  return (
    <div className="min-w-[300px] flex-shrink-0">
      {/* Phase header */}
      <button
        onClick={onPhaseClick}
        className={`mb-4 w-full rounded-t-lg p-4 text-left font-semibold transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {phase.name}
      </button>

      {/* Actions */}
      <div className="space-y-4">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            isSelected={selectedActionId === action.id}
            onClick={() => onActionClick(action)}
          />
        ))}
      </div>
    </div>
  );
}
