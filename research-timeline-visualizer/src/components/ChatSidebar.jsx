import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/Button';
import { Alert, AlertDescription } from './ui/alert';

const ChatSidebar = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatResponse = async (messageHistory, userMessage) => {
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messageHistory, userMessage]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling chat API:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getChatResponse(messages, userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const Message = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[85%] ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h2 className="font-semibold">Chat Assistant</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <Alert variant="default" className="mb-4">
            <AlertDescription className="text-sm text-gray-600">
              Hello! I'm here to help answer your questions. Feel free to ask me anything!
            </AlertDescription>
          </Alert>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-md"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            size="sm"
            className="px-3"
          >
            {isLoading ? 
              <Loader2 className="w-4 h-4 animate-spin" /> : 
              <Send className="w-4 h-4" />
            }
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatSidebar;