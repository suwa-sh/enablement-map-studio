import { OutcomeEditor } from '@enablement-map-studio/editor-outcome';

export function OutcomeEditorPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Outcome Editor
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <OutcomeEditor />
      </div>
    </div>
  );
}
