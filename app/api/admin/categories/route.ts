import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { categorySchema } from '@/lib/validations'

/**
 * GET /api/admin/categories
 * Admin endpoint — returns all categories (including inactive).
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const categories = await prisma.votingCategory.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (err) {
    console.error('Admin categories fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/categories
 * Admin endpoint — creates a new voting category.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()

    // Auto-generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .trim()
        .replace(/\s+/g, '')                       // remove spaces  → "People'sChoice"
        .replace(/[^a-zA-Z0-9]/g, '')              // strip non-alphanumeric
        .replace(/^(.)/, (_: string, c: string) => c.toLowerCase())  // camelCase first char
    }

    const parsed = categorySchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    // Check slug uniqueness
    const existing = await prisma.votingCategory.findUnique({
      where: { slug: parsed.data.slug },
    })
    if (existing) {
      return errorResponse('A category with this slug already exists')
    }

    const category = await prisma.votingCategory.create({
      data: parsed.data,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    console.error('Admin category create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
