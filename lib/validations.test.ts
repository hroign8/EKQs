import {
  submitVoteSchema,
  contactFormSchema,
  contestantSchema,
  updateContestantSchema,
  eventSchema,
  ticketPurchaseSchema,
  categorySchema,
  packageSchema,
  isValidObjectId,
  objectIdSchema,
} from './validations'

// Valid MongoDB ObjectIds for testing
const TEST_IDS = {
  contestant: '507f1f77bcf86cd799439011',
  category: '507f1f77bcf86cd799439012',
  package: '507f1f77bcf86cd799439013',
  ticket: '507f1f77bcf86cd799439014',
}

// ─── objectIdSchema ──────────────────────────────────────────

describe('objectIdSchema', () => {
  it('passes with valid 24-char hex string', () => {
    expect(objectIdSchema.safeParse('507f1f77bcf86cd799439011').success).toBe(true)
  })

  it('fails with short string', () => {
    expect(objectIdSchema.safeParse('abc123').success).toBe(false)
  })

  it('fails with non-hex characters', () => {
    expect(objectIdSchema.safeParse('507f1f77bcf86cd79943901z').success).toBe(false)
  })
})

describe('isValidObjectId', () => {
  it('returns true for valid ObjectId', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true)
  })

  it('returns false for invalid ObjectId', () => {
    expect(isValidObjectId('abc123')).toBe(false)
  })
})

// ─── submitVoteSchema ────────────────────────────────────────

describe('submitVoteSchema', () => {
  it('passes with valid input', () => {
    const result = submitVoteSchema.safeParse({
      contestantId: TEST_IDS.contestant,
      categoryId: TEST_IDS.category,
      packageId: TEST_IDS.package,
    })
    expect(result.success).toBe(true)
  })

  it('fails when contestantId is empty', () => {
    const result = submitVoteSchema.safeParse({
      contestantId: '',
      categoryId: TEST_IDS.category,
      packageId: TEST_IDS.package,
    })
    expect(result.success).toBe(false)
  })

  it('fails when contestantId is invalid ObjectId format', () => {
    const result = submitVoteSchema.safeParse({
      contestantId: 'abc123',
      categoryId: TEST_IDS.category,
      packageId: TEST_IDS.package,
    })
    expect(result.success).toBe(false)
  })

  it('fails when fields are missing', () => {
    const result = submitVoteSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ─── contactFormSchema ───────────────────────────────────────

describe('contactFormSchema', () => {
  it('passes with valid input', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'Hello',
      message: 'This is a valid message that is long enough.',
    })
    expect(result.success).toBe(true)
  })

  it('passes without optional subject', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'This is a valid message that is long enough.',
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'not-an-email',
      message: 'This is a valid message.',
    })
    expect(result.success).toBe(false)
  })

  it('fails with short message', () => {
    const result = contactFormSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Short',
    })
    expect(result.success).toBe(false)
  })
})

// ─── contestantSchema ────────────────────────────────────────

