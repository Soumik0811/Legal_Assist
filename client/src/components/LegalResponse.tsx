import React from 'react';
import { marked } from 'marked';

interface LegalResponseProps {
  response: string;
}

export default function LegalResponse({ response }: LegalResponseProps) {
  // Configure marked options for custom rendering
  marked.setOptions({
    gfm: true, // GitHub flavored markdown
    breaks: true, // Convert line breaks to <br>
    headerIds: false, // Don't generate IDs for headers
  });
  
  // Custom styles for markdown elements
  const customStyles = `
    <style>
      .markdown-content h2 {
        color: #60a5fa; /* blue-400 */
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #4b5563; /* gray-600 */
        padding-bottom: 0.5rem;
      }
      
      .markdown-content p {
        margin-bottom: 1rem;
        line-height: 1.6;
      }
      
      .markdown-content ul {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
      }
      
      .markdown-content li {
        margin-bottom: 0.5rem;
      }
      
      .markdown-content strong {
        color: #f9fafb; /* gray-50 */
        font-weight: 600;
      }
    </style>
  `;
  
  // Convert markdown to HTML
  const htmlContent = marked.parse(response);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4 section-heading">Legal Analysis</h2>
      <div 
        className="space-y-2 text-gray-300 markdown-content"
        dangerouslySetInnerHTML={{ __html: customStyles + htmlContent }}
      />
    </div>
  );
}
