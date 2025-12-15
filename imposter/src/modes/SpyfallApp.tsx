import { useEffect, useMemo, useState } from 'react'
import { LOCATIONS, LOCATIONS_NO } from '../data/locations'
import { ROLES_EN, ROLES_NO } from '../data/location_roles.js'
import SpyfallDescriptionNO from '../content/spyfall_no'

type Phase = 'setup' | 'howto' | 'pre-reveal' | 'reveal' | 'discussion' | 'reveal-result'
type Language = 'no' | 'en'

type GameState = {
  playerCount: number
  imposterIndices: number[]
  location: string
  roleAssignments: (string | null)[]
  currentRevealIndex: number
  timerEnabled: boolean
  timerSeconds: number
}

function randomInt(maxExclusive: number) { return Math.floor(Math.random() * maxExclusive) }
function getLocations(lang: Language) { return lang === 'en' ? LOCATIONS : LOCATIONS_NO }
function getRoles(lang: Language) { return lang === 'en' ? ROLES_EN : ROLES_NO }

function Card(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section style={{background:'#1c1c1c',borderRadius:12,padding:24,boxShadow:'0 6px 16px rgba(0,0,0,0.35)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1 style={{fontSize:28,marginTop:0,marginBottom:0}}>{props.title}</h1>
        {props.right && (
          <div aria-hidden="true" style={{marginLeft:12}}>{props.right}</div>
        )}
      </div>
      <div>{props.children}</div>
    </section>
  )
}

export default function SpyfallApp({ onChangeMode }: { onChangeMode?: (m: 'classic'|'spyfall') => void }) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [language, setLanguage] = useState<Language>('no')
  const [state, setState] = useState<GameState | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const canStart = useMemo(() => {
    if (!state) return false
    return state.playerCount >= 3 && state.playerCount <= 15
  }, [state])

  function initGame(playerCount: number, imposterCount: number, timerEnabled: boolean, timerSeconds: number) {
    const locations = getLocations(language)
    const location = locations[randomInt(locations.length)]
    const roles = getRoles(language)[location] || []

    const indices: number[] = []
    while (indices.length < imposterCount) { const r = randomInt(playerCount); if (!indices.includes(r)) indices.push(r) }
    const roleAssignments: (string|null)[] = new Array(playerCount).fill(null)
    let rolePool = [...roles]
    for (let i=0; i<playerCount; i++) {
      if (indices.includes(i)) { roleAssignments[i] = null }
      else {
        if (rolePool.length === 0) rolePool = [...roles]
        const idx = randomInt(rolePool.length)
        roleAssignments[i] = rolePool[idx]
        rolePool.splice(idx,1)
      }
    }

    const gameState: GameState = { playerCount, imposterIndices: indices.sort((a,b)=>a-b), location, roleAssignments, currentRevealIndex: 0, timerEnabled, timerSeconds }
    setState(gameState)
    setPhase('pre-reveal')
  }

  function nextReveal() {
    if (!state) return
    const next = state.currentRevealIndex + 1
    if (next >= state.playerCount) { setPhase('discussion'); return }
    setState({ ...state, currentRevealIndex: next })
  }

  function startCountdown() {
    if (!state || !state.timerEnabled) { setCountdown(null); return }
    setCountdown(state.timerSeconds)
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c === null) { clearInterval(id); return c }
        const next = c - 1
        if (next <= 0) { clearInterval(id); setPhase('reveal-result') }
        return next
      })
    }, 1000)
  }

  function reset() { setPhase('setup'); setState(null); setCountdown(null) }

  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px'}}>
      <div style={{width:'100%',boxSizing:'border-box'}}>
        {phase === 'setup' && (
          <Setup onStart={initGame} language={language} onLanguageChange={(l)=>{ setLanguage(l); try { localStorage.setItem('imposterwho:lang', l) } catch {} }} onOpenHowTo={()=>setPhase('howto')} onChangeMode={onChangeMode} />
        )}
        {phase === 'howto' && (
          <HowTo language={language} onBack={()=>setPhase('setup')} />
        )}
        {phase === 'reveal' && state && (
          <Reveal
            playerIndex={state.currentRevealIndex}
            totalPlayers={state.playerCount}
            isImposter={state.imposterIndices.includes(state.currentRevealIndex)}
            location={state.location}
            role={state.roleAssignments[state.currentRevealIndex]}
            onNext={nextReveal}
            language={language}
          />
        )}
        {phase === 'pre-reveal' && state && (
          <PreReveal language={language} location={state.location} onBegin={() => setPhase('reveal')} />
        )}
        {phase === 'discussion' && state && (
          <Discussion location={state.location} onStartTimer={startCountdown} timerEnabled={state.timerEnabled} seconds={state.timerSeconds} countdown={countdown} onEnd={() => setPhase('reveal-result')} language={language} />
        )}
        {phase === 'reveal-result' && state && (
          <Result imposterIndices={state.imposterIndices} location={state.location} onRestart={reset} language={language} />
        )}
      </div>
    </main>
  )
}

