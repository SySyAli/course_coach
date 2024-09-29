'use client'

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
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

const CourseFlowchart: React.FC<CourseFlowchartProps> = ({ courses, completedCourses, toggleCourseCompletion }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const nodes: Node[] = useMemo(() => {
    return courses.map((course, index) => ({
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
        background: completedCourses.has(course.__catalogCourseId) ? '#90EE90' : '#f0e6ff',
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
  }, [courses, completedCourses]);

  const edges: Edge[] = useMemo(() => {
    return courses.flatMap((course) => [
      ...course.prerequisites.map((prereq) => ({
        id: `${prereq}-${course.__catalogCourseId}`,
        source: prereq,
        target: course.__catalogCourseId,
        animated: true,
        style: { stroke: '#9c27b0' },
        type: 'smoothstep',
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
  }, [toggleCourseCompletion, completedCourses, setNodesState]);

  const closeModal = () => setSelectedCourse(null);

  return (
    <>
      <div style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}>
        <ReactFlow
          nodes={nodesState}
          edges={edgesState}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
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
                                background: completedCourses.has(selectedCourse.__catalogCourseId) ? '#f0e6ff' : '#90EE90',
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