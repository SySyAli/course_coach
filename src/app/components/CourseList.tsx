'use client'

import React from 'react'
import { Box, VStack, Text, Heading, Badge, HStack } from '@chakra-ui/react'

interface Course {
  __catalogCourseId: string;
  prerequisites: string[];
  corequisites: string[];
}

interface CourseListProps {
  courses: Course[]
}

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  return (
    <VStack spacing={4} align="stretch" width="100%" maxWidth="800px" margin="auto">
      {courses.map((course) => (
        <Box
          key={course.__catalogCourseId}
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
        >
          <Heading fontSize="xl" mb={2}>
            {course.__catalogCourseId}
          </Heading>
          <HStack spacing={2} mb={2}>
            <Text fontWeight="bold">Prerequisites:</Text>
            {course.prerequisites.length > 0 ? (
              course.prerequisites.map((prereq) => (
                <Badge key={prereq} colorScheme="purple">{prereq}</Badge>
              ))
            ) : (
              <Text>None</Text>
            )}
          </HStack>
          <HStack spacing={2}>
            <Text fontWeight="bold">Corequisites:</Text>
            {course.corequisites.length > 0 ? (
              course.corequisites.map((coreq) => (
                <Badge key={coreq} colorScheme="blue">{coreq}</Badge>
              ))
            ) : (
              <Text>None</Text>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  )
}

export default CourseList