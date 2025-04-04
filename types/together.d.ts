declare module 'together' {
  const together: {
    init(options: { apiKey: string | undefined }): void;
    
    chat: {
      completions: {
        create(options: {
          model: string;
          messages: Array<{
            role: string;
            content: string;
          }>;
          temperature?: number;
          max_tokens?: number;
          top_p?: number;
          frequency_penalty?: number;
          presence_penalty?: number;
          stop?: string | string[];
        }): Promise<{
          choices: Array<{
            message: {
              content: string;
              role: string;
            };
            finish_reason: string;
            index: number;
          }>;
          created: number;
          id: string;
          model: string;
          object: string;
          usage: {
            completion_tokens: number;
            prompt_tokens: number;
            total_tokens: number;
          };
        }>;
      };
    };
  };
  
  export default together;
}