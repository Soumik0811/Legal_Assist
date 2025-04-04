import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateLegalAnalysis } from "./together-api";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