describe('contestantSchema', () => {
  it('passes with valid input', () => {
    const result = contestantSchema.safeParse({
      name: 'John Doe',
      country: 'Eritrea',
      gender: 'Male',
      image: 'https://example.com/photo.jpg',
      description: 'A talented individual with great presence.',
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid gender', () => {
    const result = contestantSchema.safeParse({
      name: 'John',
      country: 'Eritrea',
      gender: 'Other',
      image: 'https://example.com/photo.jpg',
      description: 'A talented individual with great presence.',
    })
    expect(result.success).toBe(false)
  })

  it('fails with empty image', () => {
    const result = contestantSchema.safeParse({
      name: 'John',
      country: 'Eritrea',
      gender: 'Male',
      image: '',
      description: 'A talented individual with great presence.',
    })
    expect(result.success).toBe(false)
  })
})

// ─── eventSchema ─────────────────────────────────────────────

describe('eventSchema', () => {
  it('passes with valid DD/MM/YYYY dates', () => {
    const result = eventSchema.safeParse({
      name: 'EKQ 2026',
      tagline: 'Celebrating excellence',
      startDate: '01/01/2026',
      endDate: '28/02/2026',
      votingStart: '15/01/2026',
      votingEnd: '25/02/2026',
    })
    expect(result.success).toBe(true)
  })

  it('passes with DD/MM/YYYY HH:MM dates', () => {
    const result = eventSchema.safeParse({
      name: 'EKQ 2026',
      tagline: 'Celebrating excellence',
      startDate: '22/03/2026',
      endDate: '22/03/2026',
      votingStart: '01/02/2026',
      votingEnd: '21/03/2026 12:00',
    })
    expect(result.success).toBe(true)
  })

  it('fails with wrong date format', () => {
    const result = eventSchema.safeParse({
      name: 'EKQ 2026',
      tagline: 'Celebrating excellence',
      startDate: '2026-01-01',
      endDate: '28/02/2026',
      votingStart: '15/01/2026',
      votingEnd: '25/02/2026',
    })
    expect(result.success).toBe(false)
  })
})

// ─── ticketPurchaseSchema ────────────────────────────────────

describe('ticketPurchaseSchema', () => {
  it('passes with valid input', () => {
    const result = ticketPurchaseSchema.safeParse({
      ticketTypeId: TEST_IDS.ticket,
      quantity: 2,
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid ObjectId format', () => {
    const result = ticketPurchaseSchema.safeParse({
      ticketTypeId: 'vip',
      quantity: 2,
    })
    expect(result.success).toBe(false)
  })

  it('fails with zero quantity', () => {
    const result = ticketPurchaseSchema.safeParse({
      ticketTypeId: TEST_IDS.ticket,
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it('fails with quantity over 20', () => {
    const result = ticketPurchaseSchema.safeParse({
      ticketTypeId: TEST_IDS.ticket,
      quantity: 21,
    })
    expect(result.success).toBe(false)
  })
})

// ─── categorySchema ─────────────────────────────────────────

describe('categorySchema', () => {
  it('passes with valid slug', () => {
    const result = categorySchema.safeParse({
      slug: 'bestDressed',
      name: 'Best Dressed',
    })
    expect(result.success).toBe(true)
  })

  it('fails with slug starting with number', () => {
    const result = categorySchema.safeParse({
      slug: '1category',
      name: 'Category 1',
    })
    expect(result.success).toBe(false)
  })

  it('fails with slug containing special chars', () => {
    const result = categorySchema.safeParse({
      slug: 'best-dressed',
      name: 'Best Dressed',
    })
    expect(result.success).toBe(false)
  })
})

// ─── packageSchema ───────────────────────────────────────────

describe('packageSchema', () => {
  it('passes with valid input', () => {
    const result = packageSchema.safeParse({
      slug: 'gold',
      name: 'Gold Package',
      votes: 50,
      price: 15.0,
    })
    expect(result.success).toBe(true)
  })

  it('fails with zero votes', () => {
    const result = packageSchema.safeParse({
      slug: 'gold',
      name: 'Gold Package',
      votes: 0,
      price: 15.0,
    })
    expect(result.success).toBe(false)
  })

  it('fails with negative price', () => {
    const result = packageSchema.safeParse({
      slug: 'gold',
      name: 'Gold Package',
      votes: 50,
      price: -5,
    })
    expect(result.success).toBe(false)
  })
})

// ─── updateContestantSchema ───────────────────────────────────────

describe('updateContestantSchema', () => {
  it('passes with only id and partial fields', () => {
    const result = updateContestantSchema.safeParse({
      id: TEST_IDS.contestant,
      name: 'Updated Name',
    })
    expect(result.success).toBe(true)
  })

  it('passes with all fields', () => {
    const result = updateContestantSchema.safeParse({
      id: TEST_IDS.contestant,
      name: 'John',
      country: 'Eritrea',
      gender: 'Male',
      image: '/uploads/contestants/photo.jpg',
      description: 'A talented individual with great presence.',
    })
    expect(result.success).toBe(true)
  })

  it('fails when id is missing', () => {
    const result = updateContestantSchema.safeParse({
      name: 'Updated Name',
    })
    expect(result.success).toBe(false)
  })

  it('fails with invalid gender', () => {
    const result = updateContestantSchema.safeParse({
      id: TEST_IDS.contestant,
      gender: 'Unknown',
    })
    expect(result.success).toBe(false)
  })

  it('fails with invalid ObjectId format', () => {
    const result = updateContestantSchema.safeParse({
      id: 'abc123',
      name: 'Updated Name',
    })
    expect(result.success).toBe(false)
  })
})
