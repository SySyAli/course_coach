import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Input, 
  Button, 
  useColorModeValue, 
  Flex, 
  Heading,
  Spacer,
  IconButton,
  Collapse
} from '@chakra-ui/react';
import { FaPaperPlane, FaRobot, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface Message {
    text: string;
    isUser: boolean;
}

interface AIChatbotProps {
    completedCourses: string[];
}

const AIChatbot: React.FC<AIChatbotProps> = ({ completedCourses }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { text: input, isUser: true };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: input,
                    completedCourses: completedCourses
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            
            const aiMessage: Message = { text: data.message, isUser: false };
            setMessages(prevMessages => [...prevMessages, aiMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = { text: 'Sorry, I encountered an error.', isUser: false };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box 
          width="100%" 
          borderWidth={1} 
          borderColor={borderColor} 
          borderRadius="lg" 
          overflow="hidden"
          bg={bg}
          boxShadow="md"
        >
            <Flex 
              bg="purple.600" 
              p={4} 
              color="white" 
              alignItems="center"
            >
                <Heading size="md">AI Chatbot</Heading>
                <Spacer />
                <IconButton
                  aria-label="Toggle chat"
                  icon={isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  onClick={() => setIsOpen(!isOpen)}
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'purple.500' }}
                />
            </Flex>
            <Collapse in={isOpen} animateOpacity>
                <VStack spacing={4} p={4} height="400px" overflowY="auto">
                    {messages.map((message, index) => (
                        <Flex key={index} w="100%" justify={message.isUser ? "flex-end" : "flex-start"}>
                            <HStack 
                              spacing={2} 
                              maxW="70%" 
                              bg={message.isUser ? "purple.500" : "gray.100"} 
                              color={message.isUser ? "white" : "black"}
                              p={2} 
                              borderRadius="lg"
                            >
                                {!message.isUser && <FaRobot />}
                                <Text>{message.text}</Text>
                                {message.isUser && <FaUser />}
                            </HStack>
                        </Flex>
                    ))}
                    {isLoading && (
                        <Flex w="100%" justify="flex-start">
                            <HStack spacing={2} bg="gray.100" p={2} borderRadius="lg">
                                <FaRobot />
                                <Text>Thinking...</Text>
                            </HStack>
                        </Flex>
                    )}
                    <div ref={messagesEndRef} />
                </VStack>
                <form onSubmit={handleSubmit}>
                    <HStack p={4} borderTopWidth={1} borderColor={borderColor}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <Button 
                          type="submit" 
                          colorScheme="purple" 
                          isLoading={isLoading}
                          leftIcon={<FaPaperPlane />}
                        >
                            Send
                        </Button>
                    </HStack>
                </form>
            </Collapse>
        </Box>
    );
};

export default AIChatbot;