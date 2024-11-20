import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Loader2, BookOpen } from 'lucide-react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/Button';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs.tsx'; // Import from local tabs file
import PaperSelector from './PaperSelector';
import AnalysisTools from './AnalysisTools';

const ChatSidebar = ({ papers }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' or 'paper'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getChatResponse = async (messageHistory, userMessage, analysisType = null) => {
    try {
      const payload = {
        messages: [...messageHistory, userMessage],
        mode,
        ...(mode === 'paper' && selectedPaper && { paper: selectedPaper }),
        ...(analysisType && { analysisType })
      };

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
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

  const handleAnalysis = async (analysisType) => {
    if (!selectedPaper) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Please select a paper first before running analysis."
      }]);
      return;
    }

    setIsAnalyzing(true);
    const analysisPrompts = {
      overview: `Generate a detailed general overview of the paper "${selectedPaper.title}"`,
      findings: `Summarize the key findings from the paper "${selectedPaper.title}"`,
      visualize: `Create a visual explanation of the main concepts in "${selectedPaper.title}"`
    };

    try {
      const userMessage = { role: 'user', content: analysisPrompts[analysisType] };
      setMessages(prev => [...prev, userMessage]);

      const aiResponse = await getChatResponse(messages, userMessage, analysisType);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an error while analyzing the paper. Please try again."
      }]);
    } finally {
      setIsAnalyzing(false);
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setMessages([]); // Clear messages when switching modes
    if (newMode === 'chat') {
      setSelectedPaper(null);
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
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h2 className="font-semibold">AI Assistant</h2>
          </div>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList>
              <TabsTrigger 
                value="chat" 
                onClick={() => setMode('chat')}
                className="flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="paper" 
                onClick={() => setMode('paper')}
                className="flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                Paper
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {mode === 'paper' && (
          <PaperSelector
            papers={papers}
            selectedPaper={selectedPaper}
            onPaperSelect={setSelectedPaper}
          />
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && (
          <Alert variant="default" className="mb-4">
            <AlertDescription className="text-sm text-gray-600">
              {mode === 'paper' 
                ? "Select a paper and ask questions or use the analysis tools below!"
                : "Ask me anything! I'm here to help with your questions."}
            </AlertDescription>
          </Alert>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {mode === 'paper' && (
        <AnalysisTools
          onAnalyzeClick={handleAnalysis}
          isAnalyzing={isAnalyzing}
        />
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'paper' 
              ? "Ask about the selected paper..."
              : "Ask me anything..."
            }
            className="flex-1 p-2 border rounded-md"
            disabled={isLoading || isAnalyzing}
          />
          <Button 
            type="submit" 
            disabled={isLoading || isAnalyzing}
            size="sm"
            className="px-3"
          >
            {isLoading || isAnalyzing ? 
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