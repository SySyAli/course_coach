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
    case '1': return '#E9D8FD'; // lightest purple
    case '2': return '#D6BCFA';
    case '3': return '#B794F4';
    case '4': return '#9F7AEA';
    case '5': return '#805AD5'; // darkest purple
    default: return '#E9D8FD';
  }
};

const getCourseLevel = (courseId: string): number => {
  const match = courseId.match(/\d/);
  return match ? parseInt(match[0]) : 1;
};

const CourseFlowchart: React.FC<CourseFlowchartProps> = ({ courses, completedCourses, toggleCourseCompletion }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const getNodeColor = useCallback((course: Course) => {
    if (completedCourses.has(course.__catalogCourseId)) {
      return '#90EE90'; // Green for completed courses
    }
    const canTake = course.prerequisites.every(prereq => completedCourses.has(prereq));
    return canTake ? '#87CEFA' : '#f0e6ff'; // Light blue for available courses, default color otherwise
  }, [completedCourses]);

  const { nodes, edges } = useMemo(() => {
    const courseMap = new Map(courses.map(course => [course.__catalogCourseId, course]));
    const levelMap = new Map<number, Course[]>();
    const nodeLevels = new Map<string, number>();

    // Determine the level of each course
    const determineLevel = (courseId: string, visited = new Set<string>()): number => {
      if (nodeLevels.has(courseId)) return nodeLevels.get(courseId)!;
      if (visited.has(courseId)) return 0; // Prevent cycles
      visited.add(courseId);

      const course = courseMap.get(courseId);
      if (!course) return 0;

      const courseLevel = getCourseLevel(courseId);
      const prereqLevels = course.prerequisites.map(prereq => determineLevel(prereq, new Set(visited)));
      const level = Math.max(courseLevel, ...prereqLevels, 0);
      nodeLevels.set(courseId, level);

      if (!levelMap.has(level)) levelMap.set(level, []);
      levelMap.get(level)!.push(course);

      return level;
    };

    courses.forEach(course => determineLevel(course.__catalogCourseId));

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const maxCoursesPerRow = 5;
    const horizontalSpacing = 200;
    const verticalSpacing = 150;

    // Create nodes
    Array.from(levelMap.entries()).forEach(([level, levelCourses]) => {
      levelCourses.sort((a, b) => getCourseLevel(a.__catalogCourseId) - getCourseLevel(b.__catalogCourseId));
      
      levelCourses.forEach((course, index) => {
        const row = Math.floor(index / maxCoursesPerRow);
        const col = index % maxCoursesPerRow;
        
        nodes.push({
          id: course.__catalogCourseId,
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
          position: { 
            x: col * horizontalSpacing - (Math.min(levelCourses.length, maxCoursesPerRow) - 1) * horizontalSpacing / 2,
            y: level * verticalSpacing * 2 + row * verticalSpacing
          },
          style: {
            background: completedCourses.has(course.__catalogCourseId) ? '#90EE90' : getLevelColor(course.__catalogCourseId),
            color: '#4a0e4e',
            border: '1px solid #9c27b0',
            borderRadius: '8px',
            padding: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center',
            width: 180,
          },
        });
      });
    });

    // Create edges
    courses.forEach(course => {
      course.prerequisites.forEach(prereq => {
        edges.push({
          id: `${prereq}-${course.__catalogCourseId}`,
          source: prereq,
          target: course.__catalogCourseId,
          animated: true,
          style: { stroke: '#9c27b0' },
          type: 'smoothstep',
        });
      });
      course.corequisites.forEach(coreq => {
        edges.push({
          id: `${course.__catalogCourseId}-${coreq}`,
          source: course.__catalogCourseId,
          target: coreq,
          animated: true,
          style: { stroke: '#27b0b0' },
          type: 'straight',
        });
      });
    });

    return { nodes, edges };
  }, [courses, completedCourses]);

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
      // Update node color immediately
      setNodesState((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                style: {
                  ...n.style,
                  background: completedCourses.has(node.id) ? '#f0e6ff' : '#90EE90',
                },
              }
            : n
        )
      );
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
          minZoom={0.1}
          maxZoom={2}
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
                    // Update node color immediately
                    setNodesState((nds) =>
                      nds.map((n) =>
                        n.id === selectedCourse.__catalogCourseId
                          ? {
                              ...n,
                              style: {
                                ...n.style,
                                background: completedCourses.has(selectedCourse.__catalogCourseId) 
                                  ? getLevelColor(selectedCourse.__catalogCourseId) 
                                  : '#90EE90',
                              },
                            }
                          : n
                      )
                    );
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