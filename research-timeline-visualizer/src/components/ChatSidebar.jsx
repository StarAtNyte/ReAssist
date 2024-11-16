import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/Button';

const ChatSidebar = ({ onPaperSelect }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const papers = await getPaperRecommendations(input);
      
      const assistantMessage = {
        role: 'assistant',
        content: 'Here are some relevant papers:',
        papers: papers
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching for papers. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const Message = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
          <p>{message.content}</p>
          {message.papers && (
            <div className="mt-2 space-y-2">
              {message.papers.map((paper, index) => (
                <Button 
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => onPaperSelect(paper)}
                >
                  {paper}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="fixed right-0 top-0 h-screen w-80 flex flex-col border-l">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h2 className="font-semibold">Research Assistant</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
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
            placeholder="Ask about a research topic..."
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

const getPaperRecommendations = async (topic) => {
  const response = await fetch('/api/papers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch paper recommendations');
  }
  
  return response.json();
};

export default ChatSidebar;