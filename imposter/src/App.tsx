import { useState } from 'react'
import ClassicApp from './modes/ClassicApp'
import SpyfallApp from './modes/SpyfallApp'

export default function App() {
  const [mode, setMode] = useState<'classic'|'spyfall' | null>(null)
  return (
    <main style={{minHeight:'100vh',fontFamily:'system-ui, sans-serif',background:'#111',color:'#fff',display:'grid',placeItems:'center',padding:'clamp(12px, 4vw, 24px)'}}>
      {!mode && (
        <section style={{background:'linear-gradient(135deg, #1c1c1c 0%, #1a1a1a 100%)',borderRadius:12,padding:'clamp(16px, 5vw, 24px)',boxShadow:'0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',maxWidth:600,width:'100%'}}>
          <h1 style={{marginTop:0,fontSize:'clamp(20px, 5vw, 28px)'}}>Velg modus / Choose mode</h1>
          <div style={{display:'grid',gap:'clamp(12px, 3vw, 16px)'}}>
            <button onClick={()=>setMode('classic')} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'2px solid #4f46e5',background:'#4f46e5',color:'#fff',fontWeight:600,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(79,70,229,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 16px rgba(79,70,229,0.4)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 12px rgba(79,70,229,0.3)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>Klassisk / Classic</button>
            <button onClick={()=>setMode('spyfall')} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'2px solid #22c55e',background:'#22c55e',color:'#000',fontWeight:700,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(34,197,94,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 16px rgba(34,197,94,0.4)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 12px rgba(34,197,94,0.3)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>Spyfall</button>
          </div>
        </section>
      )}
      {mode==='classic' && <ClassicApp onChangeMode={(m)=>setMode(m)} />}
      {mode==='spyfall' && <SpyfallApp onChangeMode={(m)=>setMode(m)} />}
    </main>
  )
}
