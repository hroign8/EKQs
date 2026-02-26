import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from 'better-auth/crypto'

/**
 * Seed the admin account directly in the database.
 * No running server required — uses Better Auth's own hashPassword
 * to ensure the hash is compatible with its verifyPassword.
 *
 * Set these environment variables before running:
 *   ADMIN_EMAIL    – admin login email    (required)
 *   ADMIN_PASSWORD – admin login password (required, min 12 chars with complexity)
 *   ADMIN_NAME     – display name         (default: Admin)
 *
 * Usage:
 *   ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=Secret123!@# npm run db:seed-admin
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'

// Password strength validation for admin accounts
function validateAdminPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { valid: errors.length === 0, errors }
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.')
  console.error('   Usage: ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=Secret123!@# npm run db:seed-admin')
  process.exit(1)
}

// Validate password strength
const passwordValidation = validateAdminPassword(ADMIN_PASSWORD)
if (!passwordValidation.valid) {
  console.error('❌ Admin password does not meet security requirements:')
  passwordValidation.errors.forEach(err => console.error(`   - ${err}`))
  console.error('')
  console.error('   Admin passwords must be at least 12 characters and include:')
  console.error('   uppercase, lowercase, number, and special character.')
  process.exit(1)
}

async function main() {
  console.log('🔐 Seeding admin account...')
  console.log(`   Email: ${ADMIN_EMAIL}`)

  const prisma = new PrismaClient()

  try {
    // Hash the password using Better Auth's scrypt format
    const hashedPassword = await hashPassword(ADMIN_PASSWORD!)
    const now = new Date()

    // Upsert the user — create if missing, update if exists
    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL! },
      update: {
        name: ADMIN_NAME,
        role: 'admin',
        emailVerified: true,
        updatedAt: now,
      },
      create: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL!,
        role: 'admin',
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    })

    console.log(`✅ User upserted (id: ${user.id})`)

    // Upsert the credential account so Better Auth can verify the password
    // MongoDB auto-generates ObjectId _id, so find by userId+providerId
    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: 'credential' },
    })

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword, updatedAt: now },
      })
    } else {
      await prisma.account.create({
        data: {
          accountId: user.id,
          providerId: 'credential',
          userId: user.id,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      })
    }

    console.log('✅ Credential account upserted with hashed password')
    console.log('')
    console.log('🎉 Admin account ready! Sign in at /admin/login')
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Password: (the one you provided)`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('❌ Admin seed failed:', e)
  process.exit(1)
})
