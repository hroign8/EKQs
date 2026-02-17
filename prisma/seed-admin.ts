import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

/**
 * Seed the admin account.
 *
 * Set these environment variables before running:
 *   ADMIN_EMAIL    – admin login email    (default: admin@ekq.com)
 *   ADMIN_PASSWORD – admin login password (default: Admin@2026!)
 *   ADMIN_NAME     – display name         (default: Admin)
 *
 * Usage:
 *   npm run db:seed-admin
 *   ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=Secret123! npm run db:seed-admin
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin'
const APP_URL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.')
  console.error('   Usage: ADMIN_EMAIL=me@example.com ADMIN_PASSWORD=Secret123! npm run db:seed-admin')
  process.exit(1)
}

async function main() {
  console.log('🔐 Seeding admin account...')
  console.log(`   Email: ${ADMIN_EMAIL}`)

  // 1. Sign up via the better-auth API so the password is hashed correctly
  const signUpRes = await fetch(`${APP_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  })

  if (!signUpRes.ok) {
    const body = await signUpRes.text()
    // If user already exists, that's fine — we'll just update the role below
    if (!body.includes('already') && !body.includes('exists') && !body.includes('DUPLICATE')) {
      console.error('⚠️  Sign-up request failed:', signUpRes.status, body)
      console.log('   If the user already exists, the role will still be updated to admin.')
    }
  } else {
    console.log('✅ Admin user created via sign-up API')
  }

  // 2. Promote the user to admin role directly in the database
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
    if (!user) {
      console.error('❌ User not found in database. Make sure the app is running and try again.')
      process.exit(1)
    }

    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: 'admin', emailVerified: true },
    })

    console.log('✅ User role set to "admin"')
    console.log('')
    console.log('🎉 Admin account ready! Sign in at /admin/login')
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Password: (the one you provided)`)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((e) => {
  console.error('❌ Admin seed failed:', e)
  process.exit(1)
})