function PreReveal({ language, location, onBegin }: { language: Language; location: string; onBegin: () => void }) {
  return (
    <Card title={language==='en' ? 'Spyfall – Setup' : 'Spyfall – Oppsett'}>
      <div style={{display:'grid',gap:16,textAlign:'center'}}>
        <div style={{opacity:0.8}}>{language==='en' ? 'Hand the device to player 1 who will reveal their role.' : 'Gi enheten til spiller 1 som vil avsløre sin rolle.'}</div>
        <div style={{opacity:0.7,fontSize:14}}>{language==='en' ? 'Note: The location is hidden here to avoid revealing it if player 1 is the Spy.' : 'Merk: Stedet vises ikke her for å unngå avsløring hvis spiller 1 er spion.'}</div>
        <button onClick={onBegin} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600}}>{language==='en' ? 'Show first player' : 'Vis første spiller'}</button>
      </div>
    </Card>
  )
}

function Setup({ onStart, language, onLanguageChange, onOpenHowTo, onChangeMode }: { onStart: (players: number, imposters: number, timerEnabled: boolean, timerSeconds: number) => void; language: Language; onLanguageChange: (l: Language) => void; onOpenHowTo: () => void; onChangeMode?: (m: 'classic'|'spyfall') => void }) {
  const [players, setPlayers] = useState(6)
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [seconds, setSeconds] = useState(480)
  const maxImposters = Math.max(1, Math.floor(players / 3))
  const [imposters, setImposters] = useState(1)
  const safeImposters = Math.min(imposters, maxImposters)
  const playersValid = players >= 3 && players <= 15
  const impostersValid = safeImposters >= 1 && safeImposters <= maxImposters

  useEffect(() => {
    try {
      const raw = localStorage.getItem('spyfall:setup')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed.players === 'number') setPlayers(parsed.players)
        if (typeof parsed.imposters === 'number') setImposters(parsed.imposters)
        if (typeof parsed.timerEnabled === 'boolean') setTimerEnabled(parsed.timerEnabled)
        if (typeof parsed.seconds === 'number') setSeconds(parsed.seconds)
      }
      const langRaw = localStorage.getItem('imposterwho:lang')
      if (langRaw === 'en' || langRaw === 'no') onLanguageChange(langRaw)
    } catch {}
  }, [])

  useEffect(() => {
    const payload = { players, imposters: safeImposters, timerEnabled, seconds }
    try { localStorage.setItem('spyfall:setup', JSON.stringify(payload)) } catch {}
  }, [players, safeImposters, timerEnabled, seconds])

  return (
    <Card title={language==='en' ? 'Spyfall – Setup' : 'Spyfall – Oppsett'}>
      <div style={{display:'grid',gap:16}}>
        {onChangeMode && (
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={()=>onChangeMode('classic')} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}}>{language==='en' ? 'Switch to Classic' : 'Bytt til Klassisk'}</button>
          </div>
        )}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <label style={{display:'grid',gap:8}}>
            <span>{language==='en' ? 'Language' : 'Språk'}</span>
            <select value={language} onChange={(e)=>onLanguageChange((e.target.value as Language))} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}}>
              <option value="no">Norsk</option>
              <option value="en">English</option>
            </select>
          </label>
          <button type="button" onClick={onOpenHowTo} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}}>{language==='en' ? 'How to play' : 'Hvordan spille'}</button>
        </div>

        <label style={{display:'grid',gap:8}}>
          <span>{language==='en' ? 'Players (3–15)' : 'Antall spillere (3–15)'}</span>
          <input type="number" min={3} max={15} value={players} onChange={(e)=>setPlayers(parseInt(e.target.value || '0',10))} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}} />
        </label>
        {!playersValid && (<div style={{color:'#fca5a5'}}>{language==='en' ? 'Player count must be between 3 and 15.' : 'Antall spillere må være mellom 3 og 15.'}</div>)}

        <label style={{display:'grid',gap:8}}>
          <span>{(language==='en' ? 'Spies (max {max})' : 'Spioner (maks {max})').replace('{max}', String(maxImposters))}</span>
          <input type="number" min={1} max={maxImposters} value={safeImposters} onChange={(e)=>setImposters(parseInt(e.target.value || '1',10))} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}} />
        </label>
        {!impostersValid && (<div style={{color:'#fca5a5'}}>{(language==='en' ? 'Spies must be between 1 and {max}.' : 'Antall spioner må være mellom 1 og {max}.').replace('{max}', String(maxImposters))}</div>)}

        <label style={{display:'flex',alignItems:'center',gap:12}}>
          <input type="checkbox" checked={timerEnabled} onChange={(e)=>setTimerEnabled(e.target.checked)} />
          <span>{language==='en' ? 'Discussion timer' : 'Timer under diskusjon'}</span>
        </label>
        {timerEnabled && (
          <label style={{display:'grid',gap:8}}>
            <span>{language==='en' ? 'Timer seconds' : 'Timer-sekunder'}</span>
            <input type="number" min={60} max={1200} value={seconds} onChange={(e)=>setSeconds(parseInt(e.target.value || '480',10))} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}} />
          </label>
        )}

        <button disabled={!playersValid || !impostersValid} onClick={()=>onStart(players, safeImposters, timerEnabled, seconds)} style={{padding:'12px 16px',borderRadius:8,border:'none',background:(!playersValid||!impostersValid)?'#374151':'#22c55e',color:'#000',fontWeight:700}}>{language==='en' ? 'Start' : 'Start'}</button>
      </div>
    </Card>
  )
}

