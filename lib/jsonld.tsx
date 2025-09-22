'use client'
import Head from 'next/head'
import type { EventItem } from './events'
export function EventJSONLD({ event }: { event: EventItem }) {
  const data:any = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: event.title, startDate: event.start, endDate: event.end_time || event.start,
    eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type':'Place', name: event.venue, address: event.address || 'Los Angeles, CA' },
    image: event.image?[event.image]:undefined, description: event.summary || `Electronic music event at ${event.venue} in Los Angeles.`,
    offers: event.tickets ? { '@type':'Offer', url: event.tickets, availability:'https://schema.org/InStock', price: event.price || undefined, priceCurrency:'USD', validFrom: event.updatedAt || event.start } : undefined,
    url: event.url || undefined
  }
  return (<Head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} /></Head>)
}
