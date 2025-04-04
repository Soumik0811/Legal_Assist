import React from 'react';
import { Scale } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="flex items-center justify-center mb-4">
        <div className="p-3 bg-blue-600 bg-opacity-20 rounded-full">
          <Scale className="h-12 w-12 text-blue-400" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 section-heading text-white">
        Indian Penal Code Assistant
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto">
        Describe your scenario to get relevant IPC sections, explanations, and potential legal consequences
      </p>
    </header>
  );
}
