import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES as NO_CATEGORIES } from '../data/categories'
import EN_CATEGORIES from '../data/categories_en.json'

type Phase = 'setup' | 'pre-reveal' | 'reveal' | 'discussion' | 'reveal-result'
type Language = 'no' | 'en'

type GameState = {
  playerCount: number
  imposterIndices: number[]
  category: string
  secretWord: string
  currentRevealIndex: number
  timerEnabled: boolean
  timerSeconds: number
}

function randomInt(maxExclusive: number) { return Math.floor(Math.random() * maxExclusive) }
function getCategories(lang: Language) { return lang === 'en' ? EN_CATEGORIES : NO_CATEGORIES }

function pickCategoryAndWord(last?: { category?: string; word?: string }, lang: Language = 'no') {
  const HISTORY_KEY = 'imposterwho:history'
  let history: Record<string, string[]> = {}
  try { const raw = localStorage.getItem(HISTORY_KEY); if (raw) history = JSON.parse(raw) } catch {}
  let catCandidates = getCategories(lang)
  if (last?.category) { catCandidates = getCategories(lang).filter((c: any) => c.name !== last.category); if (catCandidates.length === 0) catCandidates = getCategories(lang) }
  const cat = catCandidates[randomInt(catCandidates.length)]
  const catHistory = history[cat.name] || []
  const EXCLUDE_SET = new Set<string>(catHistory)
  let wordCandidates = cat.words.filter((w: string) => !EXCLUDE_SET.has(w))
  if (wordCandidates.length === 0) {
    wordCandidates = cat.words
    if (last?.category === cat.name && last?.word) {
      const alt = cat.words.filter((w: string) => w !== last.word)
      if (alt.length > 0) wordCandidates = alt
    }
  }
  const word = wordCandidates[randomInt(wordCandidates.length)]
  const updated = [...catHistory, word]
  const MAX_HISTORY = 5
  history[cat.name] = updated.slice(Math.max(0, updated.length - MAX_HISTORY))
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) } catch {}
  return { category: cat.name, word }
}

function Card(props: { title: string; children: React.ReactNode; height?: string }) {
  return (
    <section style={{
      background:'linear-gradient(135deg, rgba(79,70,229,0.03), transparent), #1c1c1c',
      borderRadius:12,
      padding:'clamp(16px, 5vw, 24px)',
      boxShadow:'0 8px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
      width:'min(100%, 720px)',
      height: props.height ?? 'min(90vh, 600px)',
      margin:'0 auto',
      display:'flex',
      flexDirection:'column'
    }}>
      <h1 style={{fontSize:'clamp(20px, 5vw, 28px)',marginTop:0}}>{props.title}</h1>
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>{props.children}</div>
    </section>
  )
}

