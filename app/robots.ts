import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || 'https://www.edm-pulse.com'
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/'] }, sitemap: `${base}/sitemap.xml` }
}
