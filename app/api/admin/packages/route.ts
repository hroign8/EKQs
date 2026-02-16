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
