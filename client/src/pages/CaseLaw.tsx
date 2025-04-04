import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Loader2, Search, ExternalLink } from 'lucide-react';

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
  const [results, setResults] = useState<IndianKanoonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Handle search with Indian Kanoon API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setSubmitted(true);

    try {
      const res = await fetch(`/api/indian-kanoon?query=${encodeURIComponent(query)}`);
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
          : 'An error occurred while fetching data from Indian Kanoon.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Header />
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4 text-purple-400">Case Law Search</h1>
          <p className="text-gray-300 mb-6 text-center">
            Search for real case laws from the Indian Kanoon database
          </p>
          
          {/* Search form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search case laws..."
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
          
          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-purple-400" />
              <p className="mt-4 text-gray-400">Searching...</p>
            </div>
          )}
          
          {/* Error display */}
          {error && <ErrorDisplay error={error} />}
          
          {/* Results table */}
          {results.length > 0 && !loading ? (
            <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700 shadow-xl">
              <h2 className="text-xl font-semibold text-white p-4 border-b border-gray-700">Search Results</h2>
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Title</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Publish Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Source</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Headline</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800/30"}>
                      <td className="py-3 px-4 text-sm text-gray-200">{result.title || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-200">{result.publishdate || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-200">{result.docsource || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-200">{result.headline || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">
                        <a 
                          href={`https://indiankanoon.org/doc/${result.tid}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center text-purple-400 hover:text-purple-300"
                        >
                          <span className="mr-1">View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : submitted && !loading ? (
            <div className="text-center py-8 text-gray-400">
              <p>No case laws found matching your query. Try different search terms.</p>
            </div>
          ) : !loading && !submitted ? (
            <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
              <Search className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">Enter search terms to find real case laws from Indian Kanoon.</p>
              <p className="text-sm text-gray-500 mt-2">
                Example: "murder section 302" or "property rights"
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}