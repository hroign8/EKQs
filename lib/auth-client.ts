import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

// Always use the current origin in the browser so auth requests go to the same
// domain the user is on (eritreanqueens.com, ek-qs.vercel.app, localhost, etc.).
// NEXT_PUBLIC_APP_URL is only used as a fallback in non-browser (SSR) contexts.
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  return ''
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    adminClient(),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  updateUser,
  changePassword,
  sendVerificationEmail,
} = authClient
