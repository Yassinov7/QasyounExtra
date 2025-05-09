import { pgTable, text, serial, integer, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export const userRoleEnum = pgEnum('user_role', ['student', 'teacher', 'admin']);

// Define university related enums
export const universityFacultyEnum = pgEnum('university_faculty', [
  'engineering', 'medicine', 'science', 'arts', 'business', 'law', 'education', 'other'
]);

export const academicYearEnum = pgEnum('academic_year', [
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'graduate'
]);

// Universities table
export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  logo: text("logo"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('student'),
  fullName: text("full_name").notNull(),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  experience: text("experience"),
  universityId: integer("university_id").references(() => universities.id),
  faculty: universityFacultyEnum("faculty"),
  academicYear: academicYearEnum("academic_year"),
  studentId: text("student_id"), // University student ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  price: integer("price").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  teacherId: integer("teacher_id").references(() => users.id),
  universityId: integer("university_id").references(() => universities.id),
  faculty: universityFacultyEnum("faculty"),
  academicYear: academicYearEnum("academic_year"),
  isOfficial: boolean("is_official").default(false), // If it's an official university course
  courseCode: text("course_code"), // University course code
  level: text("level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Materials table
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // video, pdf, quiz, etc.
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  isCompleted: boolean("is_completed").default(false),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertUniversitySchema = createInsertSchema(universities).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  uuid: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
});

// Create types
export type InsertUniversity = z.infer<typeof insertUniversitySchema>;
export type University = typeof universities.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
