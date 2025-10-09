import type { EmAction, EmSkill, EmKnowledge, EmTool } from '@enablement-map-studio/dsl';
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
export declare function PropertyPanel({ selectedItem, onActionUpdate, onSkillUpdate, onKnowledgeUpdate, onToolUpdate, onDelete, onClose, }: PropertyPanelProps): import("react/jsx-runtime").JSX.Element | null;
export {};
