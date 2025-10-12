import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Connection,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnEdgesDelete,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import type { SbpDsl, SbpTask, SbpLane, CjmDsl } from '@enablement-map-studio/dsl';
import { TaskNode } from './TaskNode';
import { LaneNode } from './LaneNode';
import { AlignmentGuides } from './AlignmentGuides';
import { useAlignmentGuides } from '../hooks/useAlignmentGuides';
import { dslToFlow, updateDslFromFlow, LANE_HEIGHT, LANE_SPACING, LANE_WIDTH } from '../utils/flowConverter';

interface SbpCanvasProps {
  sbp: SbpDsl;
  cjm: CjmDsl | null;
  selectedTask: SbpTask | null;
  selectedLane: SbpLane | null;
  onTaskSelect: (task: SbpTask) => void;
  onLaneSelect: (lane: SbpLane) => void;
  onTaskUpdate: (task: SbpTask) => void;
  onLaneUpdate: (lane: SbpLane) => void;
  onLaneAdd: () => void;
  onTaskAdd?: (laneId: string, taskName: string) => void;
  onLaneReorder: (lanes: SbpLane[]) => void;
  onSbpUpdate: (sbp: SbpDsl) => void;
}

const nodeTypes: NodeTypes = {
  taskNode: TaskNode,
  laneNode: LaneNode,
};

