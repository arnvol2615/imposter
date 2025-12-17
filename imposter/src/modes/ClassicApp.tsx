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
      background:'#1c1c1c',
      borderRadius:12,
      padding:24,
      boxShadow:'0 6px 16px rgba(0,0,0,0.35)',
      width:'min(720px, 100%)',
      height: props.height ?? 'min(560px, 80vh)',
      margin:'0 auto',
      display:'flex',
      flexDirection:'column'
    }}>
      <h1 style={{fontSize:28,marginTop:0}}>{props.title}</h1>
      <div style={{flex:1,overflowY:'auto'}}>{props.children}</div>
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
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px'}}>
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
          <button onClick={onBegin} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700}}>
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
        <div style={{display:'grid',gap:16}}>
          <label style={{display:'grid',gap:8}}>
            <span>{t(language,'language')}</span>
            <select value={language} onChange={(e)=>onLanguageChange((e.target.value as Language))} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}}>
              <option value="no">Norsk</option>
              <option value="en">English</option>
            </select>
          </label>

          <label style={{display:'grid',gap:8}}>
            <span>{t(language,'players')}</span>
            <input type="number" min={3} max={15} value={players} inputMode="numeric" onChange={(e)=>{ const raw = e.target.value; const n = parseInt(raw, 10); setPlayers(Number.isNaN(n) ? 0 : n) }} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}} />
          </label>
          {!playersValid && (<div style={{color:'#fca5a5'}}>{t(language,'playersInvalid')}</div>)}

          <label style={{display:'grid',gap:8}}>
            <span>{t(language,'imposters').replace('{max}', String(maxImposters))}</span>
            <input type="number" inputMode="numeric" value={imposters} onFocus={(e)=>e.target.select()} onChange={(e)=>{ const val = e.target.value; setImposters(val === '' ? 0 : parseInt(val, 10)) }} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}} />
          </label>
          {!impostersValid && (<div style={{color:'#fca5a5'}}>{t(language,'impostersInvalid').replace('{max}', String(maxImposters))}</div>)}

          <label style={{display:'flex',alignItems:'center',gap:12}}>
            <input type="checkbox" checked={timerEnabled} onChange={(e)=>setTimerEnabled(e.target.checked)} />
            <span>{t(language,'timer')}</span>
          </label>
          {timerEnabled && (
            <label style={{display:'grid',gap:8}}>
              <span>{t(language,'timerSeconds')}</span>
              <input type="number" min={10} max={600} value={seconds} onChange={(e)=>setSeconds(parseInt(e.target.value || '60',10))} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}} />
            </label>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,marginTop:16}}>
          {onChangeMode && (
            <button onClick={()=>onChangeMode('spyfall')} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #333',background:'#151515',color:'#fff'}}>{language==='en' ? 'Switch to Spyfall' : 'Bytt til Spyfall'}</button>
          )}
          <div style={{flex:1}} />
          <button disabled={!playersValid || !impostersValid} onClick={()=>onStart(players, safeImposters, timerEnabled, seconds)} style={{padding:'12px 16px',borderRadius:8,border:'none',background:(!playersValid||!impostersValid)?'#374151':'#4f46e5',color:'#fff',fontWeight:600}}>{t(language,'start')}</button>
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
          <div style={{position:'absolute',top:0,right:0,fontSize:36,filter: role==='Imposter' ? 'drop-shadow(0 0 6px rgba(225,29,72,0.6))' : 'drop-shadow(0 0 6px rgba(34,197,94,0.6))',transform:'scale(0.9)',transition:'transform 250ms ease, filter 250ms ease',animation:'iconfade 350ms ease'}} aria-hidden="true" onMouseEnter={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }} onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.9)' }}>{role === 'Imposter' ? '🎭' : '🛡️'}</div>
          <div style={{fontSize:18,opacity:0.85}}>{t(language,'category')}</div>
          <div style={{fontSize:22,marginBottom:16}}>{category}</div>
          {role === 'Imposter' && (<><div style={{fontSize:20,opacity:0.85}}>{t(language,'youAre')}</div><div style={{fontSize:36,fontWeight:700,marginBottom:12}}>{t(language,'imposter')}</div><div style={{opacity:0.85,marginTop:8}}>{t(language,'youDontKnowWord')}</div></>)}
          {role !== 'Imposter' && (<><div style={{fontSize:20,opacity:0.85}}>{t(language,'wordIs')}</div><div style={{fontSize:40,fontWeight:700}}>{word}</div></>)}
        </div>
        <div style={{display:'flex',justifyContent:'center'}}>
          {visible ? (
            <button onClick={()=>{ setVisible(false) }} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#e11d48',color:'#fff',fontWeight:600}}>{t(language,'okHide')}</button>
          ) : (
            <button onClick={()=>{ setVisible(true); onNext(); }} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700}}>{isLast ? (language==='en' ? 'Start round' : 'Start runde') : t(language,'showPlayerNumber').replace('{num}', String(playerIndex+2))}</button>
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
  `
  document.head.appendChild(el)
}

function Discussion({ category, onStartTimer, timerEnabled, seconds, countdown, onEnd, language }: { category: string; onStartTimer: () => void; timerEnabled: boolean; seconds: number; countdown: number | null; onEnd: () => void; language: Language }) {
  return (
    <Card title={t(language,'discussionTitle')}>
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'100%'}}>
        <div style={{textAlign:'center',display:'grid',gap:16}}>
          <div style={{fontSize:18,opacity:0.85}}>{t(language,'category')}</div>
          <div style={{fontSize:24}}>{category}</div>
          {timerEnabled ? (
            <div>
              {countdown === null ? (
                <div style={{opacity:0.8}}>{t(language,'timer')}</div>
              ) : (
                <div style={{fontSize:48,fontWeight:800}}>{countdown}</div>
              )}
            </div>
          ) : (
            <div style={{opacity:0.8}}>{t(language,'timerOffHint')}</div>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'center',gap:12,marginTop:16}}>
          {timerEnabled && countdown === null && (
            <button onClick={onStartTimer} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600}}>{t(language,'startTimer').replace('{seconds}', String(seconds))}</button>
          )}
          <button onClick={onEnd} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#000',fontWeight:700}}>{t(language,'startVote')}</button>
        </div>
      </div>
    </Card>
  )
}

function Result({ imposterIndices, word, onRestart, language }: { imposterIndices: number[]; word: string; onRestart: () => void; language: Language }) {
  return (
    <Card title={t(language,'resultTitle')}>
      <div style={{display:'grid',gridTemplateRows:'1fr auto',height:'100%'}}>
        <div style={{display:'grid',gap:16,textAlign:'center'}}>
          <div style={{fontSize:20}}>{t(language,'secretWord')}</div>
          <div style={{fontSize:40,fontWeight:800}}>{word}</div>
          <div style={{fontSize:20,marginTop:16}}>{t(language,'impostersWere')} {imposterIndices.map(i=>`#${i+1}`).join(', ')}</div>
        </div>
        <div style={{display:'flex',justifyContent:'center',marginTop:16}}>
          <button onClick={onRestart} style={{padding:'12px 16px',borderRadius:8,border:'none',background:'#4f46e5',color:'#fff',fontWeight:600}}>{t(language,'startNew')}</button>
        </div>
      </div>
    </Card>
  )
}
