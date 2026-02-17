import {
  submitVoteSchema,
  contactFormSchema,
  contestantSchema,
  eventSchema,
  ticketPurchaseSchema,
  categorySchema,
  packageSchema,
} from './validations'

// ─── submitVoteSchema ────────────────────────────────────────

describe('submitVoteSchema', () => {
  it('passes with valid input', () => {
    const result = submitVoteSchema.safeParse({
      contestantId: 'abc123',
      categoryId: 'cat1',
      packageId: 'pkg1',
    })
    expect(result.success).toBe(true)
  })

  it('fails when contestantId is empty', () => {
    const result = submitVoteSchema.safeParse({
      contestantId: '',
      categoryId: 'cat1',
      packageId: 'pkg1',
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

  it('fails with non-url image', () => {
    const result = contestantSchema.safeParse({
      name: 'John',
      country: 'Eritrea',
      gender: 'Male',
      image: 'not-a-url',
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
      ticketTypeId: 'vip',
      quantity: 2,
    })
    expect(result.success).toBe(true)
  })

  it('fails with zero quantity', () => {
    const result = ticketPurchaseSchema.safeParse({
      ticketTypeId: 'vip',
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it('fails with quantity over 20', () => {
    const result = ticketPurchaseSchema.safeParse({
      ticketTypeId: 'vip',
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
