import data from '@/data/events.json'
import { supabaseRead } from '@/lib/db'

export type EventItem = {
  uid: string
  title: string
  start: string
  end_time?: string
  venue: string
  address?: string
  city?: string
  genres?: string[]
  price?: string
  age?: string
  image?: string
  source?: string
  tickets?: string
  url?: string
  updatedAt?: string
  summary?: string
}

export async function getAllEvents(): Promise<EventItem[]> {
  if (supabaseRead) {
    const { data: rows, error } = await supabaseRead
      .from('events')
      .select('uid, title, start, end_time, venue, city, price, age, source, tickets, image, updated_at')
      .eq('city','Los Angeles').eq('status','active')
      .gte('start', new Date(Date.now()-2*24*3600*1000).toISOString())
      .order('start')
    if (!error && rows) {
      return rows.map((r:any)=>({ uid:r.uid, title:r.title, start:r.start, venue:r.venue, city:r.city,
        price:r.price||undefined, age:r.age||undefined, source:r.source||undefined, tickets:r.tickets||undefined,
        image:r.image||undefined, updatedAt:r.updated_at||undefined }))
    }
  }
  const items = (data as EventItem[]).slice().sort((a,b)=>new Date(a.start).getTime()-new Date(b.start).getTime())
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-2)
  return items.filter(e=> new Date(e.start)>=cutoff)
}

export async function getEventByUid(uid:string){ const all=await getAllEvents(); return all.find(e=>e.uid===uid) }

export function groupByDate(events: EventItem[]){
  const fmt=(d:Date)=> d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})
  return events.reduce<Record<string,EventItem[]>>((acc,e)=>{ const key=fmt(new Date(e.start)); (acc[key]??=[]).push(e); return acc },{})
}
