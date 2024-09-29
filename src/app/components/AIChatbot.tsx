import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Input, 
  Button, 
  useColorModeValue, 
  Flex, 
  IconButton,
  Collapse,
  Portal
} from '@chakra-ui/react';
import { FaPaperPlane, FaRobot, FaUser, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';

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
    const [isVisible, setIsVisible] = useState(true);
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

    if (!isVisible) {
        return (
            <Portal>
                <IconButton
                    aria-label="Open chatbot"
                    icon={<FaRobot />}
                    position="fixed"
                    bottom="20px"
                    right="20px"
                    onClick={() => setIsVisible(true)}
                    colorScheme="purple"
                    size="lg"
                    borderRadius="full"
                />
            </Portal>
        );
    }

    return (
        <Portal>
            <Draggable handle=".handle">
                <Box 
                    position="fixed"
                    bottom="20px"
                    right="20px"
                    width="300px"
                    borderWidth={1} 
                    borderColor={borderColor} 
                    borderRadius="lg" 
                    overflow="hidden"
                    bg={bg}
                    boxShadow="lg"
                >
                    <Flex 
                        bg="purple.600" 
                        p={2} 
                        color="white" 
                        alignItems="center"
                        className="handle"
                        cursor="move"
                    >
                        <Text fontWeight="bold">AI Chatbot</Text>
                        {/* <Spacer /> */}
                        <IconButton
                            aria-label="Toggle chat"
                            icon={isOpen ? <FaChevronDown /> : <FaChevronUp />}
                            onClick={() => setIsOpen(!isOpen)}
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'purple.500' }}
                            size="sm"
                        />
                        <IconButton
                            aria-label="Close chat"
                            icon={<FaTimes />}
                            onClick={() => setIsVisible(false)}
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'purple.500' }}
                            size="sm"
                            ml={1}
                        />
                    </Flex>
                    <Collapse in={isOpen} animateOpacity>
                        <VStack spacing={4} p={4} height="300px" overflowY="auto">
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
                                        <Text fontSize="sm">{message.text}</Text>
                                        {message.isUser && <FaUser />}
                                    </HStack>
                                </Flex>
                            ))}
                            {isLoading && (
                                <Flex w="100%" justify="flex-start">
                                    <HStack spacing={2} bg="gray.100" p={2} borderRadius="lg">
                                        <FaRobot />
                                        <Text fontSize="sm">Thinking...</Text>
                                    </HStack>
                                </Flex>
                            )}
                            <div ref={messagesEndRef} />
                        </VStack>
                        <form onSubmit={handleSubmit}>
                            <HStack p={2} borderTopWidth={1} borderColor={borderColor}>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    disabled={isLoading}
                                    size="sm"
                                />
                                <IconButton
                                    aria-label="Send message"
                                    icon={<FaPaperPlane />}
                                    type="submit"
                                    colorScheme="purple"
                                    isLoading={isLoading}
                                    size="sm"
                                />
                            </HStack>
                        </form>
                    </Collapse>
                </Box>
            </Draggable>
        </Portal>
    );
};

export default AIChatbot;