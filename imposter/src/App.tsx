import { useState } from 'react'
import ClassicApp from './modes/ClassicApp'
import SpyfallApp from './modes/SpyfallApp'

export default function App() {
  const [mode, setMode] = useState<'classic'|'spyfall' | null>(null)
  return (
    <main style={{minHeight:'100vh',fontFamily:'system-ui, sans-serif',background:'#111',color:'#fff',display:'grid',placeItems:'center',padding:'24px'}}>
      {!mode && (
        <section style={{background:'#1c1c1c',borderRadius:12,padding:24,boxShadow:'0 6px 16px rgba(0,0,0,0.35)',maxWidth:600}}>
          <h1 style={{marginTop:0}}>Velg modus / Choose mode</h1>
          <div style={{display:'grid',gap:12}}>
            <button onClick={()=>setMode('classic')} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600}}>Klassisk / Classic</button>
            <button onClick={()=>setMode('spyfall')} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700}}>Spyfall</button>
          </div>
        </section>
      )}
      {mode==='classic' && <ClassicApp onChangeMode={(m)=>setMode(m)} />}
      {mode==='spyfall' && <SpyfallApp onChangeMode={(m)=>setMode(m)} />}
    </main>
  )
}
