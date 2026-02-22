import { z } from 'zod'

// ─── Vote Validation ────────────────────────────────────────

export const submitVoteSchema = z.object({
  contestantId: z.string().min(1, 'Contestant is required'),
  categoryId: z.string().min(1, 'Category is required'),
  packageId: z.string().min(1, 'Package is required'),
})

export type SubmitVoteInput = z.infer<typeof submitVoteSchema>

// ─── Contact Form Validation ─────────────────────────────────

export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

export type ContactFormInput = z.infer<typeof contactFormSchema>

// ─── Contestant Validation (Admin) ───────────────────────────

export const contestantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  gender: z.enum(['Male', 'Female']),
  image: z.string().min(1, 'Image is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  rank: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

export type ContestantInput = z.infer<typeof contestantSchema>

// ─── Event Validation (Admin) ────────────────────────────────

export const eventSchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().min(1).max(500),
  startDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be DD/MM/YYYY'),
  endDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be DD/MM/YYYY'),
  votingStart: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be DD/MM/YYYY'),
  votingEnd: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be DD/MM/YYYY'),
  isActive: z.boolean().optional(),
  publicResults: z.boolean().optional(),
  votePrice: z.number().positive().optional(),
})

export type EventInput = z.infer<typeof eventSchema>

// ─── Ticket Purchase Validation ──────────────────────────────

export const ticketPurchaseSchema = z.object({
  ticketTypeId: z.string().min(1, 'Ticket type is required'),
  quantity: z.number().int().min(1).max(20),
})

export type TicketPurchaseInput = z.infer<typeof ticketPurchaseSchema>

// ─── Category Validation (Admin) ─────────────────────────────

export const categorySchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'Slug must be alphanumeric, starting with a letter'),
  name: z.string().min(1).max(100),
  isActive: z.boolean().optional(),
})

export type CategoryInput = z.infer<typeof categorySchema>

// ─── Package Validation (Admin) ──────────────────────────────

export const packageSchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'Slug must be alphanumeric, starting with a letter'),
  name: z.string().min(1).max(100),
  votes: z.number().int().positive(),
  price: z.number().nonnegative(),
  isActive: z.boolean().optional(),
})

export type PackageInput = z.infer<typeof packageSchema>

// ─── Contestant Update Validation (Admin PUT) ──────────────

export const updateContestantSchema = contestantSchema.partial().extend({
  id: z.string().min(1, 'Contestant ID is required'),
})

export type UpdateContestantInput = z.infer<typeof updateContestantSchema>

// ─── Manual Vote Validation (Admin POST) ─────────────────────

export const manualVoteSchema = z.object({
  voterEmail: z.string().email('Valid email is required'),
  contestantId: z.string().min(1, 'Contestant is required'),
  categoryId: z.string().min(1, 'Category is required'),
  packageId: z.string().min(1, 'Package is required'),
})

export type ManualVoteInput = z.infer<typeof manualVoteSchema>
