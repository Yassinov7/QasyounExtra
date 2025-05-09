import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertCategorySchema,
  insertCourseSchema,
  insertMaterialSchema,
  insertEnrollmentSchema,
  insertReviewSchema,
  insertMessageSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "qasyoun-extra-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }

          // In a real app, hash the password before comparison
          if (user.password !== password) {
            return done(null, false, { message: "Incorrect email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isTeacher = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any).role === "teacher") {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Teachers only" });
  };

  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Admins only" });
  };

  // Error handler middleware
  const handleValidationError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  };

  // =====================
  // AUTH ROUTES
  // =====================

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // In a real app, hash the password before storing
      const user = await storage.createUser(userData);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // =====================
  // USERS ROUTES
  // =====================

  // Get all teachers
  app.get("/api/teachers", async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      // Remove sensitive information
      const sanitizedTeachers = teachers.map(({ password, ...rest }) => rest);
      res.json(sanitizedTeachers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  // Get teacher by ID
  app.get("/api/teachers/:id", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const teacher = await storage.getUser(teacherId);
      
      if (!teacher || teacher.role !== "teacher") {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      // Remove sensitive information
      const { password, ...teacherWithoutPassword } = teacher;
      
      res.json(teacherWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch teacher" });
    }
  });

  // =====================
  // CATEGORIES ROUTES
  // =====================

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by ID
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Create category (admin only)
  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // =====================
  // COURSES ROUTES
  // =====================

  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get course by ID
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Get courses by category
  app.get("/api/categories/:id/courses", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const courses = await storage.getCoursesByCategory(categoryId);
      res.json(courses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch courses by category" });
    }
  });

  // Get courses by teacher
  app.get("/api/teachers/:id/courses", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const courses = await storage.getCoursesByTeacher(teacherId);
      res.json(courses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch courses by teacher" });
    }
  });

  // Create course (teacher only)
  app.post("/api/courses", isTeacher, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      
      // Ensure the course is being created by the authenticated teacher
      if (courseData.teacherId !== (req.user as any).id) {
        return res.status(403).json({ message: "Cannot create course for another teacher" });
      }
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // =====================
  // MATERIALS ROUTES
  // =====================

  // Get materials by course
  app.get("/api/courses/:id/materials", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const materials = await storage.getMaterialsByCourse(courseId);
      res.json(materials);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  // Add material to course (teacher only)
  app.post("/api/courses/:id/materials", isTeacher, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if the teacher owns this course
      if (course.teacherId !== (req.user as any).id) {
        return res.status(403).json({ message: "Cannot add material to another teacher's course" });
      }
      
      const materialData = insertMaterialSchema.parse({
        ...req.body,
        courseId
      });
      
      const material = await storage.createMaterial(materialData);
      res.status(201).json(material);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // =====================
  // ENROLLMENTS ROUTES
  // =====================

  // Get student enrollments
  app.get("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const studentId = (req.user as any).id;
      const enrollments = await storage.getEnrollmentsByStudent(studentId);
      res.json(enrollments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Enroll in course (student only)
  app.post("/api/courses/:id/enroll", isAuthenticated, async (req, res) => {
    try {
      if ((req.user as any).role !== "student") {
        return res.status(403).json({ message: "Only students can enroll in courses" });
      }
      
      const courseId = parseInt(req.params.id);
      const studentId = (req.user as any).id;
      
      // Check if course exists
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if already enrolled
      const studentEnrollments = await storage.getEnrollmentsByStudent(studentId);
      const alreadyEnrolled = studentEnrollments.some(e => e.courseId === courseId);
      
      if (alreadyEnrolled) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const enrollmentData = {
        studentId,
        courseId,
        isCompleted: false
      };
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // =====================
  // REVIEWS ROUTES
  // =====================

  // Get reviews for a course
  app.get("/api/courses/:id/reviews", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByCourse(courseId);
      res.json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Add review to course (enrolled student only)
  app.post("/api/courses/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const studentId = (req.user as any).id;
      
      // Check if student is enrolled in the course
      const studentEnrollments = await storage.getEnrollmentsByStudent(studentId);
      const isEnrolled = studentEnrollments.some(e => e.courseId === courseId);
      
      if (!isEnrolled) {
        return res.status(403).json({ message: "You must be enrolled in the course to leave a review" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        courseId,
        studentId
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // =====================
  // MESSAGES ROUTES
  // =====================

  // Get user messages
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const messages = await storage.getMessagesByUser(userId);
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const senderId = (req.user as any).id;
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  // Mark message as read
  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
