import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function GeneralChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('POST', '/api/general-chat', { query: input });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.response) {
        const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError('Received empty response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred while processing your request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Header />
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8 text-green-400">General Chatbot</h1>
          <p className="text-gray-300 mb-6 text-center">
            Ask me any general questions and I'll provide helpful answers.
          </p>
          
          {/* Chat messages container */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 mb-4 min-h-[300px] max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {error && <ErrorDisplay error={error} />}
          
          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[100px] bg-gray-700 border-gray-600 focus:border-green-400 text-white"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="self-end bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}