import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
import { prisma } from '@/lib/db'
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email'

// Resolve the canonical base URL:
// 1. BETTER_AUTH_URL (explicitly set, highest priority)
// 2. NEXT_PUBLIC_APP_URL (set in Vercel env vars)
// 3. VERCEL_URL (auto-injected by Vercel, no protocol prefix)
// 4. localhost fallback for local dev
const resolvedBaseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'http://localhost:3001'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  baseURL: resolvedBaseURL,
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),

  advanced: {
    database: {
      // Let MongoDB/Prisma auto-generate ObjectIds instead of Better Auth's default string IDs
      generateId: false,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url)
    },
  },

  emailVerification: {
    // Redirect to sign-in after the verification link is clicked
    redirectTo: '/signin',
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail(user.email, url)
    },
  },

  ...(googleClientId && googleClientSecret ? {
    socialProviders: {
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    },
  } : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  plugins: [
    admin(),
  ],

  trustedOrigins: [
    resolvedBaseURL,
    'http://localhost:3001',
    'https://ek-qs.vercel.app',
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
})

export type Session = typeof auth.$Infer.Session
