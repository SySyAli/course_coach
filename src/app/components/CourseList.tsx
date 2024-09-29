'use client'

import React from 'react'
import { Box, VStack, Text, Heading, Badge, HStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Checkbox } from '@chakra-ui/react'

interface Course {
  __catalogCourseId: string;
  title: string;
  prerequisites: string[];
  corequisites: string[];
  description: string;
}

interface CourseListProps {
  courses: Course[];
  completedCourses: Set<string>;
  toggleCourseCompletion: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, completedCourses, toggleCourseCompletion }) => {
  return (
    <VStack spacing={4} align="stretch" width="100%" maxWidth="800px" margin="auto">
      {courses.map((course) => (
        <Accordion allowToggle key={course.__catalogCourseId}>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Checkbox
                      isChecked={completedCourses.has(course.__catalogCourseId)}
                      onChange={() => toggleCourseCompletion(course.__catalogCourseId)}
                      mr={2}
                    />
                    <Heading fontSize="xl" mb={2}>
                      {course.title} <Badge colorScheme="purple">{course.__catalogCourseId}</Badge>
                    </Heading>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={2}>{course.description}</Text>
              <HStack spacing={2} mb={2}>
                <Text fontWeight="bold">Prerequisites:</Text>
                {course.prerequisites.length > 0 ? (
                  course.prerequisites.map((prereq) => (
                    <Badge key={prereq} colorScheme="blue">{prereq}</Badge>
                  ))
                ) : (
                  <Text>None</Text>
                )}
              </HStack>
              <HStack spacing={2}>
                <Text fontWeight="bold">Corequisites:</Text>
                {course.corequisites.length > 0 ? (
                  course.corequisites.map((coreq) => (
                    <Badge key={coreq} colorScheme="green">{coreq}</Badge>
                  ))
                ) : (
                  <Text>None</Text>
                )}
              </HStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      ))}
    </VStack>
  )
}

export default CourseList