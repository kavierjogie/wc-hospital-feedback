import { z } from 'zod'

export const feedbackSchema = z.object({
  hospital_id: z.string().uuid('Please select a valid hospital'),
  category: z.enum([
    'Cleanliness',
    'Staff Behaviour',
    'Waiting Time',
    'Service',
    'Facilities',
    'Other',
  ]),
  comment: z
    .string()
    .min(20, 'Please provide at least 20 characters describing your experience')
    .max(2000, 'Feedback must be under 2000 characters')
    .transform((v) => v.trim()),
})

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .transform((v) => v.trim()),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type FeedbackInput = z.infer<typeof feedbackSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
