'use client'
import Link from 'next/link'
import type { EventItem } from './events'
export function EventCard({ event }: { event: EventItem }) {
  return (
    <div className="card flex flex-col">
      <div className="flex items-center justify-between">
        <span className="badge">{new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
        {event.price && <span className="text-sm text-gray-300">{event.price}</span>}
      </div>
      <h3 className="mt-2 text-lg font-medium leading-snug line-clamp-2">{event.title}</h3>
      <p className="text-sm text-gray-400">{event.venue}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {event.genres?.slice(0,3).map(g => <span key={g} className="badge">{g}</span>)}
        {event.age && <span className="badge">{event.age}</span>}
      </div>
      <div className="mt-4 flex gap-2">
        <Link className="flex-1 text-center bg-brand-600 hover:bg-brand-500 transition rounded-lg py-2 text-sm font-medium" href={`/events/${event.uid}`}>Details</Link>
        {event.tickets ? (
          <a className="flex-1 text-center bg-white/10 hover:bg-white/20 transition rounded-lg py-2 text-sm font-medium" href={event.tickets} target="_blank">Tickets</a>
        ) : event.source ? (
          <a className="flex-1 text-center bg-white/10 hover:bg-white/20 transition rounded-lg py-2 text-sm font-medium" href={event.source} target="_blank">More Info</a>
        ) : null}
      </div>
    </div>
  )
}
