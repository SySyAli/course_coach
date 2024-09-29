'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Box, VStack, Heading, Text, Container, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel, useToast, Flex } from '@chakra-ui/react'
import MajorSelector from './components/MajorSelector'
import CourseList from './components/CourseList'
import CourseFlowchart from './components/CourseFlowchart'
import AIChatbot from './components/AIChatbot'

const Home: React.FC = () => {
  const [major, setMajor] = useState<string | null>(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set())
  const toast = useToast()
  const toastShownRef = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const savedCompletedCourses = localStorage.getItem('completedCourses')
    if (savedCompletedCourses) {
      setCompletedCourses(new Set(JSON.parse(savedCompletedCourses)))
    }
  }, [])

  useEffect(() => {
    if (major) {
      setLoading(true)
      fetch(`/bio_data?major=${major}`)
        .then((res) => res.json())
        .then((data) => {
          setCourses(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching courses:', error)
          setLoading(false)
        })
    }
  }, [major])

  const toggleCourseCompletion = useCallback((courseId: string) => {
    setCompletedCourses((prev) => {
      const newSet = new Set(prev)
      const isCompleted = newSet.has(courseId)
      
      if (isCompleted) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }

      // Only show toast if it hasn't been shown for this courseId in this render cycle
      if (!toastShownRef.current[courseId]) {
        toast({
          title: isCompleted ? "Course marked as incomplete" : "Course marked as complete",
          status: isCompleted ? "info" : "success",
          duration: 2000,
          isClosable: true,
        })
        toastShownRef.current[courseId] = true

        // Reset the toast ref after a short delay
        setTimeout(() => {
          toastShownRef.current[courseId] = false
        }, 100)
      }

      localStorage.setItem('completedCourses', JSON.stringify(Array.from(newSet)))
      return newSet
    })
  }, [toast])

  return (
    <Container maxW="container.xl" p={0} height="100vh" display="flex" flexDirection="column">
      <VStack spacing={4} align="stretch" flex={1}>
        <Box textAlign="center" p={4}>
          <Heading as="h1" size="2xl" mb={2} color="purple.600">
            Course Explorer
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Discover courses for your major
          </Text>
        </Box>

        <Flex direction={{ base: 'column', md: 'row' }} px={4}>
          <Box width={{ base: '100%', md: '60%' }} mb={{ base: 4, md: 0 }}>
            <MajorSelector onMajorChange={setMajor} />
          </Box>
        </Flex>

        {loading ? (
          <Box textAlign="center">
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : major && courses.length > 0 ? (
          <Tabs isFitted variant="enclosed" flex={1} display="flex" flexDirection="column">
            <TabList>
              <Tab>Course List</Tab>
              <Tab>Course Flowchart</Tab>
            </TabList>
            <TabPanels flex={1}>
              <TabPanel height="100%">
                <CourseList 
                  courses={courses} 
                  completedCourses={completedCourses}
                  toggleCourseCompletion={toggleCourseCompletion}
                />
              </TabPanel>
              <TabPanel height="100%" p={0}>
                <CourseFlowchart 
                  courses={courses} 
                  completedCourses={completedCourses}
                  toggleCourseCompletion={toggleCourseCompletion}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Box textAlign="center">
            <Text fontSize="lg" color="gray.600">
              {major ? "No courses found for this major." : "Please select a major to view courses"}
            </Text>
          </Box>
        )}
      </VStack>
      <AIChatbot completedCourses={Array.from(completedCourses)} />
    </Container>
  )
}

export default Home