import { MetadataRoute } from 'next'
import { getAllEvents } from '@/lib/events'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || 'https://www.edm-pulse.com'
  const events = await getAllEvents()
  const urls: MetadataRoute.Sitemap = [{ url: `${base}/`, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 }]
  for (const e of events.slice(0,1000)) {
    urls.push({ url: `${base}/events/${e.uid}`, lastModified: new Date(e.updatedAt || e.start), changeFrequency: 'daily', priority: 0.7 })
  }
  return urls
}
