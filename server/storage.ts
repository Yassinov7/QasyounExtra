import { 
  users, User, InsertUser, 
  categories, Category, InsertCategory,
  courses, Course, InsertCourse,
  materials, Material, InsertMaterial,
  enrollments, Enrollment, InsertEnrollment,
  reviews, Review, InsertReview,
  messages, Message, InsertMessage
} from "@shared/schema";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm/expressions";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTeachers(): Promise<User[]>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourseById(id: number): Promise<Course | undefined>;
  getCoursesByCategory(categoryId: number): Promise<Course[]>;
  getCoursesByTeacher(teacherId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Material operations
  getMaterialsByCourse(courseId: number): Promise<Material[]>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  // Enrollment operations
  getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  
  // Review operations
  getReviewsByCourse(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Message operations
  getMessagesByUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private courses: Map<number, Course>;
  private materials: Map<number, Material>;
  private enrollments: Map<number, Enrollment>;
  private reviews: Map<number, Review>;
  private messages: Map<number, Message>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentCourseId: number;
  private currentMaterialId: number;
  private currentEnrollmentId: number;
  private currentReviewId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.courses = new Map();
    this.materials = new Map();
    this.enrollments = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentCourseId = 1;
    this.currentMaterialId = 1;
    this.currentEnrollmentId = 1;
    this.currentReviewId = 1;
    this.currentMessageId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Add default admin user
    this.createUser({
      username: "admin",
      email: "admin@qasyounextra.com",
      password: "adminpassword",
      role: "admin",
      fullName: "مدير النظام",
      profilePicture: "",
      bio: "مدير منصة قاسيون إكسترا",
      experience: ""
    });
    
    // Add sample categories
    const categories = [
      { name: "الرياضيات", description: "دروس في الرياضيات", icon: "calculator", color: "#5E17EB" },
      { name: "العلوم", description: "دروس في العلوم", icon: "flask", color: "#FF8A00" },
      { name: "اللغة العربية", description: "دروس في اللغة العربية", icon: "language", color: "#8C52FF" },
      { name: "اللغة الإنجليزية", description: "دروس في اللغة الإنجليزية", icon: "globe", color: "#4CAF50" },
      { name: "التاريخ", description: "دروس في التاريخ", icon: "landmark", color: "#FFC107" },
      { name: "الفيزياء", description: "دروس في الفيزياء", icon: "atom", color: "#F44336" }
    ];
    
    categories.forEach(category => {
      this.createCategory(category);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      uuid: crypto.randomUUID(),
      role: insertUser.role || "student",
      profilePicture: insertUser.profilePicture || null,
      bio: insertUser.bio || null,
      experience: insertUser.experience || null,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async getTeachers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "teacher"
    );
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null 
    };
    this.categories.set(id, category);
    return category;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.categoryId === categoryId
    );
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.teacherId === teacherId
    );
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const now = new Date();
    const course: Course = { 
      ...insertCourse, 
      id, 
      createdAt: now,
      thumbnail: insertCourse.thumbnail || null,
      categoryId: insertCourse.categoryId || null,
      teacherId: insertCourse.teacherId || null
    };
    this.courses.set(id, course);
    return course;
  }

  // Material operations
  async getMaterialsByCourse(courseId: number): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(
      (material) => material.courseId === courseId
    );
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.currentMaterialId++;
    const now = new Date();
    const material: Material = { ...insertMaterial, id, createdAt: now };
    this.materials.set(id, material);
    return material;
  }

  // Enrollment operations
  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.studentId === studentId
    );
  }

  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.courseId === courseId
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.currentEnrollmentId++;
    const now = new Date();
    const enrollment: Enrollment = { 
      ...insertEnrollment, 
      id, 
      enrolledAt: now,
      isCompleted: insertEnrollment.isCompleted || null
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  // Review operations
  async getReviewsByCourse(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.courseId === courseId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now,
      comment: insertReview.comment || null
    };
    this.reviews.set(id, review);
    return review;
  }

  // Message operations
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const now = new Date();
    const message: Message = { 
      ...insertMessage, 
      id, 
      sentAt: now,
      isRead: insertMessage.isRead || false
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      this.messages.set(messageId, message);
    }
  }
}

// Database implementation for Supabase/Neon
class DbStorage implements IStorage {
  private db: NeonHttpDatabase<typeof schema>;

  constructor(db: NeonHttpDatabase<typeof schema>) {
    this.db = db;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async getTeachers(): Promise<User[]> {
    return await this.db.select().from(users).where(eq(users.role, 'teacher'));
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await this.db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.db.insert(categories).values(category).returning();
    return result[0];
  }
  
  // Course operations
  async getCourses(): Promise<Course[]> {
    return await this.db.select().from(courses);
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    const result = await this.db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return await this.db.select().from(courses).where(eq(courses.categoryId, categoryId));
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return await this.db.select().from(courses).where(eq(courses.teacherId, teacherId));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const result = await this.db.insert(courses).values(course).returning();
    return result[0];
  }
  
  // Material operations
  async getMaterialsByCourse(courseId: number): Promise<Material[]> {
    return await this.db.select().from(materials).where(eq(materials.courseId, courseId));
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const result = await this.db.insert(materials).values(material).returning();
    return result[0];
  }
  
  // Enrollment operations
  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return await this.db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
  }

  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    return await this.db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const result = await this.db.insert(enrollments).values(enrollment).returning();
    return result[0];
  }
  
  // Review operations
  async getReviewsByCourse(courseId: number): Promise<Review[]> {
    return await this.db.select().from(reviews).where(eq(reviews.courseId, courseId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await this.db.insert(reviews).values(review).returning();
    return result[0];
  }
  
  // Message operations
  async getMessagesByUser(userId: number): Promise<Message[]> {
    const sent = await this.db.select().from(messages).where(eq(messages.senderId, userId));
    const received = await this.db.select().from(messages).where(eq(messages.receiverId, userId));
    return [...sent, ...received];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await this.db.insert(messages).values(message).returning();
    return result[0];
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await this.db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
  }
}

// Initialize storage variable
let dbStorage: DbStorage | undefined;
let memStorage: MemStorage = new MemStorage();

// Initialize the database client if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    // For now, let's fall back to memory storage and log the connection string issue
    console.log("Using in-memory storage for development");
    // When ready to connect to database, uncomment the following code:
    /*
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema });
    
    // Create the DbStorage instance
    dbStorage = new DbStorage(db);
    console.log("Successfully connected to Neon database");
    */
  } catch (error) {
    console.error("Error connecting to database:", error);
    // Fall back to memory storage
  }
}

// Use either DB storage or memory storage based on availability
export const storage = dbStorage || memStorage;
