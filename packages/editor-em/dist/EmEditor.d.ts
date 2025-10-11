import type { EmAction } from '@enablement-map-studio/dsl';
export type SelectedItem = {
    type: 'action';
    item: EmAction;
} | {
    type: 'skill';
    item: {
        id: string;
        name: string;
    };
} | {
    type: 'knowledge';
    item: {
        id: string;
        name: string;
    };
} | {
    type: 'tool';
    item: {
        id: string;
        name: string;
    };
} | null;
export declare function EmEditor(): import("react/jsx-runtime").JSX.Element;