function t(lang: Language, key: string) {
  const no: Record<string,string> = {
    setupTitle: 'Imposter Who – Oppsett',
    language: 'Språk / Language',
    players: 'Antall spillere (3–15)',
    playersInvalid: 'Antall spillere må være mellom 3 og 15.',
    imposters: 'Antall impostere (maks {max})',
    impostersInvalid: 'Antall impostere må være mellom 1 og {max}.',
    timer: 'Timer under diskusjon',
    timerSeconds: 'Timer-sekunder',
    start: 'Start',
    showFirstPlayer: 'Vis første spiller',
    handDeviceToPlayer1: 'Gi enheten til spiller 1 som trykker knappen nedenfor.',
    revealTitle: 'Spiller # {cur}/{total}',
    category: 'Kategori',
    youAre: 'Du er',
    imposter: 'Imposter',
    youDontKnowWord: 'Du kjenner ikke ordet',
    wordIs: 'Ordet er',
    okHide: 'OK / Skjul',
    showPlayerNumber: 'Vis spiller # {num}',
    discussionTitle: 'Diskusjon',
    timerOffHint: 'Timer av. Trykk "Neste" når dere er klare.',
    startTimer: 'Start timer ({seconds}s)',
    startVote: 'Start avstemning',
    resultTitle: 'Resultat',
    secretWord: 'Hemmelig ord',
    impostersWere: 'Imposter(e):',
    startNew: 'Start nytt spill',
  }
  const en: Record<string,string> = {
    setupTitle: 'Imposter Who – Setup',
    language: 'Language',
    players: 'Players (3–15)',
    playersInvalid: 'Player count must be between 3 and 15.',
    imposters: 'Imposters (max {max})',
    impostersInvalid: 'Imposters must be between 1 and {max}.',
    timer: 'Discussion timer',
    timerSeconds: 'Timer seconds',
    start: 'Start',
    showFirstPlayer: 'Show first player',
    handDeviceToPlayer1: 'Hand the device to player 1 who presses the button below.',
    revealTitle: 'Player # {cur}/{total}',
    category: 'Category',
    youAre: 'You are',
    imposter: 'Imposter',
    youDontKnowWord: 'You do not know the word',
    wordIs: 'The word is',
    okHide: 'OK / Hide',
    showPlayerNumber: 'Show player # {num}',
    discussionTitle: 'Discussion',
    timerOffHint: 'Timer off. Press "Next" when ready.',
    startTimer: 'Start timer ({seconds}s)',
    startVote: 'Start voting',
    resultTitle: 'Result',
    secretWord: 'Secret word',
    impostersWere: 'Imposters:',
    startNew: 'Start new game',
  }
  return (lang==='en'?en:no)[key] ?? key
}

export default function ClassicApp({ onChangeMode }: { onChangeMode?: (m: 'classic'|'spyfall') => void }) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [language, setLanguage] = useState<Language>('no')
  const [state, setState] = useState<GameState | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const canStart = useMemo(() => {
    if (!state) return false
    return state.playerCount >= 3 && state.playerCount <= 15
  }, [state])

  function initGame(playerCount: number, imposterCount: number, timerEnabled: boolean, timerSeconds: number) {
    let last: { category?: string; word?: string } | undefined
    try { const raw = localStorage.getItem('imposterwho:last'); if (raw) last = JSON.parse(raw) } catch {}
    const { category, word } = pickCategoryAndWord(last, language)
    const indices: number[] = []
    const targetImposters = Math.min(imposterCount, playerCount)
    while (indices.length < targetImposters) { const r = randomInt(playerCount); if (!indices.includes(r)) indices.push(r) }
    const gameState: GameState = { playerCount, imposterIndices: indices.sort((a,b)=>a-b), category, secretWord: word, currentRevealIndex: 0, timerEnabled, timerSeconds }
    setState(gameState)
    setPhase('pre-reveal')
    try { localStorage.setItem('imposterwho:last', JSON.stringify({ category, word })) } catch {}
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
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'clamp(12px, 4vw, 24px)'}}>
      <div style={{width:'100%',display:'flex',justifyContent:'center'}}>
        {phase === 'setup' && (
          <Setup onStart={initGame} language={language} onLanguageChange={(l)=>{ setLanguage(l); try { localStorage.setItem('imposterwho:lang', l) } catch {} }} onChangeMode={onChangeMode} />
        )}
        {phase === 'reveal' && state && (
          <Reveal
            playerIndex={state.currentRevealIndex}
            totalPlayers={state.playerCount}
            role={state.imposterIndices.includes(state.currentRevealIndex) ? 'Imposter' : 'Borger'}
            word={state.imposterIndices.includes(state.currentRevealIndex) ? 'Imposter' : state.secretWord}
            category={state.category}
            onNext={nextReveal}
            language={language}
          />
        )}
        {phase === 'pre-reveal' && state && (
          <PreReveal language={language} totalPlayers={state.playerCount} onBegin={() => setPhase('reveal')} />
        )}
        {phase === 'discussion' && state && (
          <Discussion category={state.category} onStartTimer={startCountdown} timerEnabled={state.timerEnabled} seconds={state.timerSeconds} countdown={countdown} onEnd={() => setPhase('reveal-result')} language={language} />
        )}
        {phase === 'reveal-result' && state && (
          <Result imposterIndices={state.imposterIndices} word={state.secretWord} onRestart={reset} language={language} />
        )}
      </div>
    </main>
  )
}

