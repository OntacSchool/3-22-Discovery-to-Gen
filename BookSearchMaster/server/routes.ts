import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { vectordbService } from "./api/vectordb";
import { geminiService } from "./api/gemini";

// Create validation schemas
const discoverySchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters")
});

const generateContentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  curriculumId: z.number(),
  contentType: z.string(),
  difficulty: z.string(),
  duration: z.string(),
  objectives: z.string(),
  instructions: z.string(),
  generationOptions: z.object({
    model: z.string().optional(),
    style: z.string().optional(),
    format: z.string().optional(),
    includeCode: z.boolean().optional(),
    includeVisuals: z.boolean().optional(),
    includeChecks: z.boolean().optional(),
  }).optional()
});

const modifyContentSchema = z.object({
  contentId: z.number(),
  modificationType: z.string(),
  instructions: z.string()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Discovery endpoint
  app.post("/api/discover", async (req, res) => {
    try {
      const { query } = discoverySchema.parse(req.body);
      
      // Step 1: Search the vector database for relevant documents
      const { documents } = await vectordbService.search(query);
      
      // Step 2: Process the query and documents through the RAG pipeline
      if (documents.length > 0) {
        try {
          // Use Gemini to process the query and retrieved documents
          const ragResult = await geminiService.processRAGQuery(query, documents);
          
          // Return the RAG-enhanced results
          res.json({
            documents,
            thoughts: ragResult.thoughts || [],
            analysis: ragResult.analysis,
            curriculumStructure: ragResult.curriculumStructure,
            query
          });
        } catch (ragError) {
          console.error("Error in RAG processing:", ragError);
          
          // Fallback to basic retrieval if RAG processing fails
          const thoughts = [
            `Analyzing query intent: educational content discovery for "${query}"`,
            `Performing vector similarity search across educational content database`,
            `Generating curriculum options based on retrieved content and user learning objectives`,
            `Finalizing curriculum structure with appropriate learning materials, exercises, and assessments`
          ];
          
          res.json({
            documents,
            thoughts,
            query
          });
        }
      } else {
        // No documents found
        res.json({
          documents: [],
          thoughts: [`No relevant educational content found for query: "${query}"`],
          query
        });
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Vector database search endpoint
  app.post("/api/vectordb/search", async (req, res) => {
    try {
      const { query, limit } = req.body;
      const results = await vectordbService.search(query, limit);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Vector database status
  app.get("/api/vectordb/status", async (req, res) => {
    try {
      const status = await vectordbService.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Vector database stats
  app.get("/api/vectordb/stats", async (req, res) => {
    try {
      const stats = await vectordbService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Content generation endpoint
  app.post("/api/content/generate", async (req, res) => {
    try {
      const params = generateContentSchema.parse(req.body);
      const content = await geminiService.generateContent(params);
      
      // Store the generated content in our database
      const contentId = await storage.createContent({
        title: params.title,
        contentType: params.contentType,
        content: content.content,
        curriculumId: params.curriculumId,
        createdAt: new Date()
      });
      
      res.json({
        id: contentId,
        ...content
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Content modification endpoint
  app.post("/api/content/modify", async (req, res) => {
    try {
      const { contentId, modificationType, instructions } = modifyContentSchema.parse(req.body);
      
      // Retrieve the original content
      const originalContent = await storage.getContent(contentId);
      
      if (!originalContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Modify the content using Gemini
      const modifiedContent = await geminiService.modifyContent(
        originalContent.content, 
        modificationType, 
        instructions
      );
      
      // Update the content in the database
      await storage.updateContent(contentId, {
        content: modifiedContent.modifiedContent,
        updatedAt: new Date()
      });
      
      res.json({
        id: contentId,
        ...modifiedContent
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Get list of content
  app.get("/api/content/list", async (req, res) => {
    try {
      const contents = await storage.getAllContent();
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get recent content generations (moved before content/:id to avoid route conflicts)
  app.get("/api/content/recent", async (req, res) => {
    try {
      const contents = await storage.getRecentContent();
      
      if (contents.length === 0) {
        return res.json([]); // Return empty array instead of 404
      }
      
      // Transform for the frontend
      const transformedContents = contents.map(c => ({
        id: c.id,
        title: c.title,
        type: c.contentType,
        timeAgo: getTimeAgo(c.createdAt)
      }));
      
      res.json(transformedContents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get specific content (moved after more specific routes to avoid conflicts)
  app.get("/api/content/:id", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to format time ago
function getTimeAgo(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInHours < 48) return 'Yesterday';
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  
  return dateObj.toLocaleDateString();
}
