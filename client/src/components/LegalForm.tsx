import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Mic, MicOff, AlertCircle, Upload, FileAudio } from 'lucide-react';

interface LegalFormProps {
  query: string;
  setQuery: (query: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

// Define SpeechRecognition globally since it's not in the TypeScript types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function LegalForm({ query, setQuery, loading, handleSubmit }: LegalFormProps) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionError, setRecognitionError] = useState('');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [language, setLanguage] = useState<'en-US' | 'hi-IN'>('en-US');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition on component mount
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      setSpeechSupported(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language; // Use the selected language

    // Handle results
    recognitionRef.current.onresult = async (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      // If Hindi is selected and we have transcript content, translate it to English
      if (language === 'hi-IN' && transcript.trim()) {
        try {
          setUploadingAudio(true); // Reuse the uploading state to show translation in progress
          
          // We'll use our OpenAI endpoint for translation
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: transcript,
              source_lang: 'hindi',
              target_lang: 'english'
            }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to translate text');
          }
          
          // Set the translated text
          setQuery(data.translated_text || transcript);
        } catch (error) {
          console.error('Translation error:', error);
          // If translation fails, still use the original transcript
          setQuery(transcript);
          setRecognitionError('Translation failed, using original text');
        } finally {
          setUploadingAudio(false);
        }
      } else {
        // For English, just use the transcript directly
        setQuery(transcript);
      }
    };

    // Handle errors
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setRecognitionError(event.error);
      setIsListening(false);
    };

    // Handle end of recognition
    recognitionRef.current.onend = () => {
      if (isListening) {
        // Restart recognition if it was still supposed to be listening
        recognitionRef.current.start();
      }
    };

    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, language]);

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Start listening and clear any previous errors
      setRecognitionError('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  
  // Handle file upload trigger
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('audio/')) {
      setAudioError('Please upload an audio file');
      return;
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setAudioError('File size must be less than 10MB');
      return;
    }
    
    try {
      setAudioError('');
      setUploadingAudio(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', file);
      
      // Add language parameter to formData
      formData.append('language', language === 'hi-IN' ? 'hi' : 'en');
      
      // Send to server
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to transcribe audio');
      }
      
      // Set the transcribed text in the query field
      setQuery(data.text || '');
      
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : 'Failed to transcribe audio');
      console.error('Audio transcription error:', error);
    } finally {
      setUploadingAudio(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 p-5 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="scenario" className="block text-sm font-medium text-gray-300">
            Describe Your Scenario
          </label>
          <div className="flex items-center space-x-3">
            {/* Language selector */}
            <div className="flex items-center mr-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en-US' | 'hi-IN')}
                className="bg-gray-700 text-white text-sm rounded-md border border-gray-600 px-2 py-1"
                title="Select voice input language"
                disabled={isListening || loading}
              >
                <option value="en-US">English</option>
                <option value="hi-IN">Hindi</option>
              </select>
            </div>
            
            {/* Audio file upload button */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={triggerFileUpload}
                disabled={loading || uploadingAudio}
                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                title="Upload audio file (OpenAI Whisper)"
              >
                {uploadingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileAudio className="h-5 w-5" />}
              </button>
              <span className="text-xs text-gray-400">Upload Audio</span>
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {/* Browser speech recognition button */}
            {speechSupported && (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={loading || uploadingAudio}
                  className={`p-2 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed mr-2`}
                  title={isListening ? 'Stop voice input' : `Start voice input (${language === 'hi-IN' ? 'Hindi' : 'English'})`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <span className="text-xs text-gray-400">{isListening ? 'Recording...' : 'Voice input'}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Error displays */}
        {recognitionError && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded-md flex items-center text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Speech recognition error: {recognitionError}</span>
          </div>
        )}
        
        {audioError && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded-md flex items-center text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Audio upload error: {audioError}</span>
          </div>
        )}
        
        <div className="relative">
          <textarea
            id="scenario"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="For example: 'Someone stole my phone from my pocket in a crowded market'"
            className={`w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 resize-none ${
              isListening ? 'border-blue-500 ring-2 ring-blue-500/30' : ''
            } ${uploadingAudio ? 'border-purple-500 ring-2 ring-purple-500/30' : ''}`}
          />
          <button
            type="submit"
            disabled={loading || uploadingAudio}
            className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          {isListening && (
            <div className="flex items-center">
              <div className="relative flex space-x-1">
                <div className="w-1 h-3 bg-blue-400 animate-pulse"></div>
                <div className="w-1 h-5 bg-blue-500 animate-pulse delay-100"></div>
                <div className="w-1 h-4 bg-blue-400 animate-pulse delay-200"></div>
                <div className="w-1 h-6 bg-blue-500 animate-pulse delay-300"></div>
                <div className="w-1 h-2 bg-blue-400 animate-pulse delay-400"></div>
              </div>
              <span className="ml-2 text-xs text-blue-400">
                Listening {language === 'hi-IN' ? 
                  <span className="text-amber-400">(Hindi → English translation)</span> :
                  "(English)"}...
              </span>
            </div>
          )}
          
          {uploadingAudio && (
            <div className="flex items-center">
              <div className="relative flex space-x-1">
                <div className="w-1 h-3 bg-purple-400 animate-pulse"></div>
                <div className="w-1 h-5 bg-purple-500 animate-pulse delay-100"></div>
                <div className="w-1 h-4 bg-purple-400 animate-pulse delay-200"></div>
                <div className="w-1 h-6 bg-purple-500 animate-pulse delay-300"></div>
                <div className="w-1 h-2 bg-purple-400 animate-pulse delay-400"></div>
              </div>
              <span className="ml-2 text-xs text-purple-400">
                {language === 'hi-IN' ? 
                  'Transcribing and translating (Hindi → English)...' : 
                  'Transcribing with OpenAI Whisper...'}
              </span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || uploadingAudio}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
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