function Reveal({ playerIndex, totalPlayers, isImposter, location, role, onNext, language }: { playerIndex: number; totalPlayers: number; isImposter: boolean; location: string; role: string | null; onNext: () => void; language: Language }) {
  const [visible, setVisible] = useState(true)
  const isLast = playerIndex + 1 >= totalPlayers
  return (
    <Card title={(language==='en' ? 'Player # {cur}/{total}' : 'Spiller # {cur}/{total}').replace('{cur}', String(playerIndex+1)).replace('{total}', String(totalPlayers))} right={
      <div style={{fontSize:32,filter: isImposter ? 'drop-shadow(0 0 6px rgba(225,29,72,0.6))' : 'drop-shadow(0 0 6px rgba(34,197,94,0.6))',transform:'scale(0.9)',transition:'transform 250ms ease, filter 250ms ease',animation:'iconfade 350ms ease'}} onMouseEnter={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }} onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.9)' }}>{isImposter ? '🎭' : '🛡️'}</div>
    }>
      <div style={{display:'grid',gap:24,textAlign:'center'}}>
        <div style={{opacity:visible?1:0,transition:'opacity 300ms'}}>
          {!isImposter && (
            <>
              <div style={{fontSize:18,opacity:0.85}}>{language==='en' ? 'Location' : 'Sted'}</div>
              <div style={{fontSize:40,fontWeight:800,marginBottom:16}}>{location}</div>
            </>
          )}
          {isImposter ? (
            <>
              <div style={{fontSize:20,opacity:0.85}}>{language==='en' ? 'You are' : 'Du er'}</div>
              <div style={{fontSize:36,fontWeight:700,marginBottom:12}}>{language==='en' ? 'Spy' : 'Spion'}</div>
              <div style={{opacity:0.85,marginTop:8}}>{language==='en' ? 'You do not know the location' : 'Du kjenner ikke stedet'}</div>
            </>
          ) : (
            <>
              <div style={{fontSize:18,opacity:0.85}}>{language==='en' ? 'Your role' : 'Din rolle'}</div>
              <div style={{fontSize:24,fontWeight:700}}>{role || (language==='en' ? 'Visitor' : 'Besøkende')}</div>
            </>
          )}
        </div>
        {visible ? (
          <button onClick={()=>{ setVisible(false) }} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#e11d48',color:'#fff',fontWeight:600}}>{language==='en' ? 'OK / Hide' : 'OK / Skjul'}</button>
        ) : (
          <button onClick={()=>{ setVisible(true); onNext(); }} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700}}>{isLast ? (language==='en' ? 'Start round' : 'Start runde') : (language==='en' ? 'Show player # {num}' : 'Vis spiller # {num}').replace('{num}', String(playerIndex+2))}</button>
        )}
      </div>
    </Card>
  )
}

const styleEl = document.getElementById('imposter-style')
if (!styleEl) {
  const el = document.createElement('style')
  el.id = 'imposter-style'
  el.innerHTML = `
    *, *::before, *::after { box-sizing: border-box; }
    @keyframes iconfade { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(0.9); } }
  `
  document.head.appendChild(el)
}

