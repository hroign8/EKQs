import { z } from 'zod'

// ─── MongoDB ObjectId Validation ─────────────────────────────
// MongoDB ObjectIds are 24-character hex strings
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format')

/**
 * Validate that a string is a valid MongoDB ObjectId.
 * Returns true if valid, false otherwise.
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id)
}

// ─── Vote Validation ────────────────────────────────────────

export const submitVoteSchema = z.object({
  contestantId: objectIdSchema,
  categoryId: objectIdSchema,
  packageId: objectIdSchema,
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
  startDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/, 'Date must be DD/MM/YYYY or DD/MM/YYYY HH:MM'),
  endDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/, 'Date must be DD/MM/YYYY or DD/MM/YYYY HH:MM'),
  votingStart: z.string().regex(/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/, 'Date must be DD/MM/YYYY or DD/MM/YYYY HH:MM'),
  votingEnd: z.string().regex(/^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2})?$/, 'Date must be DD/MM/YYYY or DD/MM/YYYY HH:MM'),
  isActive: z.boolean().optional(),
  votingOpen: z.boolean().optional(),
  publicResults: z.boolean().optional(),
  votePrice: z.number().positive().optional(),
})

export type EventInput = z.infer<typeof eventSchema>

// ─── Ticket Purchase Validation ──────────────────────────────

export const ticketPurchaseSchema = z.object({
  ticketTypeId: objectIdSchema,
  quantity: z.number().int().min(1).max(20),
})

export type TicketPurchaseInput = z.infer<typeof ticketPurchaseSchema>

// ─── Ticket Type Validation (Admin) ──────────────────────────

export const ticketTypeSchema = z.object({
  name: z.string().min(1, 'Ticket name is required').max(100),
  price: z.number().nonnegative('Price must be zero or positive'),
  features: z.array(z.string().max(200)).max(20).default([]),
  icon: z.string().max(50).default('ticket'),
  popular: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative().default(0),
})

export type TicketTypeInput = z.infer<typeof ticketTypeSchema>

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
  id: objectIdSchema,
})

export type UpdateContestantInput = z.infer<typeof updateContestantSchema>

// ─── Manual Vote Validation (Admin POST) ─────────────────────

export const manualVoteSchema = z.object({
  voterEmail: z.string().email('Valid email is required'),
  contestantId: objectIdSchema,
  categoryId: objectIdSchema,
  packageId: objectIdSchema,
})

export type ManualVoteInput = z.infer<typeof manualVoteSchema>
