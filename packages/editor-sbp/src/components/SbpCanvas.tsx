import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Connection,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnEdgesDelete,
  type Edge,
  type Node,
  type NodeDragHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import type { SbpDsl, SbpTask, SbpLane, CjmDsl } from '@enablement-map-studio/dsl';
import { TaskNode } from './TaskNode';
import { LaneNode } from './LaneNode';
import { dslToFlow, updateDslFromFlow, getLaneY, LANE_HEIGHT, LANE_SPACING, LANE_WIDTH } from '../utils/flowConverter';

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
  selectedLane,
  onTaskSelect,
  onLaneSelect,
  onLaneAdd,
  onLaneReorder,
  onSbpUpdate,
}: SbpCanvasProps) {
  // DSLからReact Flow形式に変換
  const initialFlow = useMemo(() => dslToFlow(sbp, cjm), [sbp, cjm]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

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
            data: { lane },
            draggable: true,
            selectable: true,
          });
        }
      });

      return [...updatedNodes, ...newLaneNodes];
    });
  }, [sbp.lanes, setNodes]);

  // タスク削除の検出と処理
  useEffect(() => {
    const dslTaskIds = new Set(sbp.tasks.map((t) => t.id));

    setNodes((currentNodes) => {
      const taskNodesToKeep = currentNodes.filter((node) => {
        if (node.type === 'taskNode' && !node.id.startsWith('cjm-readonly-')) {
          return dslTaskIds.has(node.id);
        }
        return true; // レーンノードとCJM readonlyノードは保持
      });

      return taskNodesToKeep;
    });

    // タスク削除に伴うエッジの削除
    setEdges((currentEdges) => {
      return currentEdges.filter((edge) => {
        return dslTaskIds.has(edge.source) && dslTaskIds.has(edge.target);
      });
    });
  }, [sbp.tasks, setNodes, setEdges]);

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

  // レーンのドラッグ終了時の処理
  const handleNodeDragStop: NodeDragHandler = useCallback(
    (_event, node) => {
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
    [nodes, sbp.lanes, onLaneReorder]
  );

  // エッジ接続時の処理
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
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

      // CJM readonlyノードからの接続の場合、source_idを自動設定
      if (connection.source?.startsWith('cjm-readonly-') && connection.target) {
        setNodes((currentNodes) => {
          const updatedNodes = currentNodes.map((node) => {
            if (node.id === connection.target) {
              const nodeData = node.data as any;
              const task = nodeData.task;

              // CJMアクションIDを抽出（cjm-readonly-{actionId}形式）
              const cjmActionId = connection.source.replace('cjm-readonly-', '');

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

          // DSLを更新
          setEdges((currentEdges) => {
            const updatedDsl = updateDslFromFlow(sbp, updatedNodes, currentEdges);
            onSbpUpdate(updatedDsl);
            return currentEdges;
          });

          return updatedNodes;
        });
      }
    },
    [setEdges, setNodes, sbp, onSbpUpdate]
  );

  // ノード変更時にDSLを更新
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // ノード位置変更などをDSLに反映
      setTimeout(() => {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            // レーンノードの削除を検出
            const currentLaneNodeIds = new Set(
              currentNodes.filter((n) => n.type === 'laneNode').map((n) => n.id.replace('lane:', ''))
            );
            const updatedLanes = sbp.lanes.filter((lane) => currentLaneNodeIds.has(lane.id));

            // タスクの更新
            const updatedDsl = updateDslFromFlow(sbp, currentNodes, currentEdges);

            // レーン削除も反映
            onSbpUpdate({
              ...updatedDsl,
              lanes: updatedLanes,
            });
            return currentEdges;
          });
          return currentNodes;
        });
      }, 0);
    },
    [onNodesChange, setNodes, setEdges, sbp, onSbpUpdate]
  );

  // エッジ変更時にDSLを更新
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);

      // エッジ削除などをDSLに反映
      setTimeout(() => {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            const updatedDsl = updateDslFromFlow(sbp, currentNodes, currentEdges);
            onSbpUpdate(updatedDsl);
            return currentEdges;
          });
          return currentNodes;
        });
      }, 0);
    },
    [onEdgesChange, setNodes, setEdges, sbp, onSbpUpdate]
  );

  // エッジ削除ハンドラー（Deleteキー）
  const handleEdgesDelete: OnEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      setEdges((currentEdges) => {
        const deletedEdgeIds = new Set(edgesToDelete.map((e) => e.id));
        const updatedEdges = currentEdges.filter((e) => !deletedEdgeIds.has(e.id));

        // DSLを更新
        setNodes((currentNodes) => {
          const updatedDsl = updateDslFromFlow(sbp, currentNodes, updatedEdges);
          onSbpUpdate(updatedDsl);
          return currentNodes;
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
      markerEnd: {
        ...edge.markerEnd,
        color: edge.id === selectedEdgeId ? '#1976d2' : '#555',
      },
    }));
  }, [edges, selectedEdgeId]);

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* レーン追加ボタン */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onLaneAdd}
          size="small"
        >
          レーン追加
        </Button>
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
    </Box>
  );
}
