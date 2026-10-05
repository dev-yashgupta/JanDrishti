import { z } from 'zod';

// ── Auth ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string(),
    preferred_language: z.string().optional(),
    city: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    role: z.enum(['CITIZEN', 'AUTHORITY']).optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

// ── Report ────────────────────────────────────────────────────

export const reportSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be under 200 characters'),
  description: z
    .string()
    .min(30, 'Please provide a more detailed description (at least 30 characters)')
    .max(2000, 'Description must be under 2000 characters'),
  category_id: z.string().min(1, 'Please select a category'),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  date_observed: z.string().optional(),
  contact_info: z.string().max(200).optional().or(z.literal('')),
  is_anonymous: z.boolean().optional(),
});

// ── Comment ───────────────────────────────────────────────────

export const commentSchema = z.object({
  content: z.string().min(5, 'Comment must be at least 5 characters').max(1000),
  is_internal: z.boolean().optional(),
});

// ── Status Change ─────────────────────────────────────────────

export const statusChangeSchema = z.object({
  new_status: z.enum([
    'REPORTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CITIZEN_VERIFICATION',
    'CLOSED',
  ]),
  note: z.string().max(500).optional(),
});

// ── Assignment ────────────────────────────────────────────────

export const assignmentSchema = z.object({
  assigned_to_id: z.string().min(1, 'Please select an assignee'),
  department: z.string().max(100).optional(),
  due_date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// ── Profile ───────────────────────────────────────────────────

export const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  preferred_language: z.string(),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type StatusChangeFormData = z.infer<typeof statusChangeSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
