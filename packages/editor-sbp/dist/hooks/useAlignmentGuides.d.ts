import type { Node } from '@xyflow/react';
export interface AlignmentLine {
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
}
export declare function useAlignmentGuides(): {
    alignmentLines: AlignmentLine[];
    onDragStart: () => void;
    onDrag: (draggingNode: Node, allNodes: Node[]) => {
        x: number;
        y: number;
    } | null;
    onDragEnd: () => void;
};
