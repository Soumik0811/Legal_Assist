import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Loader2, Search } from 'lucide-react';

interface CaseResult {
  title: string;
  citation: string;
  summary: string;
  relevance: string;
}

export default function CaseLaw() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CaseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setSubmitted(true);

    try {
      const res = await apiRequest('POST', '/api/case-law', { query });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.results) {
        setResults(data.results);
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
          <h1 className="text-2xl font-bold text-center mb-8 text-purple-400">Case Law Search</h1>
          <p className="text-gray-300 mb-6 text-center">
            Search for relevant case laws by topic, citation, or legal issue.
          </p>
          
          {/* Search form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for case laws..."
                className="flex-1 bg-gray-700 border-gray-600 text-white"
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !query.trim()} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </form>
          
          {error && <ErrorDisplay error={error} />}
          
          {/* Results */}
          {results.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Search Results</h2>
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">{result.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{result.citation}</p>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Summary</h4>
                      <p className="text-gray-300">{result.summary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Relevance</h4>
                      <p className="text-gray-300">{result.relevance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : submitted && !loading ? (
            <div className="text-center py-8 text-gray-400">
              <p>No case laws found matching your query. Try different search terms.</p>
            </div>
          ) : !loading && !submitted ? (
            <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
              <Search className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">Enter search terms to find relevant case laws.</p>
              <p className="text-sm text-gray-500 mt-2">
                Example: "murder evidence requirements" or "property possession rights"
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}