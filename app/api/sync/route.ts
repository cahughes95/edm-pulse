import { NextResponse } from 'next/server'
import { fetchLA, parseLA } from '@/lib/scrape'
import { supabaseAdmin } from '@/lib/db'
import { eventFingerprint } from '@/lib/fingerprint'
import { revalidatePath } from 'next/cache'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json({ ok:false, error:'Supabase env not set' }, { status:500 })
    const html = await fetchLA(); const items = parseLA(html)
    let upserted = 0; const now = new Date().toISOString()
    for (const ev of items) {
      const uid = eventFingerprint(ev.title, ev.start, ev.venue)
      const row = { uid, title: ev.title, start: ev.start, venue: ev.venue, source: ev.source || null, updated_at: now, city:'Los Angeles', status:'active' }
      const { error } = await supabaseAdmin.from('events').upsert(row, { onConflict: 'uid' }); if (error) throw error; upserted++
    }
    const cutoff = new Date(Date.now() - 3*24*3600*1000).toISOString()
    const { error: staleErr } = await supabaseAdmin.from('events').update({ status:'stale' }).lt('updated_at', cutoff).eq('city','Los Angeles')
    if (staleErr) throw staleErr
    revalidatePath('/')
    return NextResponse.json({ ok:true, count: upserted })
  } catch (e:any) { return NextResponse.json({ ok:false, error:e.message||String(e) }, { status:500 }) }
}
