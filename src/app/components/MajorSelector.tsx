'use client'

import React from 'react'
import { Select, Box } from '@chakra-ui/react'

interface MajorSelectorProps {
  onMajorChange: (major: string) => void
}

const MajorSelector: React.FC<MajorSelectorProps> = ({ onMajorChange }) => {
  return (
    <Box width="300px">
      <Select
        bg="white"
        borderColor="purple.200"
        _hover={{ borderColor: 'purple.300' }}
        onChange={(e) => onMajorChange(e.target.value)}
        placeholder="Select major"
      >
        <option value="BSCI">Biological Sciences (BSCI)</option>
      </Select>
    </Box>
  )
}

export default MajorSelector
