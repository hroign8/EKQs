import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { packageSchema } from '@/lib/validations'

/**
 * GET /api/admin/packages
 * Admin endpoint — returns all packages (including inactive).
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const packages = await prisma.votingPackage.findMany({
      orderBy: { votes: 'asc' },
    })
    return NextResponse.json(packages)
  } catch (err) {
    console.error('Admin packages fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/packages
 * Admin endpoint — creates a new voting package.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = packageSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message)
    }

    const existing = await prisma.votingPackage.findUnique({
      where: { slug: parsed.data.slug },
    })
    if (existing) {
      return errorResponse('A package with this slug already exists')
    }

    const pkg = await prisma.votingPackage.create({
      data: parsed.data,
    })

    return NextResponse.json(pkg, { status: 201 })
  } catch (err) {
    console.error('Admin package create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/packages
 * Admin endpoint — updates a voting package (name, votes, price, isActive toggle).
 */
export async function PUT(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id || typeof id !== 'string') {
      return errorResponse('Package ID is required')
    }

    const existing = await prisma.votingPackage.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Package not found', 404)
    }

    // Build the data to update — only include fields that were sent
    const data: Record<string, unknown> = {}
    if (typeof updates.name === 'string') data.name = updates.name
    if (typeof updates.votes === 'number') {
      if (!Number.isInteger(updates.votes) || updates.votes < 1) {
        return errorResponse('Votes must be a positive integer')
      }
      data.votes = updates.votes
    }
    if (typeof updates.price === 'number') {
      if (updates.price < 0) {
        return errorResponse('Price must be zero or positive')
      }
      data.price = updates.price
    }
    if (typeof updates.isActive === 'boolean') data.isActive = updates.isActive
    if (typeof updates.slug === 'string') data.slug = updates.slug

    if (Object.keys(data).length === 0) {
      return errorResponse('No valid fields to update')
    }

    const updated = await prisma.votingPackage.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('Admin package update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/packages?id=...
 * Admin endpoint — deletes a voting package.
 */
export async function DELETE(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('Package ID is required')
    }

    const existing = await prisma.votingPackage.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Package not found', 404)
    }

    await prisma.votingPackage.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin package delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
