import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, errorResponse } from '@/lib/api-utils'
import { contestantSchema, updateContestantSchema } from '@/lib/validations'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/**
 * Validate actual buffer magic bytes to prevent MIME-type spoofing via the data-URI header.
 */
function hasValidMagicBytes(buffer: Buffer, ext: string): boolean {
  if (ext === 'jpg') return buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
  if (ext === 'png') return buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
  if (ext === 'webp') return buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  if (ext === 'gif') return buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
  return false
}

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

  // Verify magic bytes match declared MIME type — prevents MIME spoofing attacks
  if (!hasValidMagicBytes(buffer, ext)) {
    throw new Error('Image content does not match the declared image type')
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

    // Validate all fields first — substitute a placeholder so data-URI images don't
    // fail the URL format check before we've had a chance to persist them.
    const rawImage: string = body.image || ''
    const parsed = contestantSchema.safeParse({
      ...body,
      image: rawImage.startsWith('data:') ? 'https://upload.placeholder/img' : rawImage,
    })
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Validation failed')
    }

    // Validation passed — now persist the image to disk if it's a base64 upload.
    let imageUrl = rawImage
    if (rawImage.startsWith('data:')) {
      try {
        imageUrl = await saveImageToDisk(rawImage)
      } catch (imgErr) {
        return errorResponse(imgErr instanceof Error ? imgErr.message : 'Image upload failed')
      }
    }

    const { name, country, gender, description } = parsed.data

    const contestant = await prisma.contestant.create({
      data: {
        name,
        country,
        gender,
        image: imageUrl,
        description,
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

    // Validate first — substitute a placeholder so data-URI images don't fail URL check.
    const rawImage: string | undefined = body.image
    const parsed = updateContestantSchema.safeParse({
      ...body,
      ...(rawImage?.startsWith('data:') ? { image: 'https://upload.placeholder/img' } : {}),
    })
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'Validation failed')
    }

    // Validation passed — now persist the image if it's a new base64 upload.
    let savedImage: string | undefined = rawImage
    if (rawImage?.startsWith('data:')) {
      try {
        savedImage = await saveImageToDisk(rawImage)
      } catch (imgErr) {
        return errorResponse(imgErr instanceof Error ? imgErr.message : 'Image upload failed')
      }
    }

    const { id, image: _imagePlaceholder, ...restUpdates } = parsed.data
    const updates = {
      ...restUpdates,
      ...(savedImage !== undefined ? { image: savedImage } : {}),
    }

    const existing = await prisma.contestant.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Contestant not found', 404)
    }

    const contestant = await prisma.contestant.update({
      where: { id },
      data: updates,
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
