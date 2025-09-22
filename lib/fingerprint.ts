import crypto from 'crypto'
export function eventFingerprint(title: string, startISO: string, venue: string) {
  const basis = `${title.trim().toLowerCase()}|${new Date(startISO).toISOString().slice(0,10)}|${venue.trim().toLowerCase()}`
  return crypto.createHash('sha1').update(basis).digest('hex')
}
