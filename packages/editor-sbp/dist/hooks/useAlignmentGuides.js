import { useState, useCallback } from 'react';
const SNAP_THRESHOLD = 5; // スナップする閾値（px）
export function useAlignmentGuides() {
    const [alignmentLines, setAlignmentLines] = useState([]);
    /**
     * ノードのドラッグ中に呼ばれる関数
     * 他のノードとの中央位置を比較してガイド線とスナップ位置を計算
     */
    const calculateAlignment = useCallback((draggingNode, allNodes) => {
        const lines = [];
        let snapX = null;
        let snapY = null;
        // ドラッグ中のノードの中央位置を計算
        const draggingNodeCenterX = draggingNode.position.x + (draggingNode.measured?.width || 0) / 2;
        const draggingNodeCenterY = draggingNode.position.y + (draggingNode.measured?.height || 0) / 2;
        // 他のノードと比較（レーンノードは除外）
        const otherNodes = allNodes.filter((node) => node.id !== draggingNode.id && node.type === 'taskNode');
        otherNodes.forEach((node) => {
            const nodeCenterX = node.position.x + (node.measured?.width || 0) / 2;
            const nodeCenterY = node.position.y + (node.measured?.height || 0) / 2;
            // 水平ガイド（Y座標の中央が揃う）
            const diffY = Math.abs(draggingNodeCenterY - nodeCenterY);
            if (diffY < SNAP_THRESHOLD) {
                // 重複チェック
                const existingHorizontalLine = lines.find((line) => line.type === 'horizontal' && Math.abs(line.position - nodeCenterY) < 1);
                if (!existingHorizontalLine) {
                    lines.push({
                        id: `h-${node.id}`,
                        type: 'horizontal',
                        position: nodeCenterY,
                    });
                }
                // スナップ位置を計算（ノードの中央ではなく左上座標に変換）
                snapY = nodeCenterY - (draggingNode.measured?.height || 0) / 2;
            }
            // 垂直ガイド（X座標の中央が揃う）
            const diffX = Math.abs(draggingNodeCenterX - nodeCenterX);
            if (diffX < SNAP_THRESHOLD) {
                // 重複チェック
                const existingVerticalLine = lines.find((line) => line.type === 'vertical' && Math.abs(line.position - nodeCenterX) < 1);
                if (!existingVerticalLine) {
                    lines.push({
                        id: `v-${node.id}`,
                        type: 'vertical',
                        position: nodeCenterX,
                    });
                }
                // スナップ位置を計算（ノードの中央ではなく左上座標に変換）
                snapX = nodeCenterX - (draggingNode.measured?.width || 0) / 2;
            }
        });
        return {
            lines,
            snapPosition: snapX !== null || snapY !== null
                ? {
                    x: snapX ?? draggingNode.position.x,
                    y: snapY ?? draggingNode.position.y,
                }
                : null,
        };
    }, []);
    /**
     * ドラッグ開始時に呼ぶ
     */
    const onDragStart = useCallback(() => {
        setAlignmentLines([]);
    }, []);
    /**
     * ドラッグ中に呼ぶ
     */
    const onDrag = useCallback((draggingNode, allNodes) => {
        const result = calculateAlignment(draggingNode, allNodes);
        setAlignmentLines(result.lines);
        return result.snapPosition;
    }, [calculateAlignment]);
    /**
     * ドラッグ終了時に呼ぶ
     */
    const onDragEnd = useCallback(() => {
        setAlignmentLines([]);
    }, []);
    return {
        alignmentLines,
        onDragStart,
        onDrag,
        onDragEnd,
    };
}
