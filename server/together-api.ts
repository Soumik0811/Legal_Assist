// Use the fetch API to make direct API calls to Together AI
// This is a simpler approach than using a custom library

/**
 * Generate a legal analysis for a given scenario using Together AI
 * @param query The legal scenario to analyze
 * @returns A response with IPC sections and explanations
 */
export async function generateLegalAnalysis(query: string): Promise<string> {
  try {
    // Create a prompt for legal analysis
    const systemMessage = 'You are a legal assistant specializing in Indian Penal Code (IPC). Provide relevant IPC sections and brief explanations for given scenarios.';
    
    const userPrompt = `
Analyze the following scenario and provide:

1. Applicable IPC Sections with their titles and brief descriptions
2. A detailed explanation of how these sections apply to the scenario
3. Potential legal consequences including punishments

Scenario: ${query}

Format your response clearly with headers for each section.
`;

    // Prepare the request body for Together AI API
    const requestBody = {
      model: 'meta-llama/Llama-3-70b-chat-hf', // Using Llama 3 70B model
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    };

    // Make API request to Together AI
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Together API responded with status ${response.status}: ${errorData}`);
    }

    // Parse the response
    const responseData = await response.json();
    
    // Extract and return the generated content
    if (responseData.choices && responseData.choices.length > 0 && 
        responseData.choices[0].message && responseData.choices[0].message.content) {
      return responseData.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from Together API');
    }
  } catch (error) {
    console.error('Error calling Together API:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error calling Together API');
  }
}

/**
 * Alternative function using Qwen model
 * Uncomment and use this if Llama model has issues
 */
export async function generateLegalAnalysisQwen(query: string): Promise<string> {
  try {
    // Create a prompt for legal analysis
    const systemMessage = 'You are a legal assistant specializing in Indian Penal Code (IPC). Provide relevant IPC sections and brief explanations for given scenarios.';
    
    const userPrompt = `
Analyze the following scenario and provide:

1. Applicable IPC Sections with their titles and brief descriptions
2. A detailed explanation of how these sections apply to the scenario
3. Potential legal consequences including punishments

Scenario: ${query}

Format your response clearly with headers for each section.
`;

    // Prepare the request body for Together AI API
    const requestBody = {
      model: 'Qwen/Qwen1.5-72B-Chat', // Using Qwen 72B model
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    };

    // Make API request to Together AI
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Together API responded with status ${response.status}: ${errorData}`);
    }

    // Parse the response
    const responseData = await response.json();
    
    // Extract and return the generated content
    if (responseData.choices && responseData.choices.length > 0 && 
        responseData.choices[0].message && responseData.choices[0].message.content) {
      return responseData.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from Together API');
    }
  } catch (error) {
    console.error('Error calling Together API with Qwen:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error calling Together API with Qwen');
  }
}