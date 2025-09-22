import { getAllEvents, getEventByUid } from '@/lib/events'
import { EventJSONLD } from '@/lib/jsonld'
import type { Metadata } from 'next'
export const revalidate = 3600
type Props = { params: { uid: string } }
export async function generateStaticParams() {
  const events = await getAllEvents()
  return events.slice(0, 200).map(e => ({ uid: e.uid }))
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getEventByUid(params.uid); if (!e) return {}
  return { title: `${e.title} @ ${e.venue} · ${new Date(e.start).toLocaleDateString()}`, description: e.summary || `Electronic event at ${e.venue} in Los Angeles.` }
}
export default async function EventPage({ params }: Props) {
  const e = await getEventByUid(params.uid)
  if (!e) return <div className="py-20 text-center text-gray-400">Event not found.</div>
  return (
    <article className="grid gap-6 md:grid-cols-3">
      <div className="card md:col-span-2">
        <h1 className="text-2xl font-semibold">{e.title}</h1>
        <p className="text-gray-400 mt-1">{new Date(e.start).toLocaleString()} — {e.venue}</p>
        {e.image && (<img src={e.image} alt={e.title} className="rounded-xl w-full h-auto mt-4" />)}
        <div className="mt-4 space-x-2">
          {e.genres?.map(g => <span key={g} className="badge">{g}</span>)}
          {e.age && <span className="badge">{e.age}</span>}
        </div>
        {e.summary && <p className="mt-4 text-gray-300">{e.summary}</p>}
      </div>
      <aside className="space-y-4">
        <div className="card">
          <h3 className="font-medium mb-2">Details</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li><strong>Venue:</strong> {e.venue}</li>
            {e.address && <li><strong>Address:</strong> {e.address}</li>}
            {e.price && <li><strong>Price:</strong> {e.price}</li>}
            {e.source && <li><strong>Source:</strong> <a className="link" href={e.source} target="_blank">Link</a></li>}
            {e.tickets && <li><strong>Tickets:</strong> <a className="link" href={e.tickets} target="_blank">Buy</a></li>}
          </ul>
        </div>
      </aside>
      <EventJSONLD event={e} />
    </article>
  )
}
