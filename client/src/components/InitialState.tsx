import React from 'react';

export default function InitialState() {
  return (
    <div className="rounded-lg bg-gray-800 bg-opacity-30 border border-gray-700 p-8 text-center">
      <div className="text-5xl mb-5">⚖️</div>
      <h2 className="text-xl font-semibold text-white mb-2 section-heading">How can I assist you?</h2>
      <p className="text-gray-400 max-w-md mx-auto">
        Describe a legal scenario above, and I'll help identify the relevant IPC sections and potential consequences.
      </p>
    </div>
  );
}
