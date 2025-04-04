import React from 'react';

interface LegalResponseProps {
  response: string;
}

export default function LegalResponse({ response }: LegalResponseProps) {
  // Function to format the response with proper line breaks and styling
  const formatResponse = (text: string) => {
    // Process sections and highlight them
    let processedText = text.replace(/Section (\d+[A-Z]?)(\s*-\s*[^<]+)/g, 
      '<div class="pl-4 border-l-2 border-blue-500 mb-4"><p class="font-medium text-white mb-1">Section $1$2</p>');
    
    // Add headers for common sections in the response
    processedText = processedText.replace(/Applicable IPC Sections/g, 
      '<h3 class="text-lg font-semibold text-blue-400 mb-2">Applicable IPC Sections</h3>');
    
    processedText = processedText.replace(/Explanation:/g, 
      '</div><h3 class="text-lg font-semibold text-blue-400 mb-2">Explanation</h3>');
    
    processedText = processedText.replace(/Potential Legal Consequences:/g, 
      '<h3 class="text-lg font-semibold text-blue-400 mb-2">Potential Legal Consequences</h3>');
    
    // Format lists
    processedText = processedText.replace(/(\d+\.\s[^\n]+)/g, '<li>$1</li>');
    
    // Replace newlines with proper HTML
    processedText = processedText.replace(/\n\n/g, '</p><p class="mb-3">');
    processedText = processedText.replace(/\n/g, '<br>');
    
    return processedText;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4 section-heading">Legal Analysis</h2>
      <div 
        className="space-y-6 text-gray-300"
        dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
      />
    </div>
  );
}
