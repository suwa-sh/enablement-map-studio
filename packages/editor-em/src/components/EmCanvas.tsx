import type {
  EmDsl,
  OutcomeDsl,
  SbpDsl,
  CjmDsl,
} from '@enablement-map-studio/dsl';
import type { SelectedItem } from '../EmEditor';
import { HierarchyTree } from './HierarchyTree';
import { buildHierarchy } from '../utils/buildHierarchy';

interface EmCanvasProps {
  em: EmDsl;
  outcome: OutcomeDsl | null;
  sbp: SbpDsl | null;
  cjm: CjmDsl | null;
  selectedItem: SelectedItem;
  onSelectItem: (item: SelectedItem) => void;
}

export function EmCanvas({
  em,
  outcome,
  sbp,
  cjm,
  selectedItem,
  onSelectItem,
}: EmCanvasProps) {
  const hierarchy = buildHierarchy(em, outcome, sbp, cjm);

  if (hierarchy.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 p-6">
        <div className="text-center text-gray-500">
          <p>No hierarchy to display.</p>
          <p className="mt-2 text-sm">
            Make sure CJM, SBP, and Outcome data are properly linked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Enablement Map Hierarchy
      </h2>

      <div className="rounded-lg bg-white p-6 shadow">
        <HierarchyTree
          nodes={hierarchy}
          em={em}
          selectedItem={selectedItem}
          onSelectItem={onSelectItem}
        />
      </div>
    </div>
  );
}
