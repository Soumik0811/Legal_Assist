import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateLegalAnalysis } from "./together-api";
import axios from "axios";
import OpenAI from "openai";
import multer from "multer";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Set up multer for file uploads
  const upload = multer({
    dest: 'uploads/', 
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
  });

  // Audio transcription endpoint using OpenAI Whisper
  app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key is not configured' });
      }

      // Check if language parameter was provided
      const language = req.body.language || 'en';
      console.log(`Processing audio file: ${req.file.path}, language: ${language}`);

      try {
        // Use OpenAI's Whisper model for transcription
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(req.file.path),
          model: "whisper-1",
          language: language, // Use the specified language
          response_format: "text"
        });

        // Clean up the temporary file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });

        let finalText = transcription;

        // If language is Hindi, translate it to English
        if (language === 'hi') {
          try {
            const translationResponse = await openai.chat.completions.create({
              model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
              messages: [
                {
                  role: "system",
                  content: "You are a highly skilled Hindi to English translator. Translate the given Hindi text to English."
                },
                {
                  role: "user",
                  content: `Translate this Hindi text to English: ${transcription}`
                }
              ],
              temperature: 0.2,
              max_tokens: 500
            });

            // Extract the translated text
            finalText = translationResponse.choices[0].message.content ?? '';
            console.log(`Translated text from Hindi to English: ${finalText.substring(0, 100)}...`);
          } catch (translationError) {
            console.error('Translation error:', translationError);
            // Still return the original transcription if translation fails
          }
        }

        // Return the transcription or translation
        res.json({ text: finalText });
      } catch (apiError) {
        console.error('OpenAI transcription error:', apiError);
        return res.status(500).json({ 
          error: apiError instanceof Error 
            ? apiError.message 
            : 'Error transcribing audio with OpenAI Whisper' 
        });
      }
    } catch (error) {
      console.error('Error in transcription API:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
      
      // Clean up on error
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
    }
  });
  
  // Text translation endpoint using OpenAI
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, source_lang, target_lang } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key is not configured' });
      }
      
      console.log(`Translating text from ${source_lang} to ${target_lang}`);
      
      try {
        // Use OpenAI's GPT-4 model for translation
        const translationResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: `You are a highly skilled ${source_lang} to ${target_lang} translator. Translate the given text accurately.`
            },
            {
              role: "user",
              content: `Translate this ${source_lang} text to ${target_lang}: ${text}`
            }
          ],
          temperature: 0.2,
          max_tokens: 500
        });
        
        // Extract the translated text
        const translatedText = translationResponse.choices[0].message.content;
        
        res.json({ translated_text: translatedText });
      } catch (apiError) {
        console.error('OpenAI translation error:', apiError);
        return res.status(500).json({ 
          error: apiError instanceof Error 
            ? apiError.message 
            : 'Error translating text with OpenAI' 
        });
      }
    } catch (error) {
      console.error('Error in translation API:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  });
  // Set up API route for legal assistant
  app.post('/api/legal-assist', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      // Check for Together API key
      if (!process.env.TOGETHER_API_KEY) {
        return res.status(500).json({ error: 'Missing Together API key' });
      }
      
      // Generate legal analysis using Together API
      try {
        const response = await generateLegalAnalysis(query);
        res.json({ response });
      } catch (apiError) {
        console.error('Error calling Together API:', apiError);
        return res.status(500).json({ 
          error: apiError instanceof Error 
            ? apiError.message 
            : 'Error processing your request with the AI model'
        });
      }
    } catch (error) {
      console.error('Error in legal-assist API:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  });

  // General Chat API endpoint
  app.post("/api/general-chat", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      // Check for Together API key
      if (!process.env.TOGETHER_API_KEY) {
        return res.status(500).json({ error: 'Missing Together API key' });
      }
      
      // Use the Together API with a more structured prompt for the chatbot
      try {
        // Create a system message and prompt for better formatting
        const systemMessage = 'You are a helpful assistant specializing in legal information. Answer questions clearly and concisely with proper formatting and structure. Remember that you\'re not providing legal advice - just general information. When discussing legal concepts, be accurate and explain them in simple terms.';
        
        const userPrompt = `
Answer the following question with detailed information and proper structure.

Question: ${query}

Ensure your response follows this format with proper markdown formatting:

## Answer
Provide a comprehensive answer to the question with clear explanations.

## Key Points
- **Point 1**: Important information relating to the question
- **Point 2**: Additional relevant information
- (Add more points as needed)

## Additional Information
Any supplementary details or context that might be helpful.

Important formatting instructions:
1. Use markdown headings with ## for main sections
2. Use bold (**) for emphasizing key terms
3. Use bullet points (-) for listing information
4. Use proper paragraph spacing between sections
`;

        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3-70b-chat-hf",
            messages: [
              {
                role: "system",
                content: systemMessage
              },
              {
                role: "user",
                content: userPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1200
          }),
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
          const assistantResponse = data.choices[0].message.content;
          res.json({ response: assistantResponse });
        } else {
          throw new Error("Invalid response from API");
        }
      } catch (apiError) {
        console.error('Error calling Together API for general chat:', apiError);
        return res.status(500).json({ 
          error: apiError instanceof Error 
            ? apiError.message 
            : 'Error processing your request with the AI model'
        });
      }
    } catch (error) {
      console.error('Error in general-chat API:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  });

  // Case Law Search API endpoint
  app.post("/api/case-law", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      // Check for Together API key
      if (!process.env.TOGETHER_API_KEY) {
        return res.status(500).json({ error: 'Missing Together API key' });
      }
      
      // Use the Together API with a prompt designed for case law search
      try {
        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3-70b-chat-hf",
            messages: [
              {
                role: "system",
                content: "You are a legal research assistant specialized in Indian case law. For the user's query, provide 3-5 relevant case law examples that address their issue. Format your response as a JSON array of case objects, each with title, citation, summary, and relevance fields. Make the summaries concise, focusing on the legal principles established."
              },
              {
                role: "user",
                content: `Find relevant Indian case laws related to: ${query}`
              }
            ],
            temperature: 0.3,
            max_tokens: 1500
          }),
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
          const assistantResponse = data.choices[0].message.content;
          
          // Try to parse the response as JSON
          try {
            // Extract JSON array from text - the model might wrap the JSON in markdown code blocks
            const jsonMatch = assistantResponse.match(/\[[\s\S]*?\]/);
            const resultsJson = jsonMatch ? jsonMatch[0] : assistantResponse;
            const results = JSON.parse(resultsJson);
            
            res.json({ results });
          } catch (parseError) {
            console.error("Error parsing case law results:", parseError);
            
            // Fallback approach: Since the model might not always return perfect JSON,
            // we'll do a simple text-based extraction of cases
            const caseSections = assistantResponse.split(/Case \d+:|^\d+\./m).filter((s: string) => s.trim());
            
            const results = caseSections.map((section: string) => {
              // Extract basic case details through text patterns
              const titleMatch = section.match(/Title:\s*([^\n]+)/i) || section.match(/([^,]+),/);
              const citationMatch = section.match(/Citation:\s*([^\n]+)/i) || section.match(/\(([^)]+)\)/);
              const summaryMatch = section.match(/Summary:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i);
              const relevanceMatch = section.match(/Relevance:\s*([^\n]+(?:\n(?!\w+:)[^\n]+)*)/i);
              
              return {
                title: (titleMatch ? titleMatch[1] : "Unknown Case").trim(),
                citation: (citationMatch ? citationMatch[1] : "No citation available").trim(),
                summary: (summaryMatch ? summaryMatch[1] : section).trim(),
                relevance: (relevanceMatch ? relevanceMatch[1] : "Relevant to the query").trim()
              };
            });
            
            res.json({ results });
          }
        } else {
          throw new Error("Invalid response from API");
        }
      } catch (apiError) {
        console.error('Error calling Together API for case law search:', apiError);
        return res.status(500).json({ 
          error: apiError instanceof Error 
            ? apiError.message 
            : 'Error processing your request with the AI model'
        });
      }
    } catch (error) {
      console.error('Error in case-law API:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  });

  // Indian Kanoon API endpoint for real case law data
  app.get("/api/indian-kanoon", async (req, res) => {
    try {
      const query = req.query.query as string;
      
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      // Indian Kanoon API token
      const API_TOKEN = "afa652f1395763d62d114430ddecb198bf7199c6";
      const HEADERS = { "Authorization": `Token ${API_TOKEN}` };
      
      try {
        // Fetch data from the Indian Kanoon API
        const response = await axios.post(
          `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`,
          null, // no data in request body
          { headers: HEADERS }
        );
        
        // Extract relevant information from the API response
        const data = response.data;
        const results = [];
        
        for (const doc of data.docs || []) {
          results.push({
            title: doc.title || 'N/A',
            headline: doc.headline || 'N/A',
            publishdate: doc.publishdate || 'N/A',
            docsource: doc.docsource || 'N/A',
            tid: doc.tid || 'N/A'
          });
        }
        
        res.json({ results });
      } catch (apiError) {
        console.error('Error calling Indian Kanoon API:', apiError);
        return res.status(500).json({ 
          error: apiError instanceof Error 
            ? apiError.message 
            : 'Error fetching case law data from Indian Kanoon'
        });
      }
    } catch (error) {
      console.error('Error in indian-kanoon API:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
