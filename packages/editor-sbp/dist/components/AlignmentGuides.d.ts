import type { AlignmentLine } from '../hooks/useAlignmentGuides';
interface AlignmentGuidesProps {
    lines: AlignmentLine[];
    viewportWidth: number;
    viewportHeight: number;
}
export declare const AlignmentGuides: import("react").MemoExoticComponent<({ lines, viewportWidth, viewportHeight }: AlignmentGuidesProps) => import("react/jsx-runtime").JSX.Element | null>;
export {};
