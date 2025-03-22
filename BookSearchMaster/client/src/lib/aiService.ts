import { apiRequest } from './queryClient';

// Using Google's Gemini 1.5 Pro model
const DEFAULT_MODEL = 'gemini-1.5-pro';

export interface ContentGenerationParams {
  title: string;
  curriculumId: number;
  contentType: string;
  difficulty: string;
  duration: string;
  objectives: string;
  instructions: string;
  generationOptions: {
    model: string;
    style: string;
    format: string;
    includeCode: boolean;
    includeVisuals: boolean;
    includeChecks: boolean;
  };
}

export interface ContentModificationParams {
  contentId: number;
  modificationType: string;
  instructions: string;
}

export async function generateContent(params: ContentGenerationParams) {
  try {
    const response = await apiRequest('POST', '/api/content/generate', params);
    return await response.json();
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function modifyContent(params: ContentModificationParams) {
  try {
    const response = await apiRequest('POST', '/api/content/modify', params);
    return await response.json();
  } catch (error) {
    console.error('Error modifying content:', error);
    throw error;
  }
}

export async function discoverContent(query: string) {
  try {
    const response = await apiRequest('POST', '/api/discover', { query });
    return await response.json();
  } catch (error) {
    console.error('Error discovering content:', error);
    throw error;
  }
}