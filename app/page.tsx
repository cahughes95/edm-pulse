import { EventCard } from '@/lib/ui'
import { getAllEvents, groupByDate } from '@/lib/events'
import type { Metadata } from 'next'
export const revalidate = 3600
export const metadata: Metadata = { title: 'LA Electronic Music Events Calendar', description: 'Upcoming techno/house/electronic events in Los Angeles. Updated frequently.' }

export default async function Home() {
  const events = await getAllEvents()
  const grouped = groupByDate(events)
  return (
    <div className="space-y-10">
      <section className="card">
        <h1 className="text-2xl font-semibold">Los Angeles Electronic Events</h1>
        <p className="text-gray-400 mt-2">Techno, house, bass & more. Auto-refreshed.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="px-3 py-2 rounded-md bg-black/30 border border-white/10" placeholder="Search title or venue" name="q" />
          <select className="px-3 py-2 rounded-md bg-black/30 border border-white/10" name="genre">
            <option value="">All genres</option><option>Techno</option><option>House</option><option>Bass</option><option>Trance</option>
          </select>
          <input type="date" className="px-3 py-2 rounded-md bg-black/30 border border-white/10" name="from" />
          <input type="date" className="px-3 py-2 rounded-md bg-black/30 border border-white/10" name="to" />
        </form>
      </section>
      {Object.entries(grouped).map(([date, items]) => (
        <section key={date} id={date} className="space-y-4">
          <h2 className="text-xl font-semibold">{date}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(ev => <EventCard key={ev.uid} event={ev} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
