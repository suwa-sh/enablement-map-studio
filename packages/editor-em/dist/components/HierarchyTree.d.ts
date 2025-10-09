import type { EmDsl } from '@enablement-map-studio/dsl';
import type { SelectedItem } from '../EmEditor';
import type { HierarchyNode } from '../utils/buildHierarchy';
interface HierarchyTreeProps {
    nodes: HierarchyNode[];
    em: EmDsl;
    selectedItem: SelectedItem;
    onSelectItem: (item: SelectedItem) => void;
    depth?: number;
}
export declare function HierarchyTree({ nodes, em, selectedItem, onSelectItem, depth, }: HierarchyTreeProps): import("react/jsx-runtime").JSX.Element;
declare function HierarchyNode({ node, em, selectedItem, onSelectItem, depth, }: {
    node: HierarchyNode;
    em: EmDsl;
    selectedItem: SelectedItem;
    onSelectItem: (item: SelectedItem) => void;
    depth: number;
}): import("react/jsx-runtime").JSX.Element;
export {};
