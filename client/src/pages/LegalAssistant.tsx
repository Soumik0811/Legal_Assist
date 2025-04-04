import React from 'react';
import Header from '@/components/Header';
import LegalForm from '@/components/LegalForm';
import LegalResponse from '@/components/LegalResponse';
import InitialState from '@/components/InitialState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

export default function LegalAssistant() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await apiRequest('POST', '/api/legal-assist', { query });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.response) {
        setResponse(data.response);
        setSubmitted(true);
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
          <h1 className="text-2xl font-bold text-center mb-8 text-blue-400">Legal Situation Analysis</h1>
          <p className="text-gray-300 mb-6 text-center">
            Describe a legal situation to get relevant Indian Penal Code sections and explanations.
          </p>
          
          <LegalForm 
            query={query} 
            setQuery={setQuery} 
            loading={loading} 
            handleSubmit={handleSubmit} 
          />
          
          {error && <ErrorDisplay error={error} />}
          
          {response ? (
            <LegalResponse response={response} />
          ) : !loading && !error && !submitted ? (
            <InitialState />
          ) : null}
        </div>
      </div>
    </div>
  );
}