function Discussion({ location, onStartTimer, timerEnabled, seconds, countdown, onEnd, language }: { location: string; onStartTimer: () => void; timerEnabled: boolean; seconds: number; countdown: number | null; onEnd: () => void; language: Language }) {
  return (
    <Card title={language==='en' ? 'Discussion' : 'Diskusjon'}>
      <div style={{display:'grid',gap:16,textAlign:'center'}}>
        {/* Location intentionally hidden during discussion to avoid revealing to the Spy */}
        {timerEnabled ? (
          <div>
            {countdown === null ? (
              <button onClick={onStartTimer} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600}}>{(language==='en' ? 'Start timer ({seconds}s)' : 'Start timer ({seconds}s)').replace('{seconds}', String(seconds))}</button>
            ) : (
              <div style={{fontSize:48,fontWeight:800}}>{countdown}</div>
            )}
          </div>
        ) : (
          <div style={{opacity:0.8}}>{language==='en' ? 'Timer off. Press "Next" when ready.' : 'Timer av. Trykk "Neste" når dere er klare.'}</div>
        )}
        <button onClick={onEnd} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700}}>{language==='en' ? 'Start voting' : 'Start avstemning'}</button>
      </div>
    </Card>
  )
}

function Result({ imposterIndices, location, onRestart, language }: { imposterIndices: number[]; location: string; onRestart: () => void; language: Language }) {
  return (
    <Card title={language==='en' ? 'Result' : 'Resultat'}>
      <div style={{display:'grid',gap:16,textAlign:'center'}}>
        <div style={{fontSize:20}}>{language==='en' ? 'Location' : 'Sted'}</div>
        <div style={{fontSize:40,fontWeight:800}}>{location}</div>
        <div style={{fontSize:20,marginTop:16}}>{(language==='en' ? 'Spies:' : 'Spion(er):')} {imposterIndices.map(i=>`#${i+1}`).join(', ')}</div>
        <button onClick={onRestart} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600}}>{language==='en' ? 'Start new game' : 'Start nytt spill'}</button>
      </div>
    </Card>
  )
}

function HowTo({ language, onBack }: { language: Language; onBack: () => void }) {
  return (
    <Card title={language==='en' ? 'How to Play Spyfall' : 'Hvordan spille Spyfall'}>
      <div style={{display:'grid',gap:12}}>
        {language==='en' ? (
          <div>
            So fun that you asked about <b>Spyfall</b>! It's a popular party game of bluffing and asking the right (and wrong) questions.
            <hr />
            <h3>🕵️ How Spyfall Works</h3>
            <p>Spyfall is played over short rounds, typically with 3–8 players.</p>
            <h4>1. Round Setup</h4>
            <ul>
              <li>Everyone receives a card.</li>
              <li><b>Non-spies</b> receive a card that shows the same <b>secret location</b> and a unique <b>role</b> at that place.</li>
              <li><b>One player</b> receives a card with <b>"Spy"</b> and does <b>not</b> know the location.</li>
            </ul>
            <h4>2. Goals</h4>
            <table><thead><tr><th>Group</th><th>Goal</th></tr></thead><tbody><tr><td><b>Non-spies</b></td><td>Identify and accuse the Spy <b>before</b> the Spy guesses the location.</td></tr><tr><td><b>Spy</b></td><td>Listen and deduce the location while avoiding suspicion.</td></tr></tbody></table>
            <h4>3. Questions & Answers</h4>
            <ul>
              <li>A timed round starts (often 8 minutes).</li>
              <li>Players take turns asking questions about the place.</li>
              <li><b>Non-spies</b> should be specific enough to signal they know the place, but vague enough to avoid giving it away.</li>
              <li><b>Spy</b> must answer carefully and ask clever questions to blend in.</li>
            </ul>
            <blockquote><b>Example:</b> If the location is "Circus", ask: "Why are you dressed so strangely?"</blockquote>
            <h4>4. Ending the Round</h4>
            <ol>
              <li><b>Accusation:</b> Any player may accuse; if everyone agrees, reveal the card. If it's the Spy, non-spies win; otherwise the Spy wins.</li>
              <li><b>Spy guesses location:</b> If correct, Spy wins; if wrong, non-spies win.</li>
              <li><b>Time ends:</b> Final accusation vote proceeds; correct = non-spies win; wrong/no consensus = Spy wins.</li>
            </ol>
          </div>
        ) : (
          <SpyfallDescriptionNO />
        )}
        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <button onClick={onBack} style={{padding:'8px 12px',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600}}>{language==='en' ? 'Back' : 'Tilbake'}</button>
        </div>
      </div>
    </Card>
  )
}
