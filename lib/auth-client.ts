import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

// Get base URL with fallback for browser environment
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Fallback to current origin in browser
  if (typeof window !== 'undefined') {
    return window.location.origin
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
} = authClient
