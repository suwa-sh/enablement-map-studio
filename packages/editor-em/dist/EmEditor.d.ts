import type { EmAction, EmSkill, EmKnowledge, EmTool } from '@enablement-map-studio/dsl';
export type SelectedItem = {
    type: 'action';
    item: EmAction;
} | {
    type: 'skill';
    item: EmSkill;
} | {
    type: 'knowledge';
    item: EmKnowledge;
} | {
    type: 'tool';
    item: EmTool;
} | null;
export declare function EmEditor(): import("react/jsx-runtime").JSX.Element;