function PreReveal({ language, totalPlayers, onBegin }: { language: Language; totalPlayers: number; onBegin: () => void }) {
  return (
    <Card title={t(language,'revealTitle').replace('{cur}', '1').replace('{total}', String(totalPlayers))} height={'min(450px, 75vh)'}>
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'100%'}}>
        <div />
        <div style={{display:'flex',justifyContent:'center'}}>
          <button onClick={onBegin} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(34,197,94,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>
            {t(language,'showPlayerNumber').replace('{num}', '1')}
          </button>
        </div>
      </div>
    </Card>
  )
}

function Setup({ onStart, language, onLanguageChange, onChangeMode }: { onStart: (players: number, imposters: number, timerEnabled: boolean, timerSeconds: number) => void; language: Language; onLanguageChange: (l: Language) => void; onChangeMode?: (m: 'classic'|'spyfall') => void }) {
  const [players, setPlayers] = useState(6)
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [seconds, setSeconds] = useState(60)
  const maxImposters = players
  const [imposters, setImposters] = useState(1)
  const playersValid = players >= 3 && players <= 15
  const impostersValid = imposters >= 1 && imposters <= maxImposters
  const safeImposters = Math.min(imposters, maxImposters)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('imposterwho:setup')
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

  // Ensure imposters stays within valid range when player count changes
  useEffect(() => {
    setImposters((prev) => Math.min(Math.max(1, prev), maxImposters))
  }, [maxImposters])

  useEffect(() => {
    const payload = { players, imposters: safeImposters, timerEnabled, seconds }
    try { localStorage.setItem('imposterwho:setup', JSON.stringify(payload)) } catch {}
  }, [players, safeImposters, timerEnabled, seconds])

  return (
    <Card title={t(language,'setupTitle')}>
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'100%'}}>
        <div style={{display:'grid',gap:'clamp(12px, 3vw, 16px)'}}>
          <label style={{display:'grid',gap:'clamp(6px, 2vw, 8px)'}}>
            <span style={{fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'language')}</span>
            <select value={language} onChange={(e)=>onLanguageChange((e.target.value as Language))} style={{padding:'clamp(10px, 2.5vh, 12px) 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff',fontSize:'clamp(14px, 3.5vw, 16px)'}}>
              <option value="no">Norsk</option>
              <option value="en">English</option>
            </select>
          </label>

          <label style={{display:'grid',gap:'clamp(6px, 2vw, 8px)'}}>
            <span style={{fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'players')}</span>
            <div style={{display:'flex',gap:'clamp(8px, 2vw, 12px)',alignItems:'center'}}>
              <button type="button" onClick={()=>setPlayers(p=>Math.max(3,p-1))} style={{padding:'clamp(12px, 3vh, 16px)',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff',fontSize:'clamp(18px, 5vw, 24px)',fontWeight:700,minWidth:'clamp(44px, 12vw, 56px)',cursor:'pointer',transition:'all 200ms'}} onMouseEnter={(e)=>{e.currentTarget.style.background='#222'}} onMouseLeave={(e)=>{e.currentTarget.style.background='#151515'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.95)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='scale(1)'}}>−</button>
              <div style={{flex:1,textAlign:'center',fontSize:'clamp(24px, 7vw, 32px)',fontWeight:700,padding:'clamp(8px, 2vh, 12px)',borderRadius:8,border:'1px solid #333',background:'#0a0a0a'}}>{players}</div>
              <button type="button" onClick={()=>setPlayers(p=>Math.min(15,p+1))} style={{padding:'clamp(12px, 3vh, 16px)',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff',fontSize:'clamp(18px, 5vw, 24px)',fontWeight:700,minWidth:'clamp(44px, 12vw, 56px)',cursor:'pointer',transition:'all 200ms'}} onMouseEnter={(e)=>{e.currentTarget.style.background='#222'}} onMouseLeave={(e)=>{e.currentTarget.style.background='#151515'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.95)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='scale(1)'}}>+</button>
            </div>
          </label>
          {!playersValid && (<div style={{color:'#fca5a5',fontSize:'clamp(13px, 3.2vw, 14px)'}}>{t(language,'playersInvalid')}</div>)}

          <label style={{display:'grid',gap:'clamp(6px, 2vw, 8px)'}}>
            <span style={{fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'imposters').replace('{max}', String(maxImposters))}</span>
            <div style={{display:'flex',gap:'clamp(8px, 2vw, 12px)',alignItems:'center'}}>
              <button type="button" onClick={()=>setImposters(i=>Math.max(1,i-1))} style={{padding:'clamp(12px, 3vh, 16px)',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff',fontSize:'clamp(18px, 5vw, 24px)',fontWeight:700,minWidth:'clamp(44px, 12vw, 56px)',cursor:'pointer',transition:'all 200ms'}} onMouseEnter={(e)=>{e.currentTarget.style.background='#222'}} onMouseLeave={(e)=>{e.currentTarget.style.background='#151515'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.95)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='scale(1)'}}>−</button>
              <div style={{flex:1,textAlign:'center',fontSize:'clamp(24px, 7vw, 32px)',fontWeight:700,padding:'clamp(8px, 2vh, 12px)',borderRadius:8,border:'1px solid #333',background:'#0a0a0a'}}>{imposters}</div>
              <button type="button" onClick={()=>setImposters(i=>Math.min(maxImposters,i+1))} style={{padding:'clamp(12px, 3vh, 16px)',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff',fontSize:'clamp(18px, 5vw, 24px)',fontWeight:700,minWidth:'clamp(44px, 12vw, 56px)',cursor:'pointer',transition:'all 200ms'}} onMouseEnter={(e)=>{e.currentTarget.style.background='#222'}} onMouseLeave={(e)=>{e.currentTarget.style.background='#151515'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.95)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='scale(1)'}}>+</button>
            </div>
          </label>
          {!impostersValid && (<div style={{color:'#fca5a5',fontSize:'clamp(13px, 3.2vw, 14px)'}}>{t(language,'impostersInvalid').replace('{max}', String(maxImposters))}</div>)}

          <label style={{display:'flex',alignItems:'center',gap:12}}>
            <input type="checkbox" checked={timerEnabled} onChange={(e)=>setTimerEnabled(e.target.checked)} style={{width:20,height:20}} />
            <span style={{fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'timer')}</span>
          </label>
          {timerEnabled && (
            <label style={{display:'grid',gap:'clamp(6px, 2vw, 8px)'}}>
              <span style={{fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'timerSeconds')}</span>
              <input type="number" min={10} max={600} value={seconds} onChange={(e)=>setSeconds(parseInt(e.target.value || '60',10))} style={{padding:'clamp(10px, 2.5vh, 12px) 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff',fontSize:'clamp(14px, 3.5vw, 16px)'}} />
            </label>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',gap:'clamp(12px, 3vw, 16px)',marginTop:'clamp(12px, 3vw, 16px)'}}>
          {onChangeMode && (
            <button onClick={()=>onChangeMode('spyfall')} style={{padding:'clamp(10px, 2.5vh, 12px) clamp(14px, 3.5vw, 16px)',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff',fontSize:'clamp(13px, 3.2vw, 14px)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.background='#222'}} onMouseLeave={(e)=>{e.currentTarget.style.background='#151515'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='scale(1)'}}>{language==='en' ? 'Switch to Spyfall' : 'Bytt til Spyfall'}</button>
          )}
          <div style={{flex:1}} />
          <button disabled={!playersValid || !impostersValid} onClick={()=>onStart(players, safeImposters, timerEnabled, seconds)} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'none',background:(!playersValid||!impostersValid)?'#374151':'#4f46e5',color:'#fff',fontWeight:600,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:(!playersValid||!impostersValid)?'none':'0 4px 12px rgba(79,70,229,0.3)',transition:'all 200ms',cursor:(!playersValid||!impostersValid)?'not-allowed':'pointer'}} onMouseEnter={(e)=>{if(playersValid&&impostersValid){e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)'}}} onMouseLeave={(e)=>{if(playersValid&&impostersValid){e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)'}}} onMouseDown={(e)=>{if(playersValid&&impostersValid)e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{if(playersValid&&impostersValid)e.currentTarget.style.transform='translateY(-2px)'}}>{t(language,'start')}</button>
        </div>
      </div>
    </Card>
  )
}

function Reveal({ playerIndex, totalPlayers, role, word, category, onNext, language }: { playerIndex: number; totalPlayers: number; role: 'Imposter' | 'Borger'; word: string; category: string; onNext: () => void; language: Language }) {
  const [visible, setVisible] = useState(true)
  const isLast = playerIndex + 1 >= totalPlayers
  return (
    <Card title={t(language,'revealTitle').replace('{cur}', String(playerIndex+1)).replace('{total}', String(totalPlayers))} height={'min(450px, 75vh)'}>
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'100%'}}>
        <div style={{opacity:visible?1:0,transition:'opacity 300ms',position:'relative',textAlign:'center'}}>
          <div style={{position:'absolute',top:0,right:0,fontSize:'clamp(28px, 8vw, 36px)',filter: role==='Imposter' ? 'drop-shadow(0 0 8px rgba(225,29,72,0.7))' : 'drop-shadow(0 0 8px rgba(34,197,94,0.7))',transform:'scale(0.9)',transition:'transform 250ms ease, filter 250ms ease',animation:'iconfade 350ms ease'}} aria-hidden="true" onMouseEnter={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.filter = role==='Imposter' ? 'drop-shadow(0 0 12px rgba(225,29,72,0.9))' : 'drop-shadow(0 0 12px rgba(34,197,94,0.9))' }} onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.9)'; (e.currentTarget as HTMLDivElement).style.filter = role==='Imposter' ? 'drop-shadow(0 0 8px rgba(225,29,72,0.7))' : 'drop-shadow(0 0 8px rgba(34,197,94,0.7))' }}>{role === 'Imposter' ? '🎭' : '🛡️'}</div>
          <div style={{fontSize:'clamp(16px, 4vw, 18px)',opacity:0.85}}>{t(language,'category')}</div>
          <div style={{fontSize:'clamp(18px, 4.5vw, 22px)',marginBottom:'clamp(12px, 3vw, 16px)'}}>{category}</div>
          {role === 'Imposter' && (<><div style={{fontSize:'clamp(18px, 4.5vw, 20px)',opacity:0.85}}>{t(language,'youAre')}</div><div style={{fontSize:'clamp(28px, 7vw, 36px)',fontWeight:700,marginBottom:12}}>{t(language,'imposter')}</div><div style={{opacity:0.85,marginTop:8,fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'youDontKnowWord')}</div></>)}
          {role !== 'Imposter' && (<><div style={{fontSize:'clamp(18px, 4.5vw, 20px)',opacity:0.85}}>{t(language,'wordIs')}</div><div style={{fontSize:'clamp(28px, 8vw, 40px)',fontWeight:700}}>{word}</div></>)}
        </div>
        <div style={{display:'flex',justifyContent:'center'}}>
          {visible ? (
            <button onClick={()=>{ setVisible(false) }} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'none',background:'#e11d48',color:'#fff',fontWeight:600,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(225,29,72,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>{t(language,'okHide')}</button>
          ) : (
            <button onClick={()=>{ setVisible(true); onNext(); }} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(34,197,94,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>{isLast ? (language==='en' ? 'Start round' : 'Start runde') : t(language,'showPlayerNumber').replace('{num}', String(playerIndex+2))}</button>
          )}
        </div>
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
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
    @keyframes confetti { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
  `
  document.head.appendChild(el)
}

function Discussion({ category, onStartTimer, timerEnabled, seconds, countdown, onEnd, language }: { category: string; onStartTimer: () => void; timerEnabled: boolean; seconds: number; countdown: number | null; onEnd: () => void; language: Language }) {
  return (
    <Card title={t(language,'discussionTitle')}>
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'100%'}}>
        <div style={{textAlign:'center',display:'grid',gap:'clamp(12px, 3vw, 16px)'}}>
          <div style={{fontSize:'clamp(16px, 4vw, 18px)',opacity:0.85}}>{t(language,'category')}</div>
          <div style={{fontSize:'clamp(20px, 5vw, 24px)'}}>{category}</div>
          {timerEnabled ? (
            <div>
              {countdown === null ? (
                <div style={{opacity:0.8,fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'timer')}</div>
              ) : (
                <div style={{fontSize:'clamp(40px, 12vw, 48px)',fontWeight:800,animation:countdown!==null&&countdown<=10?'pulse 1s ease-in-out infinite':undefined}}>{countdown}</div>
              )}
            </div>
          ) : (
            <div style={{opacity:0.8,fontSize:'clamp(14px, 3.5vw, 16px)'}}>{t(language,'timerOffHint')}</div>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:'clamp(12px, 3vw, 16px)',marginTop:'clamp(12px, 3vw, 16px)'}}>
          {timerEnabled && countdown === null && (
            <button onClick={onStartTimer} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(79,70,229,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>{t(language,'startTimer').replace('{seconds}', String(seconds))}</button>
          )}
          <button onClick={onEnd} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(34,197,94,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>{t(language,'startVote')}</button>
        </div>
      </div>
    </Card>
  )
}

function Result({ imposterIndices, word, onRestart, language }: { imposterIndices: number[]; word: string; onRestart: () => void; language: Language }) {
  useEffect(() => {
    const colors = ['#4f46e5', '#22c55e', '#e11d48', '#f59e0b', '#8b5cf6']
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden'
    document.body.appendChild(container)
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        confetti.style.cssText = `position:absolute;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};top:0;left:${Math.random()*100}%;animation:confetti ${3+Math.random()*2}s linear forwards;border-radius:${Math.random()>0.5?'50%':'0'}`
        container.appendChild(confetti)
        setTimeout(() => confetti.remove(), 5000)
      }, i * 30)
    }
    setTimeout(() => container.remove(), 5000)
  }, [])
  return (
    <Card title={t(language,'resultTitle')}>
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'100%'}}>
        <div style={{display:'grid',gap:'clamp(12px, 3vw, 16px)',textAlign:'center'}}>
          <div style={{fontSize:'clamp(18px, 4.5vw, 20px)'}}>{t(language,'secretWord')}</div>
          <div style={{fontSize:'clamp(32px, 10vw, 40px)',fontWeight:800}}>{word}</div>
          <div style={{fontSize:'clamp(18px, 4.5vw, 20px)',marginTop:'clamp(12px, 3vw, 16px)'}}>{t(language,'impostersWere')} {imposterIndices.map(i=>`#${i+1}`).join(', ')}</div>
        </div>
        <div style={{display:'flex',justifyContent:'center',marginTop:'clamp(12px, 3vw, 16px)'}}>
          <button onClick={onRestart} style={{padding:'clamp(12px, 2.5vh, 14px) clamp(16px, 4vw, 20px)',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600,fontSize:'clamp(14px, 3.5vw, 16px)',boxShadow:'0 4px 12px rgba(79,70,229,0.3)',transition:'all 200ms',cursor:'pointer'}} onMouseEnter={(e)=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={(e)=>{e.currentTarget.style.filter='brightness(1)';e.currentTarget.style.transform='translateY(0)'}} onMouseDown={(e)=>{e.currentTarget.style.transform='scale(0.97)'}} onMouseUp={(e)=>{e.currentTarget.style.transform='translateY(-2px)'}}>{t(language,'startNew')}</button>
        </div>
      </div>
    </Card>
  )
}