export function SbpCanvas({
  sbp,
  cjm,
  selectedTask,
  selectedLane: _selectedLane,
  onTaskSelect,
  onLaneSelect,
  onLaneAdd,
  onTaskAdd,
  onLaneReorder,
  onSbpUpdate,
}: SbpCanvasProps) {
  // DSLからReact Flow形式に変換
  const initialFlow = useMemo(() => dslToFlow(sbp, cjm), [sbp, cjm]);

  const [nodes, setNodes] = useNodesState(initialFlow.nodes);
  const [edges, setEdges] = useEdgesState(initialFlow.edges);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // タスク追加ダイアログの状態管理
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedLaneForNewTask, setSelectedLaneForNewTask] = useState('');

  // アライメントガイド用のフック
  const { alignmentLines, onDragStart, onDrag, onDragEnd } = useAlignmentGuides();

  // レーンリサイズ時のスナップガイド
  const [resizeAlignmentLines, setResizeAlignmentLines] = useState<{ horizontal: number[]; vertical: number[] }>({
    horizontal: [],
    vertical: [],
  });

  // レーンの更新と削除の検出
  useEffect(() => {
    const dslLaneIds = new Set(sbp.lanes.map((l) => `lane:${l.id}`));

    setNodes((currentNodes) => {
      // 既存のレーンノードIDを取得
      const existingLaneNodeIds = new Set(
        currentNodes.filter((n) => n.type === 'laneNode').map((n) => n.id)
      );

      // 削除されたレーンをフィルタリングし、既存レーンを更新
      const updatedNodes = currentNodes
        .filter((node) => {
          // レーンノードの場合、DSLに存在するかチェック
          if (node.type === 'laneNode') {
            return dslLaneIds.has(node.id);
          }
          return true; // タスクノードは保持
        })
        .map((node) => {
          // 残ったレーンノードのデータを更新
          if (node.type === 'laneNode') {
            const laneId = node.id.replace('lane:', '');
            const updatedLane = sbp.lanes.find((l) => l.id === laneId);
            if (updatedLane) {
              return {
                ...node,
                data: {
                  ...node.data,
                  lane: updatedLane,
                  // onResizeとonResizeEndは既に設定されているものを保持
                },
              };
            }
          }
          return node;
        });

      // 新しく追加されたレーンを検出してノードを作成
      const newLaneNodes: Node[] = [];
      sbp.lanes.forEach((lane, index) => {
        const nodeId = `lane:${lane.id}`;
        if (!existingLaneNodeIds.has(nodeId)) {
          newLaneNodes.push({
            id: nodeId,
            type: 'laneNode',
            position: { x: 0, y: index * (LANE_HEIGHT + LANE_SPACING) },
            style: {
              width: LANE_WIDTH,
              height: LANE_HEIGHT,
            },
            data: {
              lane,
              // onResizeとonResizeEndは後で設定
            },
            draggable: true,
            selectable: true,
          });
        }
      });

      return [...updatedNodes, ...newLaneNodes];
    });
  }, [sbp.lanes, setNodes]);

  // タスクの追加・削除・更新の検出と処理
  useEffect(() => {
    const dslTaskIds = new Set(sbp.tasks.map((t) => t.id));

    // CJMアクションのIDも含める（CJM接続のエッジ削除を防ぐため）
    if (cjm) {
      cjm.actions.forEach((action) => dslTaskIds.add(action.id));
    }

    setNodes((currentNodes) => {
      // 既存のタスクノードIDを取得（CJM readonlyを除く）
      const existingTaskNodeIds = new Set(
        currentNodes
          .filter((n) => n.type === 'taskNode' && !n.id.startsWith('cjm-readonly-'))
          .map((n) => n.id)
      );

      // 削除されたタスクをフィルタリング、既存タスクのデータを更新
      const taskNodesToKeep = currentNodes
        .filter((node) => {
          if (node.type === 'taskNode' && !node.id.startsWith('cjm-readonly-')) {
            return dslTaskIds.has(node.id);
          }
          return true; // レーンノードとCJM readonlyノードは保持
        })
        .map((node) => {
          // 残ったタスクノードのデータを更新（PropertyPanelでの編集を反映）
          if (node.type === 'taskNode' && !node.id.startsWith('cjm-readonly-')) {
            const updatedTask = sbp.tasks.find((t) => t.id === node.id);
            if (updatedTask) {
              return {
                ...node,
                data: {
                  ...node.data,
                  task: updatedTask,
                },
              };
            }
          }
          return node;
        });

      // 新しく追加されたタスクを検出してノードを作成
      const newTaskNodes: Node[] = [];
      sbp.tasks.forEach((task) => {
        if (!task.readonly && !existingTaskNodeIds.has(task.id)) {
          newTaskNodes.push({
            id: task.id,
            type: 'taskNode',
            position: task.position || { x: 100, y: 100 },
            data: { task },
            parentId: `lane:${task.lane}`,
            extent: 'parent' as const,
            draggable: true,
            selectable: true,
          });
        }
      });

      return [...taskNodesToKeep, ...newTaskNodes];
    });

    // タスク削除に伴うエッジの削除
    setEdges((currentEdges) => {
      return currentEdges.filter((edge) => {
        // CJM readonlyノード（cjm-readonly-*）のIDをDSL形式に変換してチェック
        const sourceId = edge.source.startsWith('cjm-readonly-')
          ? edge.source.replace('cjm-readonly-', '')
          : edge.source;
        const targetId = edge.target.startsWith('cjm-readonly-')
          ? edge.target.replace('cjm-readonly-', '')
          : edge.target;

        return dslTaskIds.has(sourceId) && dslTaskIds.has(targetId);
      });
    });
  }, [sbp.tasks, cjm, setNodes, setEdges]);

  // CJM readonlyノードの同期（CJMアクションの追加・削除・更新）
  useEffect(() => {
    if (!cjm) {
      // cjmがnullの場合、すべてのCJM readonlyノードを削除
      setNodes((currentNodes) =>
        currentNodes.filter((node) => !node.id.startsWith('cjm-readonly-'))
      );
      return;
    }

    const cjmLane = sbp.lanes.find((lane) => lane.kind === 'cjm');
    if (!cjmLane) {
      // CJMレーンが存在しない場合、CJM readonlyノードを削除
      setNodes((currentNodes) =>
        currentNodes.filter((node) => !node.id.startsWith('cjm-readonly-'))
      );
      return;
    }

    // CJMアクションをソート（phaseの順序、同じphase内ではactionsの順序）
    const sortedActions = cjm.actions.slice().sort((a, b) => {
      const phaseAIndex = cjm.phases.findIndex((p) => p.id === a.phase);
      const phaseBIndex = cjm.phases.findIndex((p) => p.id === b.phase);
      if (phaseAIndex !== phaseBIndex) {
        return phaseAIndex - phaseBIndex;
      }
      const aIndex = cjm.actions.findIndex((act) => act.id === a.id);
      const bIndex = cjm.actions.findIndex((act) => act.id === b.id);
      return aIndex - bIndex;
    });

    setNodes((currentNodes) => {
      // 既存のCJM readonlyノードのIDを収集
      const existingCjmNodeIds = new Set(
        currentNodes
          .filter((n) => n.id.startsWith('cjm-readonly-'))
          .map((n) => n.id)
      );

      // CJMアクションから期待されるノードIDを収集
      const expectedCjmNodeIds = new Set<string>();
      const newNodes: Node[] = [];

      sortedActions.forEach((action, index) => {
        const nodeId = `cjm-readonly-${action.id}`;
        expectedCjmNodeIds.add(nodeId);

        // SBPにすでに対応するタスクが存在するかチェック
        const existingTask = sbp.tasks.find(
          (task) => task.source_id === action.id && task.lane === cjmLane.id
        );

        if (!existingTask && !existingCjmNodeIds.has(nodeId)) {
          // 新しいCJM readonlyノードを作成
          newNodes.push({
            id: nodeId,
            type: 'taskNode',
            parentId: `lane:${cjmLane.id}`,
            extent: 'parent' as const,
            position: { x: 100 + index * 220, y: 50 },
            data: {
              task: {
                id: action.id,
                lane: cjmLane.id,
                name: action.name,
                source_id: action.id,
                readonly: true,
              },
              isReadonly: true,
              isSelected: false,
            },
          });
        }
      });

      // 不要になったCJM readonlyノードを削除し、新しいノードを追加
      return [
        ...currentNodes.filter((node) => {
          if (node.id.startsWith('cjm-readonly-')) {
            return expectedCjmNodeIds.has(node.id);
          }
          return true;
        }),
        ...newNodes,
      ];
    });
  }, [cjm, sbp.lanes, sbp.tasks, setNodes]);

  // ノード選択時の処理
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      // レーンノードの場合
      if (node.type === 'laneNode') {
        const lane = node.data.lane as SbpLane;
        onLaneSelect(lane);
        setSelectedEdgeId(null);
        return;
      }

      // タスクノードの場合
      const task = node.data.task as SbpTask;
      if (!node.data.isReadonly) {
        onTaskSelect(task);
        setSelectedEdgeId(null);
      }
    },
    [onTaskSelect, onLaneSelect]
  );

  // エッジ選択時の処理
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdgeId(edge.id);
    },
    []
  );

  // タスクノードのドラッグ開始時の処理
  const handleNodeDragStart = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // タスクノード（CJM readonlyノード含む）の場合、アライメントガイドを有効化
      if (node.type === 'taskNode') {
        onDragStart();
      }
    },
    [onDragStart]
  );

  // タスクノードのドラッグ中の処理
  const handleNodeDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // タスクノード（CJM readonlyノード含む）の場合、アライメントガイドとスナップを計算
      if (node.type === 'taskNode') {
        const snapPosition = onDrag(node, nodes);

        // スナップ位置があれば、ノード位置を更新（ドラッグ中にリアルタイムで吸着）
        if (snapPosition) {
          setNodes((currentNodes) =>
            currentNodes.map((n) =>
              n.id === node.id ? { ...n, position: snapPosition } : n
            )
          );
        }
      }
    },
    [onDrag, nodes, setNodes]
  );

  // レーンリサイズ中の処理（スナップガイド表示）
  const handleLaneResize = useCallback(
    (laneNodeId: string) => (
      _event: React.MouseEvent | React.TouchEvent,
      params: { width: number; height: number; x: number; y: number }
    ) => {
      const currentLaneNode = nodes.find((n) => n.id === laneNodeId);
      if (!currentLaneNode) return;

      // 他のレーンノードとタスクノードを取得
      const otherLanes = nodes.filter((n) => n.id !== laneNodeId && n.type === 'laneNode');
      const taskNodes = nodes.filter((n) => n.type === 'taskNode');

      const horizontalLines: number[] = [];
      const verticalLines: number[] = [];

      const SNAP_THRESHOLD = 10;

      // リサイズ後の右端と下端の座標
      const rightEdge = params.x + params.width;
      const bottomEdge = params.y + params.height;

      // 他のレーンの端と比較
      otherLanes.forEach((otherLane) => {
        const otherRight = otherLane.position.x + (otherLane.measured?.width || otherLane.width || LANE_WIDTH);
        const otherBottom = otherLane.position.y + (otherLane.measured?.height || otherLane.height || LANE_HEIGHT);

        // 横方向（幅）のアライメント
        if (Math.abs(rightEdge - otherRight) < SNAP_THRESHOLD) {
          verticalLines.push(otherRight);
        }

        // 縦方向（高さ）のアライメント
        if (Math.abs(bottomEdge - otherBottom) < SNAP_THRESHOLD) {
          horizontalLines.push(otherBottom);
        }
      });

      // タスクノードの端とも比較
      taskNodes.forEach((taskNode) => {
        const taskRight = taskNode.position.x + (taskNode.measured?.width || 200);
        const taskBottom = taskNode.position.y + (taskNode.measured?.height || 80);

        if (Math.abs(rightEdge - taskRight) < SNAP_THRESHOLD) {
          verticalLines.push(taskRight);
        }

        if (Math.abs(bottomEdge - taskBottom) < SNAP_THRESHOLD) {
          horizontalLines.push(taskBottom);
        }
      });

      setResizeAlignmentLines({
        horizontal: horizontalLines,
        vertical: verticalLines,
      });
    },
    [nodes]
  );

  // レーンリサイズ終了時の処理（スナップ確定とガイド非表示）
  const handleLaneResizeEnd = useCallback(
    (laneNodeId: string) => (
      _event: React.MouseEvent | React.TouchEvent,
      params: { width: number; height: number; x: number; y: number }
    ) => {
      // ガイドを非表示
      setResizeAlignmentLines({ horizontal: [], vertical: [] });

      // スナップ位置を確定
      setTimeout(() => {
        setNodes((currentNodes) => {
          const currentLaneNode = currentNodes.find((n) => n.id === laneNodeId);
          if (!currentLaneNode) return currentNodes;

          // 他のレーンノードとタスクノードを取得
          const otherLanes = currentNodes.filter((n) => n.id !== laneNodeId && n.type === 'laneNode');
          const taskNodes = currentNodes.filter((n) => n.type === 'taskNode');

          let snappedWidth = params.width;
          let snappedHeight = params.height;

          const SNAP_THRESHOLD = 10;

          // リサイズ後の右端と下端の座標
          const rightEdge = params.x + params.width;
          const bottomEdge = params.y + params.height;

          // 他のレーンの端と比較してスナップ
          otherLanes.forEach((otherLane) => {
            const otherRight = otherLane.position.x + (otherLane.measured?.width || otherLane.width || LANE_WIDTH);
            const otherBottom = otherLane.position.y + (otherLane.measured?.height || otherLane.height || LANE_HEIGHT);

            // 横方向（幅）のスナップ
            if (Math.abs(rightEdge - otherRight) < SNAP_THRESHOLD) {
              snappedWidth = otherRight - params.x;
            }

            // 縦方向（高さ）のスナップ
            if (Math.abs(bottomEdge - otherBottom) < SNAP_THRESHOLD) {
              snappedHeight = otherBottom - params.y;
            }
          });

          // タスクノードの端ともスナップ
          taskNodes.forEach((taskNode) => {
            const taskRight = taskNode.position.x + (taskNode.measured?.width || 200);
            const taskBottom = taskNode.position.y + (taskNode.measured?.height || 80);

            if (Math.abs(rightEdge - taskRight) < SNAP_THRESHOLD) {
              snappedWidth = taskRight - params.x;
            }

            if (Math.abs(bottomEdge - taskBottom) < SNAP_THRESHOLD) {
              snappedHeight = taskBottom - params.y;
            }
          });

          // スナップした場合のみ更新
          if (snappedWidth !== params.width || snappedHeight !== params.height) {
            return currentNodes.map((n) =>
              n.id === laneNodeId
                ? {
                    ...n,
                    style: {
                      ...n.style,
                      width: snappedWidth,
                      height: snappedHeight,
                    },
                    width: snappedWidth,
                    height: snappedHeight,
                  }
                : n
            );
          }

          return currentNodes;
        });
      }, 0);
    },
    [setNodes]
  );

  // レーンノードにリサイズハンドラを設定
  useEffect(() => {
    setNodes((currentNodes) => {
      return currentNodes.map((node) => {
        if (node.type === 'laneNode') {
          return {
            ...node,
            data: {
              ...node.data,
              onResize: handleLaneResize(node.id),
              onResizeEnd: handleLaneResizeEnd(node.id),
            },
          };
        }
        return node;
      });
    });
  }, [handleLaneResize, handleLaneResizeEnd, setNodes]);

  // レーンのドラッグ終了時の処理
  const handleNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      // タスクノード（CJM readonlyノード含む）の場合は最終的なスナップ位置を確定してからガイドを非表示
      if (node.type === 'taskNode') {
        // まずガイドを非表示にする
        onDragEnd();

        // その後、最終スナップ位置を確定（ガイド非表示後なので破線は表示されない）
        setTimeout(() => {
          setNodes((currentNodes) => {
            const currentNode = currentNodes.find((n) => n.id === node.id);
            if (!currentNode) return currentNodes;

            // 現在位置でスナップ判定（onDragを使わずに直接計算）
            const otherNodes = currentNodes.filter(
              (n) => n.id !== node.id && n.type === 'taskNode'
            );

            let snapX: number | null = null;
            let snapY: number | null = null;

            const nodeCenterX = currentNode.position.x + (currentNode.measured?.width || 0) / 2;
            const nodeCenterY = currentNode.position.y + (currentNode.measured?.height || 0) / 2;

            otherNodes.forEach((other) => {
              const otherCenterX = other.position.x + (other.measured?.width || 0) / 2;
              const otherCenterY = other.position.y + (other.measured?.height || 0) / 2;

              const SNAP_THRESHOLD = 10;

              if (Math.abs(nodeCenterY - otherCenterY) < SNAP_THRESHOLD) {
                snapY = otherCenterY - (currentNode.measured?.height || 0) / 2;
              }

              if (Math.abs(nodeCenterX - otherCenterX) < SNAP_THRESHOLD) {
                snapX = otherCenterX - (currentNode.measured?.width || 0) / 2;
              }
            });

            if (snapX !== null || snapY !== null) {
              return currentNodes.map((n) =>
                n.id === node.id
                  ? {
                      ...n,
                      position: {
                        x: snapX ?? n.position.x,
                        y: snapY ?? n.position.y,
                      },
                    }
                  : n
              );
            }

            return currentNodes;
          });
        }, 0);

        return;
      }

      // レーンノードの場合のみ処理
      if (node.type !== 'laneNode') return;

      // 現在のレーンのY座標からインデックスを推定
      const laneNodes = nodes.filter((n) => n.type === 'laneNode');
      const sortedLaneNodes = [...laneNodes].sort((a, b) => a.position.y - b.position.y);

      // 新しいレーン順序を構築
      const newLaneOrder = sortedLaneNodes
        .map((laneNode) => {
          const laneData = (laneNode.data as any).lane as SbpLane;
          return sbp.lanes.find((l) => l.id === laneData.id);
        })
        .filter((lane): lane is SbpLane => lane !== undefined);

      // レーンの順序が変わった場合のみ更新
      if (JSON.stringify(newLaneOrder.map((l) => l.id)) !== JSON.stringify(sbp.lanes.map((l) => l.id))) {
        onLaneReorder(newLaneOrder);
      }
    },
    [nodes, sbp.lanes, onLaneReorder, onDrag, onDragEnd, setNodes]
  );

  // エッジ接続時の処理
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      console.log('🔗 handleConnect called:', {
        originalSource: connection.source,
        originalTarget: connection.target,
        originalSourceHandle: connection.sourceHandle,
        originalTargetHandle: connection.targetHandle,
      });

      // sourceとtargetを入れ替え（D&D終了側に矢印をつけるため）
      // ハンドルも入れ替える（D&D開始側のハンドルから矢印が出るように）
      const reversedConnection = {
        source: connection.target,
        target: connection.source,
        sourceHandle: connection.targetHandle,
        targetHandle: connection.sourceHandle,
      };

      const newEdge = {
        ...reversedConnection,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#555',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#555',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // CJM readonlyノードとの接続の場合、source_idを自動設定
      // ※元のconnectionオブジェクトでCJM接続を判定（エッジのsource/targetは入れ替え済み）
      console.log('🔍 Checking CJM connection:', {
        isCjmSource: connection.source?.startsWith('cjm-readonly-'),
        isCjmTarget: connection.target?.startsWith('cjm-readonly-'),
      });

      // CJM → タスク、またはタスク → CJMの両方向に対応
      const cjmNodeId = connection.source?.startsWith('cjm-readonly-')
        ? connection.source
        : connection.target?.startsWith('cjm-readonly-')
          ? connection.target
          : null;

      const taskNodeId = connection.source?.startsWith('cjm-readonly-')
        ? connection.target
        : connection.target?.startsWith('cjm-readonly-')
          ? connection.source
          : null;

      if (cjmNodeId && taskNodeId) {
        // CJMアクションIDを抽出（cjm-readonly-{actionId}形式）
        const cjmActionId = cjmNodeId.replace('cjm-readonly-', '');
        console.log('✅ CJM connection detected:', {
          cjmActionId,
          taskNodeId,
        });

        // ノード更新とDSL更新を一度に実行
        setTimeout(() => {
          setNodes((currentNodes) => {
            const updatedNodes = currentNodes.map((node) => {
              if (node.id === taskNodeId) {
                const nodeData = node.data as any;
                const task = nodeData.task;

                // タスクのsource_idを更新
                const updatedTask = {
                  ...task,
                  source_id: cjmActionId,
                };

                return {
                  ...node,
                  data: {
                    ...nodeData,
                    task: updatedTask,
                  },
                };
              }
              return node;
            });

            // DSL更新を同じタイミングで実行
            setEdges((currentEdges) => {
              const updatedDsl = updateDslFromFlow(sbp, updatedNodes, currentEdges);
              onSbpUpdate(updatedDsl);
              return currentEdges;
            });

            return updatedNodes;
          });
        }, 100); // タイミングを調整
      }
    },
    [setEdges, setNodes, sbp, onSbpUpdate]
  );

  // ノード変更時にDSLを更新
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // React Flowの状態を更新
      setNodes((currentNodes) => {
        const updatedNodes = applyNodeChanges(changes, currentNodes);

        // 更新後のノードでDSLを更新
        setTimeout(() => {
          // タスクとレーンの更新
          const updatedDsl = updateDslFromFlow(sbp, updatedNodes, edges);

          // レーンノードの削除を検出（updateDslFromFlowで更新されたレーン情報を使用）
          const currentLaneNodeIds = new Set(
            updatedNodes.filter((n) => n.type === 'laneNode').map((n) => n.id.replace('lane:', ''))
          );
          const filteredLanes = updatedDsl.lanes.filter((lane) => currentLaneNodeIds.has(lane.id));

          // レーン削除も反映
          onSbpUpdate({
            ...updatedDsl,
            lanes: filteredLanes,
          });
        }, 0);

        return updatedNodes;
      });
    },
    [setNodes, edges, sbp, onSbpUpdate]
  );

  // エッジ変更時にDSLを更新
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // React Flowの状態を更新
      setEdges((currentEdges) => {
        const updatedEdges = applyEdgeChanges(changes, currentEdges);

        // 更新後のエッジでDSLを更新
        setTimeout(() => {
          const updatedDsl = updateDslFromFlow(sbp, nodes, updatedEdges);
          onSbpUpdate(updatedDsl);
        }, 0);

        return updatedEdges;
      });
    },
    [setEdges, nodes, sbp, onSbpUpdate]
  );

  // エッジ削除ハンドラー（Deleteキー）
  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      setEdges((currentEdges) => {
        const deletedEdgeIds = new Set(edgesToDelete.map((e) => e.id));
        const updatedEdges = currentEdges.filter((e) => !deletedEdgeIds.has(e.id));

        // 削除されたエッジからCJM接続を特定し、該当タスクのsource_idをクリア
        setNodes((currentNodes) => {
          let updatedNodes = currentNodes;

          edgesToDelete.forEach((edge) => {
            // CJM readonlyノードが関係するエッジかチェック
            const cjmNodeId = edge.source.startsWith('cjm-readonly-')
              ? edge.source
              : edge.target.startsWith('cjm-readonly-')
                ? edge.target
                : null;

            const taskNodeId = edge.source.startsWith('cjm-readonly-')
              ? edge.target
              : edge.target.startsWith('cjm-readonly-')
                ? edge.source
                : null;

            if (cjmNodeId && taskNodeId) {
              const cjmActionId = cjmNodeId.replace('cjm-readonly-', '');

              // 該当タスクのsource_idをクリア
              updatedNodes = updatedNodes.map((node) => {
                if (node.id === taskNodeId) {
                  const nodeData = node.data as any;
                  const task = nodeData.task;

                  if (task.source_id === cjmActionId) {
                    return {
                      ...node,
                      data: {
                        ...nodeData,
                        task: {
                          ...task,
                          source_id: undefined,
                        },
                      },
                    };
                  }
                }
                return node;
              });
            }
          });

          // DSLを更新
          const updatedDsl = updateDslFromFlow(sbp, updatedNodes, updatedEdges);
          onSbpUpdate(updatedDsl);
          return updatedNodes;
        });

        return updatedEdges;
      });
    },
    [setEdges, setNodes, sbp, onSbpUpdate]
  );

  // 選択状態をノードデータに反映
  const nodesWithSelection = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isSelected: selectedTask?.id === (node.data as any).task?.id,
      },
    }));
  }, [nodes, selectedTask]);

  // エッジの選択状態を反映
  const edgesWithSelection = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: edge.id === selectedEdgeId ? '#1976d2' : '#555',
        strokeWidth: edge.id === selectedEdgeId ? 3 : 2,
      },
      markerStart: edge.markerStart && typeof edge.markerStart === 'object' ? {
        ...edge.markerStart,
        color: edge.id === selectedEdgeId ? '#1976d2' : '#555',
      } : edge.markerStart,
      markerEnd: edge.markerEnd && typeof edge.markerEnd === 'object' ? {
        ...edge.markerEnd,
        color: edge.id === selectedEdgeId ? '#1976d2' : '#555',
      } : edge.markerEnd,
    }));
  }, [edges, selectedEdgeId]);

  // タスク追加ダイアログのハンドラー
  const handleOpenAddTaskDialog = () => {
    setNewTaskName('');
    // CJMレーン以外の最初のレーンを選択
    const regularLane = sbp.lanes.find(lane => lane.kind !== 'cjm');
    setSelectedLaneForNewTask(regularLane?.id || sbp.lanes[0]?.id || '');
    setAddTaskDialogOpen(true);
  };

  const handleCloseAddTaskDialog = () => {
    setAddTaskDialogOpen(false);
  };

  const handleAddTaskSubmit = () => {
    if (newTaskName.trim() && selectedLaneForNewTask && onTaskAdd) {
      onTaskAdd(selectedLaneForNewTask, newTaskName.trim());
      handleCloseAddTaskDialog();
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* レーン・タスク追加ボタン */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onLaneAdd}
        >
          レーン追加
        </Button>
        {onTaskAdd && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddTaskDialog}
          >
            タスク追加
          </Button>
        )}
      </Box>

      <ReactFlow
        nodes={nodesWithSelection}
        edges={edgesWithSelection}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onEdgesDelete={handleEdgesDelete}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        deleteKeyCode={['Delete', 'Backspace']}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        {/* 背景グリッド */}
        <Background color="#aaa" gap={16} />

        {/* コントロールパネル */}
        <Controls />

        {/* ミニマップ */}
        <MiniMap
          nodeColor={(node) => {
            return (node.data as any).isReadonly ? '#ccc' : '#1976d2';
          }}
          style={{ backgroundColor: '#f5f5f5' }}
        />
      </ReactFlow>

      {/* アライメントガイド（タスクノードドラッグ時） */}
      <AlignmentGuides
        lines={alignmentLines}
        viewportWidth={window.innerWidth}
        viewportHeight={window.innerHeight}
      />

      {/* アライメントガイド（レーンリサイズ時） */}
      <AlignmentGuides
        lines={[
          ...resizeAlignmentLines.horizontal.map((y, i) => ({
            id: `resize-h-${i}`,
            type: 'horizontal' as const,
            position: y,
          })),
          ...resizeAlignmentLines.vertical.map((x, i) => ({
            id: `resize-v-${i}`,
            type: 'vertical' as const,
            position: x,
          })),
        ]}
        viewportWidth={window.innerWidth}
        viewportHeight={window.innerHeight}
      />

      {/* タスク追加ダイアログ */}
      <Dialog open={addTaskDialogOpen} onClose={handleCloseAddTaskDialog}>
        <DialogTitle>タスク追加</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>レーン</InputLabel>
            <Select
              value={selectedLaneForNewTask}
              label="レーン"
              onChange={(e) => setSelectedLaneForNewTask(e.target.value)}
            >
              {sbp.lanes.filter(lane => lane.kind !== 'cjm').map((lane) => (
                <MenuItem key={lane.id} value={lane.id}>
                  {lane.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            autoFocus
            label="タスク名"
            fullWidth
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTaskName.trim()) {
                handleAddTaskSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTaskDialog}>キャンセル</Button>
          <Button onClick={handleAddTaskSubmit} variant="contained" disabled={!newTaskName.trim()}>
            追加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
