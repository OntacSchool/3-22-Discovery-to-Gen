import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = 'gpt-4o';

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
    });
  }

  async generateContent(params: any) {
    try {
      const generationType = params.contentType || 'lesson';
      const model = params.generationOptions?.model || DEFAULT_MODEL;

      // Create a system prompt based on content type and parameters
      const systemPrompt = this.createSystemPrompt(generationType, params);
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a ${params.contentType} on ${params.title} with the following details:
            - Difficulty: ${params.difficulty}
            - Duration: ${params.duration} minutes
            - Learning Objectives: ${params.objectives}
            - Additional Instructions: ${params.instructions}
            
            Generation Style: ${params.generationOptions?.style || 'comprehensive'}
            ${params.generationOptions?.includeCode ? 'Please include code examples.' : ''}
            ${params.generationOptions?.includeVisuals ? 'Please include visual element descriptions.' : ''}
            ${params.generationOptions?.includeChecks ? 'Please include knowledge check questions.' : ''}
          `}
        ],
        temperature: 0.7,
      });

      return {
        content: response.choices[0].message.content,
        model: model,
        contentType: generationType,
        title: params.title
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async modifyContent(content: string, modificationType: string, instructions: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: `You are an expert educational content editor. You'll be modifying existing content with a specific approach.
              Modification type: ${modificationType}.
              
              If refine: Improve quality, clarity, and accuracy without changing the scope.
              If expand: Add more details, examples, and depth.
              If simplify: Make the content clearer and easier to understand.
              If adapt: Adjust the content for a different audience or context.
              If duplicate: Create a variant with specified changes.
              If regenerate: Completely rewrite while maintaining the core topic.
              
              Maintain the original format and structure unless explicitly directed otherwise.`
          },
          { role: 'user', content: `Here is the content to modify:\n\n${content}\n\nModification instructions: ${instructions}` }
        ],
        temperature: 0.7,
      });

      return {
        modifiedContent: response.choices[0].message.content,
        originalContent: content,
        modificationType,
      };
    } catch (error) {
      console.error('OpenAI modification error:', error);
      throw new Error(`Failed to modify content: ${error.message}`);
    }
  }

  async analyzeContentQuery(query: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          { 
            role: 'system', 
            content: `You are an AI educational content discovery assistant. Analyze the user's query to understand their educational content needs.` 
          },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
      });

      return {
        analysis: response.choices[0].message.content,
        query,
      };
    } catch (error) {
      console.error('OpenAI query analysis error:', error);
      throw new Error(`Failed to analyze content query: ${error.message}`);
    }
  }

  private createSystemPrompt(contentType: string, params: any): string {
    const format = params.generationOptions?.format || 'markdown';
    
    let basePrompt = `You are an expert educational content creator specializing in creating high-quality ${contentType}s for learning platforms. `;
    
    switch (contentType) {
      case 'lesson':
        basePrompt += `Create a comprehensive lesson with clear explanations, examples, and structured sections. 
          Include an introduction, main content sections, summary, and further reading if appropriate.`;
        break;
      case 'quiz':
        basePrompt += `Create a quiz with diverse question types (multiple choice, true/false, fill in the blank) that effectively tests understanding of the topic.
          Include answers and explanations for each question.`;
        break;
      case 'exercise':
        basePrompt += `Create practical exercises that allow learners to apply the concepts they've learned.
          Include clear instructions, starter code if applicable, and solution guidelines.`;
        break;
      case 'project':
        basePrompt += `Design a project that integrates multiple concepts and requires learners to demonstrate comprehensive understanding.
          Include project requirements, evaluation criteria, and implementation guidelines.`;
        break;
    }
    
    basePrompt += `\nGenerate the content in ${format} format.`;
    
    return basePrompt;
  }
}

export const openaiService = new OpenAIService();
