import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { createRateLimiter } from '@/lib/rate-limit'

const uploadLimiter = createRateLimiter('avatar-upload', 5, 60_000) // 5 per minute

/**
 * Validate actual buffer magic bytes to prevent MIME-type spoofing.
 */
function hasValidMagicBytes(buffer: Buffer, ext: string): boolean {
  if (ext === 'jpg' || ext === 'jpeg') return buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
  if (ext === 'png') return buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
  if (ext === 'webp') return buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  if (ext === 'gif') return buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
  return false
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit per user
    const rl = await uploadLimiter.check(session.user.id)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Read buffer & validate magic bytes to prevent MIME spoofing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    const rawExt = file.name.split('.').pop()?.toLowerCase() || ''
    const ext = allowedExtensions.includes(rawExt) ? rawExt : 'jpg'

    if (!hasValidMagicBytes(buffer, ext)) {
      return NextResponse.json({ error: 'File content does not match the declared image type.' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(uploadsDir, { recursive: true })

    // Delete old avatar file if it exists
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { image: true } })
    if (currentUser?.image?.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(process.cwd(), 'public', currentUser.image)
      try { await unlink(oldPath) } catch { /* file may already be gone */ }
    }

    // Generate unique filename
    const filename = `${session.user.id}-${Date.now()}.${ext}`
    const filepath = path.join(uploadsDir, filename)

    await writeFile(filepath, buffer)

    // Update user's image in database
    const imageUrl = `/uploads/avatars/${filename}`
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    })

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Profile photo updated successfully' 
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
