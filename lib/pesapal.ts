/**
 * PesaPal Payment Integration
 *
 * Handles authentication, order submission, and transaction status
 * for PesaPal v3 API (sandbox & production).
 */

interface PesapalAuthResponse {
  token: string
  expiryDate: string
  error: string | null
  status: string
  message: string
}

interface PesapalOrderRequest {
  id: string
  currency: string
  amount: number
  description: string
  callback_url: string
  notification_id: string
  billing_address: {
    email_address: string
    first_name?: string
    last_name?: string
  }
}

interface PesapalOrderResponse {
  order_tracking_id: string
  merchant_reference: string
  redirect_url: string
  error: string | null
  status: string
}

interface PesapalTransactionStatus {
  payment_method: string
  amount: number
  created_date: string
  confirmation_code: string
  payment_status_description: string
  description: string
  message: string
  payment_account: string
  call_back_url: string
  status_code: number
  merchant_reference: string
  payment_status_code: string
  currency: string
  error: { error_type: string; code: string; message: string } | null
  status: string
}

interface PesapalIPNRegistration {
  url: string
  created_date: string
  ipn_id: string
  error: string | null
  status: string
}

function getPesapalApiUrl(): string {
  const url = process.env.PESAPAL_API_URL
  if (!url) {
    console.warn(
      '[PesaPal] PESAPAL_API_URL is not set. Falling back to sandbox. ' +
      'Set PESAPAL_API_URL in your environment (production: https://pay.pesapal.com/v3)'
    )
    return 'https://cybqa.pesapal.com/pesapalv3'
  }
  return url
}

let cachedToken: { token: string; expiresAt: Date } | null = null
let cachedIpnId: { id: string; url: string } | null = null

/**
 * Authenticate with PesaPal and get a bearer token.
 * Caches the token until it's near expiry.
 */
export async function getPesapalToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > new Date()) {
    return cachedToken.token
  }

  const consumerKey = process.env.PESAPAL_CONSUMER_KEY
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error('PesaPal credentials are not configured')
  }

  const apiUrl = getPesapalApiUrl()
  console.log(`[PesaPal] Authenticating via ${apiUrl} (key prefix: ${consumerKey.slice(0, 6)}...)`)

  const response = await fetch(`${apiUrl}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '(no body)')
    throw new Error(`PesaPal auth failed: HTTP ${response.status} from ${apiUrl} — ${body}`)
  }

  const data: PesapalAuthResponse = await response.json()

  if (data.error) {
    throw new Error(`PesaPal auth error: ${JSON.stringify(data.error)} (url: ${apiUrl})`)
  }

  // Cache token with 5-minute buffer before expiry
  const expiresAt = new Date(data.expiryDate)
  expiresAt.setMinutes(expiresAt.getMinutes() - 5)
  cachedToken = { token: data.token, expiresAt }

  return data.token
}

/**
 * Register an IPN (Instant Payment Notification) URL with PesaPal.
 * Caches the IPN ID so repeated calls with the same URL skip the network round-trip.
 */
export async function registerIPN(ipnUrl: string): Promise<string> {
  if (cachedIpnId?.url === ipnUrl) {
    return cachedIpnId.id
  }
  const token = await getPesapalToken()
  const apiUrl = getPesapalApiUrl()
  console.log(`[PesaPal] Registering IPN: ${ipnUrl}`)

  const response = await fetch(`${apiUrl}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: 'GET',
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '(no body)')
    throw new Error(`PesaPal IPN registration failed: HTTP ${response.status} — ${body}`)
  }

  const data: PesapalIPNRegistration = await response.json()

  if (data.error) {
    throw new Error(`PesaPal IPN error: ${JSON.stringify(data.error)}`)
  }

  cachedIpnId = { id: data.ipn_id, url: ipnUrl }
  return data.ipn_id
}

/**
 * Submit a payment order to PesaPal.
 */
export async function submitOrder(params: {
  merchantReference: string
  amount: number
  currency?: string
  description: string
  callbackUrl: string
  ipnId: string
  email: string
  firstName?: string
  lastName?: string
}): Promise<PesapalOrderResponse> {
  const token = await getPesapalToken()

  const orderRequest: PesapalOrderRequest = {
    id: params.merchantReference,
    currency: params.currency || 'USD',
    amount: params.amount,
    description: params.description,
    callback_url: params.callbackUrl,
    notification_id: params.ipnId,
    billing_address: {
      email_address: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
    },
  }

  const apiUrl = getPesapalApiUrl()
  const response = await fetch(`${apiUrl}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderRequest),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '(no body)')
    throw new Error(`PesaPal order submission failed: HTTP ${response.status} — ${body}`)
  }

  const data: PesapalOrderResponse = await response.json()

  if (data.error) {
    throw new Error(`PesaPal order error: ${data.error}`)
  }

  return data
}

/**
 * Get the status of a PesaPal transaction.
 */
export async function getTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
  const token = await getPesapalToken()

  const apiUrl = getPesapalApiUrl()
  const response = await fetch(
    `${apiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const body = await response.text().catch(() => '(no body)')
    throw new Error(`PesaPal transaction status failed: HTTP ${response.status} — ${body}`)
  }

  const data: PesapalTransactionStatus = await response.json()

  return data
}
