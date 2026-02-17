import { Resend } from 'resend'
import { escapeHtml } from '@/lib/utils'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent.')
}

// Lazy initialization to avoid crashing at import time when key is missing
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(resendApiKey || 'missing_key')
  }
  return _resend
}

const fromAddress = process.env.EMAIL_FROM || 'EKQs <noreply@eritreankingsqueens.com>'

export async function sendVerificationEmail(to: string, url: string) {
  if (!resendApiKey) return
  // Validate URL scheme to prevent javascript: injection
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('Invalid URL scheme in verification email:', url.slice(0, 20))
    return
  }
  try {
    await getResend().emails.send({
      from: fromAddress,
      to,
      subject: 'Verify your email - Eritrean Kings & Queens',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #4a1942; margin: 0;">Eritrean Kings & Queens</h1>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="color: #4a1942; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              Click the button below to verify your email address and complete your registration.
            </p>
            <a href="${url}" style="display: inline-block; background: #d4a843; color: #4a1942; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Verify Email
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }
}

export async function sendPasswordResetEmail(to: string, url: string) {
  if (!resendApiKey) return
  // Validate URL scheme to prevent javascript: injection
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('Invalid URL scheme in password reset email:', url.slice(0, 20))
    return
  }
  try {
    await getResend().emails.send({
      from: fromAddress,
      to,
      subject: 'Reset your password - Eritrean Kings & Queens',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #4a1942; margin: 0;">Eritrean Kings & Queens</h1>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="color: #4a1942; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              Click the button below to reset your password. This link will expire in 1 hour.
            </p>
            <a href="${url}" style="display: inline-block; background: #d4a843; color: #4a1942; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }
}

export async function sendVoteConfirmationEmail(
  to: string,
  contestantName: string,
  category: string,
  votesCount: number,
  amount: number
) {
  if (!resendApiKey) return
  try {
    await getResend().emails.send({
      from: fromAddress,
      to,
      subject: `Vote Confirmed - ${votesCount} vote(s) for ${escapeHtml(contestantName)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #4a1942; margin: 0;">Eritrean Kings & Queens</h1>
          </div>
          <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="color: #4a1942; margin-top: 0;">Vote Confirmed! 🎉</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              Your vote has been successfully recorded.
            </p>
            <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: left;">
              <p style="margin: 4px 0;"><strong>Contestant:</strong> ${escapeHtml(contestantName)}</p>
              <p style="margin: 4px 0;"><strong>Category:</strong> ${escapeHtml(category)}</p>
              <p style="margin: 4px 0;"><strong>Votes:</strong> ${votesCount}</p>
              <p style="margin: 4px 0;"><strong>Amount Paid:</strong> $${amount.toFixed(2)}</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
              Thank you for supporting Eritrean Kings & Queens!
            </p>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send vote confirmation email:', error)
  }
}
