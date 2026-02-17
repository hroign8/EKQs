import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/**
 * Save a base64 data URI to disk and return the public URL path.
 * If the value is already a URL or file path, returns it unchanged.
 */
async function saveImageToDisk(imageValue: string): Promise<string> {
  // If it's already a URL or relative path, keep it
  if (!imageValue.startsWith('data:')) {
    return imageValue
  }

  // Extract mime type and base64 data
  const match = imageValue.match(/^data:image\/([\w+]+);base64,(.+)$/)
  if (!match) {
    throw new Error('Invalid image data')
  }

  // Only allow safe raster image types (no SVG to prevent stored XSS)
  const safeTypes: Record<string, string> = { jpeg: 'jpg', jpg: 'jpg', png: 'png', webp: 'webp', gif: 'gif' }
  const rawType = match[1].toLowerCase()
  const ext = safeTypes[rawType]
  if (!ext) {
    throw new Error('Unsupported image type. Use JPEG, PNG, WebP, or GIF.')
  }
  const base64Data = match[2]
  const buffer = Buffer.from(base64Data, 'base64')

  // Validate size (max 5MB)
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('Image must be less than 5MB')
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'contestants')
  await mkdir(uploadsDir, { recursive: true })

  const filename = `${crypto.randomUUID()}.${ext}`
  const filepath = path.join(uploadsDir, filename)
  await writeFile(filepath, buffer)

  return `/uploads/contestants/${filename}`
}

/**
 * GET /api/admin/contestants
 * Admin endpoint — returns all contestants (including inactive).
 */
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const contestants = await prisma.contestant.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(contestants)
  } catch (err) {
    console.error('Admin contestants fetch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/contestants
 * Admin endpoint — creates a new contestant.
 */
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()

    if (!body.name || !body.country || !body.gender) {
      return errorResponse('Name, country, and gender are required')
    }

    if (!['Male', 'Female'].includes(body.gender)) {
      return errorResponse('Gender must be Male or Female')
    }

    // Save image to disk if it's base64
    let imageUrl = body.image || ''
    if (imageUrl) {
      try {
        imageUrl = await saveImageToDisk(imageUrl)
      } catch (imgErr) {
        return errorResponse(imgErr instanceof Error ? imgErr.message : 'Image upload failed')
      }
    }

    const contestant = await prisma.contestant.create({
      data: {
        name: body.name,
        country: body.country,
        gender: body.gender,
        image: imageUrl,
        description: body.description || '',
        rank: body.rank ?? null,
      },
    })

    return NextResponse.json(contestant, { status: 201 })
  } catch (err) {
    console.error('Admin contestant create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/contestants
 * Admin endpoint — updates an existing contestant.
 */
export async function PUT(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return errorResponse('Contestant ID is required')
    }

    const existing = await prisma.contestant.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Contestant not found', 404)
    }

    // Save image to disk if it's base64
    if (updates.image) {
      try {
        updates.image = await saveImageToDisk(updates.image)
      } catch (imgErr) {
        return errorResponse(imgErr instanceof Error ? imgErr.message : 'Image upload failed')
      }
    }

    // Whitelist allowed fields
    const allowedFields = ['name', 'country', 'gender', 'image', 'description', 'rank', 'isActive'] as const
    const data: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in updates) {
        data[key] = updates[key]
      }
    }

    const contestant = await prisma.contestant.update({
      where: { id },
      data,
    })

    return NextResponse.json(contestant)
  } catch (err) {
    console.error('Admin contestant update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/contestants
 * Admin endpoint — soft-deletes a contestant (sets isActive to false).
 */
export async function DELETE(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return errorResponse('Contestant ID is required')
    }

    const existing = await prisma.contestant.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Contestant not found', 404)
    }

    await prisma.contestant.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin contestant delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
