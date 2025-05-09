import { 
  users, User, InsertUser, 
  categories, Category, InsertCategory,
  courses, Course, InsertCourse,
  materials, Material, InsertMaterial,
  enrollments, Enrollment, InsertEnrollment,
  reviews, Review, InsertReview,
  messages, Message, InsertMessage,
  universities, University, InsertUniversity
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm/expressions";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

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
  private universities: Map<number, University>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentCourseId: number;
  private currentMaterialId: number;
  private currentEnrollmentId: number;
  private currentReviewId: number;
  private currentMessageId: number;
  private currentUniversityId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.courses = new Map();
    this.materials = new Map();
    this.enrollments = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    this.universities = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentCourseId = 1;
    this.currentMaterialId = 1;
    this.currentEnrollmentId = 1;
    this.currentReviewId = 1;
    this.currentMessageId = 1;
    this.currentUniversityId = 1;
    
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
      universityId: insertUser.universityId || null,
      faculty: insertUser.faculty || null,
      academicYear: insertUser.academicYear || null,
      studentId: insertUser.studentId || null,
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
      teacherId: insertCourse.teacherId || null,
      universityId: insertCourse.universityId || null,
      faculty: insertCourse.faculty || null,
      academicYear: insertCourse.academicYear || null,
      courseCode: insertCourse.courseCode || null,
      isOfficial: insertCourse.isOfficial || false
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

  // University operations
  async createUniversity(insertUniversity: InsertUniversity): Promise<University> {
    const id = this.currentUniversityId++;
    const now = new Date();
    const university: University = { 
      ...insertUniversity, 
      id, 
      createdAt: now,
      logo: insertUniversity.logo || null,
      website: insertUniversity.website || null 
    };
    this.universities.set(id, university);
    return university;
  }
}

// Database implementation for Supabase
class DbStorage implements IStorage {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
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
  
  // University operations
  async createUniversity(university: InsertUniversity): Promise<University> {
    const result = await this.db.insert(universities).values(university).returning();
    return result[0];
  }
}

// Initialize storage variable
let dbStorage: DbStorage | undefined;
let memStorage: MemStorage = new MemStorage();

// Initialize using in-memory storage for now
console.log("Using in-memory storage");

// We'll implement a better solution for Supabase using the createClient approach instead
// This will allow us to properly integrate with Supabase's authentication and database features
// For now, we'll use the in-memory storage to ensure the application works

// Use either DB storage or memory storage based on availability
// Check if the database connection is working
export const storage = dbStorage || memStorage;

// Add University operations methods to IStorage
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
  
  // University operations
  createUniversity(university: InsertUniversity): Promise<University>;
}

// Add more sample in-memory data for development if we're using the memory storage
if (!dbStorage) {
  console.log("Adding sample data to in-memory storage for development");
  
  // Add sample data immediately with explicit waiting for promises
  const initializeData = async () => {
    try {
      // Add sample university
      const damUniversity = await memStorage.createUniversity({
        name: 'جامعة دمشق',
        location: 'دمشق، سوريا',
        logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/3/31/%D8%AC%D8%A7%D9%85%D8%B9%D8%A9_%D8%AF%D9%85%D8%B4%D9%82.png/220px-%D8%AC%D8%A7%D9%85%D8%B9%D8%A9_%D8%AF%D9%85%D8%B4%D9%82.png',
        website: 'http://damascusuniversity.edu.sy/'
      });

      // Add sample users
      const adminUser = await memStorage.createUser({
        username: 'admin',
        email: 'admin@qasyounextra.com',
        password: 'adminpassword', // In a real app, this would be hashed
        role: 'admin',
        fullName: 'مدير النظام',
        bio: 'مدير منصة قاسيون إكسترا'
      });

      const teacherUser = await memStorage.createUser({
        username: 'teacher',
        email: 'teacher@qasyounextra.com',
        password: 'teacherpassword', // In a real app, this would be hashed
        role: 'teacher',
        fullName: 'أستاذ نموذجي',
        bio: 'أستاذ في كلية الهندسة المعلوماتية',
        universityId: damUniversity.id,
        faculty: 'engineering'
      });

      const studentUser = await memStorage.createUser({
        username: 'student',
        email: 'student@qasyounextra.com',
        password: 'studentpassword', // In a real app, this would be hashed
        role: 'student',
        fullName: 'طالب نموذجي',
        universityId: damUniversity.id,
        faculty: 'engineering',
        academicYear: 'third',
        studentId: '12345'
      });

      // Add sample categories
      const mathCategory = await memStorage.createCategory({
        name: 'الرياضيات',
        description: 'دروس في الرياضيات والجبر والهندسة',
        icon: 'calculator',
        color: '#4C9AFF'
      });

      const csCategory = await memStorage.createCategory({
        name: 'علوم الحاسوب',
        description: 'دروس في البرمجة وهندسة البرمجيات وقواعد البيانات',
        icon: 'code',
        color: '#6554C0'
      });

      // Add sample courses
      const mathCourse = await memStorage.createCourse({
        title: 'التفاضل والتكامل المتقدم',
        description: 'دورة متقدمة في التفاضل والتكامل للسنة الثالثة في كلية الهندسة',
        price: 25000,
        level: 'متقدم',
        categoryId: mathCategory.id,
        teacherId: teacherUser.id,
        universityId: damUniversity.id,
        faculty: 'engineering',
        academicYear: 'third',
        courseCode: 'MATH301',
        isOfficial: true
      });

      const programmingCourse = await memStorage.createCourse({
        title: 'مقدمة في البرمجة بلغة جافا',
        description: 'دورة مبتدئة في برمجة الجافا لطلاب السنة الأولى',
        price: 15000,
        level: 'مبتدئ',
        categoryId: csCategory.id,
        teacherId: teacherUser.id,
        universityId: damUniversity.id,
        faculty: 'engineering',
        academicYear: 'first',
        courseCode: 'CS101',
        isOfficial: true
      });

      // Add sample materials
      await memStorage.createMaterial({
        courseId: mathCourse.id,
        title: 'محاضرة 1: مقدمة في التفاضل',
        type: 'video',
        url: 'https://example.com/video1.mp4'
      });

      await memStorage.createMaterial({
        courseId: mathCourse.id,
        title: 'ملخص المحاضرة الأولى',
        type: 'pdf',
        url: 'https://example.com/notes1.pdf'
      });

      // Add sample enrollment
      await memStorage.createEnrollment({
        studentId: studentUser.id,
        courseId: mathCourse.id
      });

      // Add sample review
      await memStorage.createReview({
        studentId: studentUser.id,
        courseId: mathCourse.id,
        rating: 5,
        comment: 'دورة ممتازة ومفيدة جداً'
      });

      // Add sample messages
      await memStorage.createMessage({
        senderId: studentUser.id,
        receiverId: teacherUser.id,
        content: 'السلام عليكم، هل يمكنني الحصول على معلومات إضافية حول الدورة؟'
      });

      await memStorage.createMessage({
        senderId: teacherUser.id,
        receiverId: studentUser.id,
        content: 'وعليكم السلام، بالتأكيد! ما هي المعلومات التي تبحث عنها؟'
      });
      
      console.log("Sample data initialization completed");
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  };

  // Execute the async function
  initializeData();
}
