'use client'

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Connection, addEdge } from 'reactflow';

interface Course {
  __catalogCourseId: string;
  prerequisites: string[];
  corequisites: string[];
}

interface CourseFlowchartProps {
  courses: Course[];
}

const CourseFlowchart: React.FC<CourseFlowchartProps> = ({ courses }) => {
  const nodes = useMemo(() => {
    return courses.map((course, index) => ({
      id: course.__catalogCourseId,
      position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 150 },
      data: { label: course.__catalogCourseId },
      style: {
        background: '#f0e6ff',
        color: '#4a0e4e',
        border: '1px solid #9c27b0',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center' as const,
        width: 180,
      },
    }));
  }, [courses]);

  const edges = useMemo(() => {
    return courses.flatMap((course) => [
      ...course.prerequisites.map((prereq) => ({
        id: `${prereq}-${course.__catalogCourseId}`,
        source: prereq,
        target: course.__catalogCourseId,
        animated: true,
        style: { stroke: '#9c27b0' },
      })),
      ...course.corequisites.map((coreq) => ({
        id: `${course.__catalogCourseId}-${coreq}`,
        source: course.__catalogCourseId,
        target: coreq,
        animated: true,
        style: { stroke: '#27b0b0' },
        type: 'straight',
      })),
    ]);
  }, [courses]);

  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback((params: Connection) => setEdgesState((eds) => addEdge(params, eds)), [setEdgesState]);

  return (
    <div style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}>
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#f8f0ff" gap={16} />
        <Controls />
        <MiniMap style={{ height: 120 }} nodeStrokeColor="#9c27b0" nodeColor="#f0e6ff" />
      </ReactFlow>
    </div>
  );
};

export default CourseFlowchart;