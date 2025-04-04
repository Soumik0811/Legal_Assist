import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface LegalFormProps {
  query: string;
  setQuery: (query: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function LegalForm({ query, setQuery, loading, handleSubmit }: LegalFormProps) {
  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 p-5 shadow-md">
        <label htmlFor="scenario" className="block text-sm font-medium text-gray-300 mb-2">
          Describe Your Scenario
        </label>
        <div className="relative">
          <textarea
            id="scenario"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="For example: 'Someone stole my phone from my pocket in a crowded market'"
            className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Analyze Legal Implications</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
