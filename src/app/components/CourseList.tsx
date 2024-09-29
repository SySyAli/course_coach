'use client'

import React from 'react'
<<<<<<< Updated upstream
import { Box, VStack, Text, Heading, Badge, HStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Checkbox } from '@chakra-ui/react'
=======
import { Box, VStack, Text } from '@chakra-ui/react'
>>>>>>> Stashed changes

interface Course {
  __catalogCourseId: string;
  title: string;
<<<<<<< Updated upstream
  prerequisites: string[];
  corequisites: string[];
  description: string;
=======
  // Add other properties as needed
>>>>>>> Stashed changes
}

interface CourseListProps {
  courses: Course[];
<<<<<<< Updated upstream
  completedCourses: Set<string>;
  toggleCourseCompletion: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, completedCourses, toggleCourseCompletion }) => {
=======
}

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  if (courses.length === 0) {
    return (
      <Box textAlign="center">
        <Text>No courses found for this major.</Text>
      </Box>
    )
  }

>>>>>>> Stashed changes
  return (
    <VStack spacing={4} align="stretch">
      {courses.map((course) => (
<<<<<<< Updated upstream
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
=======
        <Box key={course.__catalogCourseId} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">{course.__catalogCourseId}</Text>
          <Text>{course.title}</Text>
        </Box>
>>>>>>> Stashed changes
      ))}
    </VStack>
  )
}

export default CourseList