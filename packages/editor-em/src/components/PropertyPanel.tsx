import { useState, useEffect } from 'react';
import type {
  EmAction,
  EmSkill,
  EmKnowledge,
  EmTool,
  EmLearning,
} from '@enablement-map-studio/dsl';
import type { SelectedItem } from '../EmEditor';

interface PropertyPanelProps {
  selectedItem: SelectedItem;
  onActionUpdate: (action: EmAction) => void;
  onSkillUpdate: (skill: EmSkill) => void;
  onKnowledgeUpdate: (knowledge: EmKnowledge) => void;
  onToolUpdate: (tool: EmTool) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function PropertyPanel({
  selectedItem,
  onActionUpdate,
  onSkillUpdate,
  onKnowledgeUpdate,
  onToolUpdate,
  onDelete,
  onClose,
}: PropertyPanelProps) {
  const [editedItem, setEditedItem] = useState<any>(null);

  useEffect(() => {
    if (selectedItem) {
      setEditedItem(selectedItem.item);
    }
  }, [selectedItem]);

  if (!selectedItem || !editedItem) {
    return null;
  }

  const handleSave = () => {
    if (selectedItem.type === 'action') {
      onActionUpdate(editedItem);
    } else if (selectedItem.type === 'skill') {
      onSkillUpdate(editedItem);
    } else if (selectedItem.type === 'knowledge') {
      onKnowledgeUpdate(editedItem);
    } else if (selectedItem.type === 'tool') {
      onToolUpdate(editedItem);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete();
    }
  };

  return (
    <div className="w-80 overflow-auto border-l border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {selectedItem.type === 'action' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Action Name
              </label>
              <input
                type="text"
                value={editedItem.name}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, name: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Source ID (SBP Task)
              </label>
              <input
                type="text"
                value={editedItem.source_id}
                disabled
                className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">Read-only reference</p>
            </div>
          </>
        )}

        {selectedItem.type === 'skill' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skill Name
              </label>
              <input
                type="text"
                value={editedItem.name}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, name: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Learnings
              </label>
              {(editedItem.learnings || []).map((learning: EmLearning, idx: number) => (
                <div key={idx} className="mt-2 rounded border border-gray-200 p-2">
                  <input
                    type="text"
                    value={learning.title}
                    onChange={(e) => {
                      const updated = [...(editedItem.learnings || [])];
                      updated[idx] = { ...learning, title: e.target.value };
                      setEditedItem({ ...editedItem, learnings: updated });
                    }}
                    placeholder="Title"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={learning.url}
                    onChange={(e) => {
                      const updated = [...(editedItem.learnings || [])];
                      updated[idx] = { ...learning, url: e.target.value };
                      setEditedItem({ ...editedItem, learnings: updated });
                    }}
                    placeholder="URL"
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      const updated = (editedItem.learnings || []).filter(
                        (_: any, i: number) => i !== idx
                      );
                      setEditedItem({ ...editedItem, learnings: updated });
                    }}
                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const updated = [
                    ...(editedItem.learnings || []),
                    { title: '', url: '' },
                  ];
                  setEditedItem({ ...editedItem, learnings: updated });
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Learning
              </button>
            </div>
          </>
        )}

        {selectedItem.type === 'knowledge' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Knowledge Name
              </label>
              <input
                type="text"
                value={editedItem.name}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, name: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="text"
                value={editedItem.url}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, url: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </>
        )}

        {selectedItem.type === 'tool' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tool Name
              </label>
              <input
                type="text"
                value={editedItem.name}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, name: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="text"
                value={editedItem.url}
                onChange={(e) =>
                  setEditedItem({ ...editedItem, url: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
