import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// For Google Generative AI API, use the correct model name
const DEFAULT_MODEL = 'gemini-1.5-pro';

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateContent(params: any) {
    try {
      const generationType = params.contentType || 'lesson';
      const model = params.generationOptions?.model || DEFAULT_MODEL;

      // Create a system prompt based on content type and parameters
      const systemPrompt = this.createSystemPrompt(generationType, params);
      
      // Get the model
      const generativeModel = this.genAI.getGenerativeModel({ model });

      // Set safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Gemini doesn't have a system prompt concept, so we'll combine the system prompt with the user instructions
      const combinedPrompt = `${systemPrompt}\n\nGenerate a ${params.contentType} on ${params.title} with the following details:
        - Difficulty: ${params.difficulty}
        - Duration: ${params.duration} minutes
        - Learning Objectives: ${params.objectives}
        - Additional Instructions: ${params.instructions}
        
        Generation Style: ${params.generationOptions?.style || 'comprehensive'}
        ${params.generationOptions?.includeCode ? 'Please include code examples.' : ''}
        ${params.generationOptions?.includeVisuals ? 'Please include visual element descriptions.' : ''}
        ${params.generationOptions?.includeChecks ? 'Please include knowledge check questions.' : ''}`;

      // Generate content
      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
        safetySettings,
        generationConfig: {
          temperature: 0.7,
        },
      });

      const response = result.response;
      const content = response.text();

      return {
        content,
        model,
        contentType: generationType,
        title: params.title
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async modifyContent(content: string, modificationType: string, instructions: string) {
    try {
      const generativeModel = this.genAI.getGenerativeModel({ model: DEFAULT_MODEL });

      // Build prompt for content modification
      const modificationPrompt = `You are an expert educational content editor. You'll be modifying existing content with a specific approach.
        Modification type: ${modificationType}.
        
        If refine: Improve quality, clarity, and accuracy without changing the scope.
        If expand: Add more details, examples, and depth.
        If simplify: Make the content clearer and easier to understand.
        If adapt: Adjust the content for a different audience or context.
        If duplicate: Create a variant with specified changes.
        If regenerate: Completely rewrite while maintaining the core topic.
        
        Maintain the original format and structure unless explicitly directed otherwise.
        
        Here is the content to modify:
        
        ${content}
        
        Modification instructions: ${instructions}`;

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: modificationPrompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      });

      const response = result.response;
      const modifiedContent = response.text();

      return {
        modifiedContent,
        originalContent: content,
        modificationType,
      };
    } catch (error) {
      console.error('Gemini modification error:', error);
      throw new Error(`Failed to modify content: ${error.message}`);
    }
  }

  async analyzeContentQuery(query: string) {
    try {
      const generativeModel = this.genAI.getGenerativeModel({ model: DEFAULT_MODEL });

      const analysisPrompt = `You are an AI educational content discovery assistant. Analyze the following query to understand the educational content needs: ${query}`;

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
        generationConfig: {
          temperature: 0.3,
        },
      });

      const response = result.response;
      const analysis = response.text();

      return {
        analysis,
        query,
      };
    } catch (error) {
      console.error('Gemini query analysis error:', error);
      throw new Error(`Failed to analyze content query: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async processRAGQuery(query: string, documents: any[]) {
    try {
      const generativeModel = this.genAI.getGenerativeModel({ model: DEFAULT_MODEL });
      
      // Format retrieved documents into a context string
      const documentContext = documents.map((doc, index) => {
        return `Document ${index + 1} (${doc.title}, Similarity: ${(doc.similarity * 100).toFixed(1)}%):
        Type: ${doc.type}
        Snippet: ${doc.snippet}`;
      }).join('\n\n');
      
      // Create a prompt with the retrieved context
      const ragPrompt = `You are an AI educational content discovery assistant specialized in creating learning pathways and curricula.

      USER QUERY: ${query}
      
      RETRIEVED CONTEXT DOCUMENTS:
      ${documentContext}
      
      Based on the user query and the retrieved documents, perform the following:
      1. Analyze the user's intent and learning goals
      2. Extract relevant concepts and topics from the retrieved documents
      3. Formulate a structured curriculum that addresses the user's needs
      4. Include specific modules: lessons, quizzes, exercises, and projects
      
      Format your response as a JSON object with:
      1. An "analysis" field containing your understanding of user needs
      2. A "curriculumStructure" field with your recommendation
      3. A "thoughts" array containing 4 key stages of your reasoning process
      
      The thoughts should represent your step-by-step reasoning process starting with understanding the query and ending with finalizing the recommendation.`;

      // Generate RAG-enhanced response
      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: ragPrompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      });

      const response = result.response;
      const responseText = response.text();
      
      // Attempt to parse the response as JSON
      try {
        // Extract JSON from the response if it contains markdown code blocks
        let jsonStr = responseText;
        if (responseText.includes('```json')) {
          jsonStr = responseText.split('```json')[1].split('```')[0].trim();
        } else if (responseText.includes('```')) {
          jsonStr = responseText.split('```')[1].split('```')[0].trim();
        }
        
        const parsedResponse = JSON.parse(jsonStr);
        return parsedResponse;
      } catch (parseError) {
        // If JSON parsing fails, return a structured format manually
        console.error('Failed to parse JSON response:', parseError);
        
        // Extract thoughts using regex or splitting patterns
        const thoughts = [
          `Analyzing query intent: educational content discovery for "${query}"`,
          `Reviewing retrieved documents for relevant educational concepts and materials`,
          `Formulating structured curriculum based on user needs and available content`,
          `Finalizing recommended learning path with appropriate modules and assessments`
        ];
        
        return {
          analysis: responseText.substring(0, 200) + '...',
          curriculumStructure: {
            title: `Curriculum for ${query}`,
            description: 'Generated curriculum based on your query',
            modules: []
          },
          thoughts
        };
      }
    } catch (error) {
      console.error('Gemini RAG processing error:', error);
      throw new Error(`Failed to process RAG query: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createSystemPrompt(contentType: string, params: any): string {
    const format = params.generationOptions?.format || 'markdown';
    
    // Different detailed prompts for each content type with specific formatting instructions
    switch (contentType.toLowerCase()) {
      case 'lesson':
        return `You are an expert educational content creator specializing in creating high-quality lessons.
        
        Create a comprehensive and engaging lesson that helps learners understand the topic deeply. Include clear explanations, examples, and key points.
        
        Your lesson should follow this structure:
        1. Clear introduction that explains what the lesson will cover
        2. Main content sections with theoretical concepts explained simply
        3. Practical examples that demonstrate the concepts
        4. Summary of key points
        
        Format your response in ${format} with appropriate headings, lists, and code blocks if applicable.`;
      
      case 'quiz':
        return `You are an expert educational assessment designer specializing in creating effective multiple-choice quizzes.
        
        Create engaging multiple-choice questions that assess understanding of the topic. For each question:
        1. Write a clear question statement
        2. Provide exactly 4 options labeled A, B, C, and D
        3. Include a variety of question types (recall, application, analysis)
        4. Mark the correct answer for each question with [CORRECT] at the end of the option
        
        Format the output as follows:
        
        # [Quiz Title]
        
        ## Question 1
        [Question text]
        A. [Option A]
        B. [Option B]
        C. [Option C] [CORRECT]
        D. [Option D]
        
        ## Question 2
        ...and so on.
        
        Include 4-6 questions total.
        Format your response in ${format}.`;
      
      case 'exercise':
        return `You are an expert educational content creator specializing in creating programming exercises.
        
        Design coding problems that help learners apply concepts and develop programming skills. Your response should include:
        
        1. Problem description with clear requirements
        2. Skeleton code with subtasks commented in the code to guide the learner
        3. Sample solution code that shows the completed implementation
        
        For each exercise, follow this format:
        
        # [Exercise Title]
        
        ## Problem Description
        [Detailed description of the problem and what the learner needs to accomplish]
        
        ## Skeleton Code
        \`\`\`python
        # TODO: Implement [specific functionality]
        # This skeleton provides the structure for your solution
        # Subtask 1: [description]
        # Subtask 2: [description]
        # etc.
        
        # Sample starter code...
        \`\`\`
        
        ## Solution
        \`\`\`python
        # Complete solution implementation
        \`\`\`
        
        ## Test Cases
        [Examples of inputs and expected outputs to verify correctness]
        
        Create 2-3 exercises of varying difficulty.
        Format your response in ${format}.`;
        
      case 'project':
        return `You are an expert educational project designer specializing in creating data science projects in Jupyter notebook format.
        
        Design a comprehensive project that allows learners to apply multiple skills related to the topic. Your response should be structured as follows:
        
        # [Project Title]
        
        ## Project Overview
        [Brief description of the project and its learning goals]
        
        ## Dataset Description
        [Description of the dataset(s) to be used, including features, size, and source]
        
        ## Project Structure
        [Outline the major sections of the Jupyter notebook]
        
        ## Implementation Details
        
        ### Cell 1: Import Libraries
        \`\`\`python
        # Import necessary libraries
        import pandas as pd
        import numpy as np
        import matplotlib.pyplot as plt
        # Add other relevant libraries
        \`\`\`
        
        ### Cell 2: Data Loading
        \`\`\`python
        # Code for loading the dataset
        \`\`\`
        
        ### Cell 3: Exploratory Data Analysis
        \`\`\`python
        # Code for exploring and visualizing the data
        \`\`\`
        
        [Continue with additional cells for data preprocessing, modeling, evaluation, etc.]
        
        ## Project Deliverables
        [What the learner should submit upon completion]
        
        ## Evaluation Criteria
        [How the project will be assessed]
        
        Create the project as if it were an actual Jupyter notebook, with clear instructions in markdown cells and executable code in code cells.
        Format your response in ${format}.`;
        
      default:
        return `You are an expert educational content creator. Create high-quality educational content that helps learners understand and apply concepts effectively.
        
        Format your response in ${format} with appropriate sections, examples, and clear explanations.`;
    }
  }
}

export const geminiService = new GeminiService();