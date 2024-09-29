'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowInstance,
  getBezierPath,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Connection, addEdge } from 'reactflow';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Text, VStack, Badge, HStack } from '@chakra-ui/react';

interface Course {
  __catalogCourseId: string;
  title: string;
  prerequisites: string[];
  corequisites: string[];
  description: string;
}

interface CourseFlowchartProps {
  courses: Course[];
  completedCourses: Set<string>;
  toggleCourseCompletion: (courseId: string) => void;
}

const getLevelColor = (courseId: string): string => {
  const level = courseId.match(/\d/)?.[0];
  switch (level) {
    case '1': return '#F3E5F5'; // Lightest purple
    case '2': return '#E1BEE7';
    case '3': return '#CE93D8';
    case '4': return '#BA68C8';
    case '5': return '#AB47BC'; // Darkest purple
    default: return '#F3E5F5';
  }
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) => {
  const isCurved = id === 'CHEM1601-BSCI1510';
  
  if (isCurved) {
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.5,
    });
    return (
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
      />
    );
  } else {
    return (
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
      />
    );
  }
};

const CourseFlowchart: React.FC<CourseFlowchartProps> = ({ courses, completedCourses, toggleCourseCompletion }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const getNodeColor = useCallback((course: Course) => {
    if (completedCourses.has(course.__catalogCourseId)) {
      return '#90EE90'; // Green for completed courses
    }
    const canTake = course.prerequisites.every(prereq => completedCourses.has(prereq));
    return canTake ? '#87CEFA' : getLevelColor(course.__catalogCourseId); // Light blue for available courses, level color otherwise
  }, [completedCourses]);

  const nodes: Node[] = useMemo(() => {
    const courseNodes = courses.map((course, index) => ({
      id: course.__catalogCourseId,
      position: { x: 100 + (index % 5) * 250, y: 100 + Math.floor(index / 5) * 150 },
      data: { 
        label: (
          <>
            <strong>{course.__catalogCourseId}</strong>
            <br />
            {course.title}
          </>
        ),
        course: course
      },
      style: {
        background: getNodeColor(course),
        color: '#4a0e4e',
        border: '1px solid #9c27b0',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 180,
      },
    }));

    // Add CHEM1601 node
    const chem1601Node: Node = {
      id: 'CHEM1601',
      position: { x: -150, y: 100 }, // Adjust position to be to the left of BSCI1510
      data: { 
        label: (
          <>
            <strong>CHEM1601</strong>
            <br />
            General Chemistry
          </>
        ),
        course: {
          __catalogCourseId: 'CHEM1601',
          title: 'General Chemistry',
          prerequisites: [],
          corequisites: [],
          description: 'Prerequisite for BSCI1510'
        }
      },
      style: {
        background: getLevelColor('CHEM1601'),
        color: '#4a0e4e',
        border: '1px solid #9c27b0',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 180,
      },
    };

    return [...courseNodes, chem1601Node];
  }, [courses, completedCourses, getNodeColor]);

  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);

  const edges: Edge[] = useMemo(() => {
    const courseEdges = courses.flatMap((course) => [
      ...course.prerequisites.map((prereq) => ({
        id: `${prereq}-${course.__catalogCourseId}`,
        source: prereq,
        target: course.__catalogCourseId,
        animated: true,
        style: { stroke: '#9c27b0' },
        type: 'custom',
      })),
      ...course.corequisites.map((coreq) => ({
        id: `${course.__catalogCourseId}-${coreq}`,
        source: course.__catalogCourseId,
        target: coreq,
        animated: true,
        style: { stroke: '#27b0b0' },
        type: 'custom',
      })),
    ]);

    // Add edge from CHEM1601 to BSCI1510
    const chem1601Edge: Edge = {
      id: 'CHEM1601-BSCI1510',
      source: 'CHEM1601',
      target: 'BSCI1510',
      animated: true,
      style: { stroke: '#9c27b0' },
      type: 'custom',
    };

    return [...courseEdges, chem1601Edge];
  }, [courses]);

  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback((params: Connection) => setEdgesState((eds) => addEdge(params, eds)), [setEdgesState]);

  const updateNodeColors = useCallback(() => {
    setNodesState((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          background: getNodeColor(n.data.course),
        },
      }))
    );
  }, [setNodesState, getNodeColor]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (event.ctrlKey || event.metaKey) {
      toggleCourseCompletion(node.id);
      updateNodeColors();
    } else {
      setSelectedCourse(node.data.course);
    }
  }, [toggleCourseCompletion, updateNodeColors]);

  useEffect(() => {
    updateNodeColors();
  }, [completedCourses, updateNodeColors]);

  const closeModal = () => setSelectedCourse(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    setTimeout(() => {
      instance.fitView({ duration: 800 });
    }, 100);
  }, []);

  return (
    <>
      <div style={{ width: '100%', height: '100vh' }}>
        <ReactFlow
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onInit={onInit}
          fitView
          edgeTypes={{ custom: CustomEdge }}
        >
          <Background color="#f8f0ff" gap={16} />
          <Controls />
          <MiniMap style={{ height: 120 }} nodeStrokeColor="#9c27b0" nodeColor="#f0e6ff" />
        </ReactFlow>
      </div>
      <Modal isOpen={!!selectedCourse} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedCourse?.title} ({selectedCourse?.__catalogCourseId})</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={4}>
              <Text>{selectedCourse?.description}</Text>
              <HStack>
                <Text fontWeight="bold">Prerequisites:</Text>
                {selectedCourse?.prerequisites.length ? 
                  selectedCourse.prerequisites.map(prereq => (
                    <Badge key={prereq} colorScheme="blue">{prereq}</Badge>
                  )) : 
                  <Text>None</Text>
                }
              </HStack>
              <HStack>
                <Text fontWeight="bold">Corequisites:</Text>
                {selectedCourse?.corequisites.length ? 
                  selectedCourse.corequisites.map(coreq => (
                    <Badge key={coreq} colorScheme="green">{coreq}</Badge>
                  )) : 
                  <Text>None</Text>
                }
              </HStack>
              <Button
                colorScheme={completedCourses.has(selectedCourse?.__catalogCourseId || '') ? "green" : "gray"}
                onClick={() => {
                  if (selectedCourse) {
                    toggleCourseCompletion(selectedCourse.__catalogCourseId);
                    updateNodeColors();
                  }
                }}
              >
                {completedCourses.has(selectedCourse?.__catalogCourseId || '') ? "Mark as Incomplete" : "Mark as Complete"}
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={closeModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CourseFlowchart;