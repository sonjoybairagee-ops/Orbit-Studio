// Example: how your browser extension talks to the platform.
// Drop this logic into your extension's background/service worker.

const API = 'https://your-domain.com'

// A stable per-install device id (persisted in extension storage).
async function getDeviceId() {
  const { deviceId } = await chrome.storage.local.get('deviceId')
  if (deviceId) return deviceId
  const id = crypto.randomUUID()
  await chrome.storage.local.set({ deviceId: id })
  return id
}

// Call once when the user pastes their license key.
export async function activate(licenseKey) {
  const deviceId = await getDeviceId()
  const res = await fetch(`${API}/api/license/activate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ key: licenseKey, deviceId }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  await chrome.storage.local.set({ licenseToken: json.token })
  return json
}

// Call on startup (and periodically). Works offline until the JWT expires.
export async function isValid() {
  const deviceId = await getDeviceId()
  const { licenseToken } = await chrome.storage.local.get('licenseToken')
  if (!licenseToken) return false
  const res = await fetch(`${API}/api/license/validate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: licenseToken, deviceId }),
  })
  const json = await res.json()
  return json.valid === true
}
