'use client'

import React from 'react'
import { Box, VStack, Text, Heading, Badge } from '@chakra-ui/react'

interface Course {
  id: string
  name: string
  description: string
}

interface CourseListProps {
  courses: Course[]
}

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  return (
    <VStack spacing={4} align="stretch" width="100%" maxWidth="800px" margin="auto">
      {courses.map((course) => (
        <Box
          key={course.id}
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
        >
          <Heading fontSize="xl" mb={2}>
            {course.name} <Badge colorScheme="purple">{course.id}</Badge>
          </Heading>
          <Text fontSize="md">{course.description}</Text>
        </Box>
      ))}
    </VStack>
  )
}

export default CourseList