import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Loader2, Search, Filter, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Generated case law interface (from LLM)
interface CaseResult {
  title: string;
  citation: string;
  summary: string;
  relevance: string;
}

// Indian Kanoon API result interface
interface IndianKanoonResult {
  title: string;
  headline: string;
  publishdate: string;
  docsource: string;
  tid: string;
}

export default function CaseLaw() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CaseResult[]>([]);
  const [kanoonResults, setKanoonResults] = useState<IndianKanoonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [kanoonLoading, setKanoonLoading] = useState(false);
  const [error, setError] = useState('');
  const [kanoonError, setKanoonError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  // Handle search with AI-generated case law
  const handleAISearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

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

  // Handle search with Indian Kanoon API
  const handleKanoonSearch = async () => {
    if (!query.trim()) return;

    setKanoonLoading(true);
    setKanoonError('');
    setKanoonResults([]);

    try {
      const res = await fetch(`/api/indian-kanoon?query=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.error) {
        setKanoonError(data.error);
      } else if (data.results) {
        setKanoonResults(data.results);
      } else {
        setKanoonError('Received empty response from server');
      }
    } catch (error) {
      console.error('Error:', error);
      setKanoonError(
        error instanceof Error
          ? error.message
          : 'An error occurred while fetching data from Indian Kanoon.'
      );
    } finally {
      setKanoonLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSubmitted(true);
    
    if (activeTab === 'ai') {
      await handleAISearch();
    } else {
      await handleKanoonSearch();
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
          
          {/* Tabs for data source selection */}
          <Tabs 
            defaultValue="ai" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mb-6"
          >
            <TabsList className="grid grid-cols-2 mb-4 bg-gray-800">
              <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600">
                AI-Generated
              </TabsTrigger>
              <TabsTrigger value="kanoon" className="data-[state=active]:bg-purple-600">
                Indian Kanoon API
              </TabsTrigger>
            </TabsList>

            <div className="mb-2 text-xs text-gray-400">
              {activeTab === 'ai' ? 
                'Search for AI-generated case law analysis with summaries and relevance explanations' : 
                'Search authentic Indian case laws from the Indian Kanoon database'
              }
            </div>
          </Tabs>

          {/* Search form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search for ${activeTab === 'ai' ? 'case law topics' : 'real case laws'}...`}
                className="flex-1 bg-gray-700 border-gray-600 text-white"
                disabled={loading || kanoonLoading}
              />
              <Button 
                type="submit" 
                disabled={(activeTab === 'ai' ? loading : kanoonLoading) || !query.trim()} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                {(activeTab === 'ai' ? loading : kanoonLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </form>
          
          {/* Content for each tab */}
          <TabsContent value="ai" className="mt-0">
            {error && <ErrorDisplay error={error} />}
            
            {/* AI Results */}
            {results.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">AI-Generated Case Law Results</h2>
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
            ) : submitted && !loading && activeTab === 'ai' ? (
              <div className="text-center py-8 text-gray-400">
                <p>No case laws found matching your query. Try different search terms.</p>
              </div>
            ) : !loading && !submitted ? (
              <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
                <Search className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Enter search terms to find AI-analyzed case laws.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Example: "murder evidence requirements" or "property possession rights"
                </p>
              </div>
            ) : null}
          </TabsContent>
          
          <TabsContent value="kanoon" className="mt-0">
            {kanoonError && <ErrorDisplay error={kanoonError} />}
            
            {/* Indian Kanoon Results */}
            {kanoonResults.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Indian Kanoon Results</h2>
                <div className="space-y-6">
                  {kanoonResults.map((result, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                      <h3 className="text-lg font-semibold text-purple-300 mb-2">{result.title}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-purple-400">{result.docsource}</span>
                        <span className="text-xs text-gray-400">{result.publishdate}</span>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Headline</h4>
                        <p className="text-gray-300">{result.headline}</p>
                      </div>
                      <div className="mt-4 text-right">
                        <a 
                          href={`https://indiankanoon.org/doc/${result.tid}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center"
                        >
                          View on Indian Kanoon
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : submitted && !kanoonLoading && activeTab === 'kanoon' ? (
              <div className="text-center py-8 text-gray-400">
                <p>No case laws found in Indian Kanoon matching your query. Try different search terms.</p>
              </div>
            ) : !kanoonLoading && !submitted ? (
              <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
                <Search className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Enter search terms to find real case laws from Indian Kanoon.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Example: "murder section 302" or "property rights"
                </p>
              </div>
            ) : null}
          </TabsContent>
        </div>
      </div>
    </div>
  );
}