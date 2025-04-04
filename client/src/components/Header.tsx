import React from 'react';
import { Scale, Home } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function Header() {
  const [location] = useLocation();
  
  return (
    <header className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-600 bg-opacity-20 rounded-full">
            <Scale className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="ml-3 text-xl font-semibold text-white">Legal AI Assistant</h2>
        </div>
        
        <nav>
          <ul className="flex space-x-1 sm:space-x-4">
            <li>
              <Link href="/">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === '/' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}>
                  <Home className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Home</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/legal-assistant">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === '/legal-assistant' 
                    ? 'bg-blue-900/50 text-blue-300' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}>
                  Legal Assistant
                </a>
              </Link>
            </li>
            <li>
              <Link href="/general-chat">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === '/general-chat' 
                    ? 'bg-green-900/50 text-green-300' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}>
                  General Chat
                </a>
              </Link>
            </li>
            <li>
              <Link href="/case-law">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === '/case-law' 
                    ? 'bg-purple-900/50 text-purple-300' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}>
                  Case Law
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {location !== '/' && (
        <div className="text-center">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${
            location === '/legal-assistant' 
              ? 'text-blue-400' 
              : location === '/general-chat'
                ? 'text-green-400'
                : 'text-purple-400'
          }`}>
            {location === '/legal-assistant' 
              ? 'Legal Situation Analysis' 
              : location === '/general-chat'
                ? 'General Chat'
                : 'Case Law Search'
            }
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {location === '/legal-assistant' 
              ? 'Describe your scenario to get relevant IPC sections, explanations, and potential legal consequences' 
              : location === '/general-chat'
                ? 'Ask any general questions about law, procedures, or legal concepts'
                : 'Search for relevant case laws and precedents for specific legal issues'
            }
          </p>
        </div>
      )}
    </header>
  );
}
