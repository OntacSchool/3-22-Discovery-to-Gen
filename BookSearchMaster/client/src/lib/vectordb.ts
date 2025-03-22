import { apiRequest } from './queryClient';

export interface VectorDocument {
  id: string;
  title: string;
  type: string;
  similarity: number;
  snippet: string;
}

export interface VectorSearchResult {
  documents: VectorDocument[];
  totalFound: number;
}

export async function searchVectorDatabase(query: string, limit: number = 10): Promise<VectorSearchResult> {
  try {
    const response = await apiRequest('POST', '/api/vectordb/search', { query, limit });
    return await response.json();
  } catch (error) {
    console.error('Error searching vector database:', error);
    throw error;
  }
}

export async function getVectorDatabaseStats() {
  try {
    const response = await apiRequest('GET', '/api/vectordb/stats', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error getting vector database stats:', error);
    throw error;
  }
}

export async function getVectorDatabaseStatus() {
  try {
    const response = await apiRequest('GET', '/api/vectordb/status', undefined);
    return await response.json();
  } catch (error) {
    console.error('Error getting vector database status:', error);
    throw error;
  }
}
