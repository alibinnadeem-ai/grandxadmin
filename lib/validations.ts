import { z } from "zod";

// User validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const approveUserSchema = z.object({
  isApproved: z.boolean(),
});

// API validation schemas
export const apiSchema = z.object({
  name: z.string().min(1, "API name is required"),
  description: z.string().optional(),
  endpoint: z.string().url("Invalid URL format"),
  headers: z.record(z.string()).optional().default({}),
  authMethod: z.enum(["None", "API Key", "Bearer Token", "OAuth"]),
  dummyData: z.record(z.any()).optional().default({}),
});

export const updateApiSchema = apiSchema.partial();

export const testApiSchema = z.object({
  apiId: z.number(),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  body: z.record(z.any()).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ApiInput = z.infer<typeof apiSchema>;
export type UpdateApiInput = z.infer<typeof updateApiSchema>;
export type TestApiInput = z.infer<typeof testApiSchema>;
