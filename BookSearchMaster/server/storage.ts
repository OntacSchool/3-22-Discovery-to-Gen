import { 
  users, 
  contents, 
  curricula,
  type User, 
  type InsertUser, 
  type Content, 
  type InsertContent,
  type UpdateContent,
  type Curriculum,
  type InsertCurriculum
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Content methods
  getContent(id: number): Promise<Content | undefined>;
  getAllContent(): Promise<Content[]>;
  getRecentContent(limit?: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<number>;
  updateContent(id: number, update: UpdateContent): Promise<void>;
  
  // Curriculum methods
  getCurriculum(id: number): Promise<Curriculum | undefined>;
  getAllCurricula(): Promise<Curriculum[]>;
  createCurriculum(curriculum: InsertCurriculum): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private curricula: Map<number, Curriculum>;
  private userCurrentId: number;
  private contentCurrentId: number;
  private curriculumCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.curricula = new Map();
    this.userCurrentId = 1;
    this.contentCurrentId = 1;
    this.curriculumCurrentId = 1;

    // Add a default curriculum
    const defaultCurriculum: Curriculum = {
      id: this.curriculumCurrentId++,
      title: "Web Development Fundamentals",
      description: "Learn the basics of web development with HTML, CSS, and JavaScript",
      difficulty: "Beginner",
      lessons: 10,
      quizzes: 5,
      exercises: 8,
      projects: 2,
      isRecommended: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.curricula.set(defaultCurriculum.id, defaultCurriculum);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async getAllContent(): Promise<Content[]> {
    return Array.from(this.contents.values());
  }
  
  async getRecentContent(limit: number = 5): Promise<Content[]> {
    const allContents = Array.from(this.contents.values());
    return allContents
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  async createContent(content: InsertContent): Promise<number> {
    const id = this.contentCurrentId++;
    
    // Convert string dates to Date objects if necessary
    const createdAt = typeof content.createdAt === 'string' 
      ? new Date(content.createdAt) 
      : content.createdAt;
      
    const updatedAt = content.updatedAt 
      ? (typeof content.updatedAt === 'string' ? new Date(content.updatedAt) : content.updatedAt)
      : null;
    
    const newContent: Content = { 
      ...content, 
      id,
      createdAt,
      updatedAt
    };
    
    this.contents.set(id, newContent);
    return id;
  }
  
  async updateContent(id: number, update: UpdateContent): Promise<void> {
    const content = this.contents.get(id);
    if (!content) {
      throw new Error(`Content with id ${id} not found`);
    }
    
    // Convert updatedAt from string to Date if needed
    if (update.updatedAt && typeof update.updatedAt === 'string') {
      update = {
        ...update,
        updatedAt: new Date(update.updatedAt)
      };
    }
    
    this.contents.set(id, { ...content, ...update });
  }
  
  // Curriculum methods
  async getCurriculum(id: number): Promise<Curriculum | undefined> {
    return this.curricula.get(id);
  }
  
  async getAllCurricula(): Promise<Curriculum[]> {
    return Array.from(this.curricula.values());
  }
  
  async createCurriculum(curriculum: InsertCurriculum): Promise<number> {
    const id = this.curriculumCurrentId++;
    
    // Ensure dates are Date objects
    const createdAt = typeof curriculum.createdAt === 'string'
      ? new Date(curriculum.createdAt)
      : curriculum.createdAt;
      
    const updatedAt = typeof curriculum.updatedAt === 'string'
      ? new Date(curriculum.updatedAt)
      : curriculum.updatedAt;
      
    // Ensure isRecommended is a boolean or null
    const isRecommended = curriculum.isRecommended === undefined 
      ? null 
      : curriculum.isRecommended;
      
    const newCurriculum: Curriculum = { 
      ...curriculum, 
      id,
      createdAt,
      updatedAt,
      isRecommended
    };
    
    this.curricula.set(id, newCurriculum);
    return id;
  }
}

export const storage = new MemStorage();
