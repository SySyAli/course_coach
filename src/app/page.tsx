'use client'

import React, { useState, useEffect } from 'react'
import { Box, VStack, Heading, Text, Container, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import MajorSelector from './components/MajorSelector'
import CourseList from './components/CourseList'
import CourseFlowchart from './components/CourseFlowchart'

const Home: React.FC = () => {
  const [major, setMajor] = useState<string | null>(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

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

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2} color="purple.600">
            Course Explorer
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Discover courses for your major
          </Text>
        </Box>

        <MajorSelector onMajorChange={setMajor} />

        {loading ? (
          <Box textAlign="center">
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : major && courses.length > 0 ? (
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>Course List</Tab>
              <Tab>Course Flowchart</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <CourseList courses={courses} />
              </TabPanel>
              <TabPanel>
                <Box height="700px" width="100%">
                  <CourseFlowchart courses={courses} />
                </Box>
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
    </Container>
  )
}

export default Home
