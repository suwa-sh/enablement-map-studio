import { EmEditor } from '@enablement-map-studio/editor-em';

export function EmEditorPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Enablement Map Editor
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <EmEditor />
      </div>
    </div>
  );
}
