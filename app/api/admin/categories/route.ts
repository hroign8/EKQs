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

/**
 * PUT /api/admin/categories
 * Admin endpoint — updates an existing voting category.
 */
export async function PUT(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, name } = body

    if (!id) {
      return errorResponse('Category ID is required')
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return errorResponse('Category name is required')
    }

    const existing = await prisma.votingCategory.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Category not found', 404)
    }

    const category = await prisma.votingCategory.update({
      where: { id },
      data: { name: name.trim() },
    })

    return NextResponse.json(category)
  } catch (err) {
    console.error('Admin category update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/categories
 * Admin endpoint — deletes a voting category.
 */
export async function DELETE(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('Category ID is required')
    }

    const existing = await prisma.votingCategory.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Category not found', 404)
    }

    await prisma.votingCategory.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin category delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
