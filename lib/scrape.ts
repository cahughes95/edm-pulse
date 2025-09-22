import * as cheerio from 'cheerio'
export type RawEvent = { title:string; start:string; venue:string; address?:string; price?:string; age?:string; source?:string; tickets?:string; image?:string; genres?:string[] }
const Urls = { la: 'https://19hz.info/eventlisting_LosAngeles.php' }
export async function fetchLA(): Promise<string> {
  const res = await fetch(Urls.la, { headers: { 'user-agent':'Mozilla/5.0 (compatible; EDM-Pulse-Bot/1.0; +https://www.edm-pulse.com)' }, next: { revalidate: 0 }})
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  return await res.text()
}
export function parseLA(html: string): RawEvent[] {
  const $ = cheerio.load(html); const rows: RawEvent[] = []
  $('table tr').each((_, tr) => {
    const tds = $(tr).find('td'); if (tds.length < 2) return
    const text = $(tr).text().trim(); if (!text) return
    const title = $(tr).find('a').first().text().trim() || $(tds[1]).text().trim()
    const source = $(tr).find('a').first().attr('href') || undefined
    const dateText = text.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^\n,\r]*\d{1,2}.*\d{4}|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/i)?.[0] || text.match(/\b\w+\s\d{1,2},\s?\d{4}\b/)?.[0]
    const timeText = text.match(/\b\d{1,2}:\d{2}\s?(AM|PM)\b/i)?.[0] || text.match(/\b\d{1,2}\s?(AM|PM)\b/i)?.[0]
    const when = [dateText, timeText].filter(Boolean).join(' ')
    const venue = ($(tds[2]).text() || $(tds[1]).text()).trim() || 'Los Angeles Venue'
    if (title && when) { const start = new Date(when).toISOString(); rows.push({ title, start, venue, source }) }
  })
  const seen = new Set<string>(); const out: RawEvent[] = []
  for (const r of rows) { const key = `${r.title.toLowerCase()}|${new Date(r.start).toISOString().slice(0,10)}|${r.venue.toLowerCase()}`; if (seen.has(key)) continue; seen.add(key); out.push(r) }
  return out
}
