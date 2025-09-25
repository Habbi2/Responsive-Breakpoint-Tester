"use client";
import { useState, useCallback, useEffect, useMemo, ChangeEvent, FormEvent, useRef } from 'react';
import { useToast } from '../components/toast';
import { useTheme } from '../theme-provider';

interface Breakpoint { id: string; width: number; unit: 'px' | 'em'; }

// Default breakpoints if none provided in URL
const DEFAULTS: Breakpoint[] = [360,480,768,1024,1280].map((w,i)=>({ id: 'bp'+i, width: w, unit: 'px'}));

// Compact serialization: widths=360px,48em,768px → w param
function serializeBreakpoints(list: Breakpoint[]): string {
  return list.map(b=>`${b.width}${b.unit}`).join(',');
}

function parseBreakpoints(raw: string | null): Breakpoint[] | null {
  if(!raw) return null;
  const parts = raw.split(',').map(s=>s.trim()).filter(Boolean);
  if(!parts.length) return null;
  const parsed: Breakpoint[] = [];
  for (let i=0;i<parts.length;i++) {
    const m = parts[i].match(/^(\d+(?:\.\d+)?)(px|em)$/);
    if(!m) return null; // bail if invalid token
    parsed.push({ id: 'bp'+i+'_'+m[1]+m[2], width: Number(m[1]), unit: m[2] as 'px'|'em' });
  }
  return parsed.length ? parsed : null;
}

export default function ToolPage() {
  // URL state
  const [url, setUrl] = useState('https://example.com');
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  // Breakpoint editing state
  const pushToast = useToast();
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>(DEFAULTS);
  const [newWidth, setNewWidth] = useState('');
  const [newUnit, setNewUnit] = useState<'px'|'em'>('px');
  const [dirty, setDirty] = useState(false);
  // Always wrap layout (removed layoutMode toggle)
  const FRAME_HEIGHT_PRESETS = [500,600,720,840,960];
  const [frameHeight, setFrameHeight] = useState<number>(600);
  const [lazyLoad, setLazyLoad] = useState<boolean>(true);
  const [perfData, setPerfData] = useState<Record<string,{start:number; end?:number}>>({});
  const [showPerf, setShowPerf] = useState<boolean>(false);
  // Reload attempts and ticking clock for blocked/slow detection
  const [reloadCounts, setReloadCounts] = useState<Record<string, number>>({});
  const [clock, setClock] = useState<number>(Date.now());
  // Removed sync scroll & proxy mode
  const { mode: themeMode, toggle: toggleTheme, resolved: resolvedTheme, setMode: setThemeMode } = useTheme();
  // Presets (name -> serialized breakpoints string)
  interface PresetData { w: string; u?: string | null }
  const [presets, setPresets] = useState<Record<string,PresetData>>({});
  const [presetName, setPresetName] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // On first mount, read query params
  useEffect(()=>{
    const sp = new URLSearchParams(window.location.search);
    const w = parseBreakpoints(sp.get('w'));
    const u = sp.get('u');
  const fh = sp.get('h');
  // removed sync (s) and proxy (p) params
  const initialUrl = u && /^https?:\/\//i.test(u) ? u : null;
    if (w) setBreakpoints(w);
    if (initialUrl) {
      setUrl(initialUrl);
      setLoadedUrl(initialUrl);
    }
  // layoutMode query removed (always wrap)
    if(fh && !Number.isNaN(Number(fh))) {
      const n = Number(fh);
      setFrameHeight(Math.min(1200, Math.max(300, n)));
    }
  // sync/proxy params no longer supported
    const tm = sp.get('t');
    if(tm === 'light' || tm === 'dark' || tm === 'system') setThemeMode(tm);
    // Load presets from localStorage
    try {
      const raw = localStorage.getItem('rbp-presets');
      if(raw) {
        const parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object') {
          // migrate legacy string values -> { w: string }
          const migrated: Record<string,PresetData> = {};
            Object.keys(parsed).forEach(k => {
              const val = (parsed as any)[k];
              if(typeof val === 'string') migrated[k] = { w: val };
              else if(val && typeof val === 'object' && typeof val.w === 'string') migrated[k] = { w: val.w, u: typeof val.u === 'string' ? val.u : undefined };
            });
          setPresets(migrated);
        }
      }
    } catch { /* ignore */ }
  },[]);

  // Sync breakpoints + url into query string (debounced minimal)
  useEffect(()=>{
    if(!dirty) return;
    const sp = new URLSearchParams(window.location.search);
    sp.set('w', serializeBreakpoints(breakpoints));
    if (loadedUrl) sp.set('u', loadedUrl);
  // no layoutMode param
    sp.set('h', String(frameHeight));
  // removed sync/proxy params from URL state
  sp.set('t', themeMode);
    const qs = sp.toString();
    const newUrl = window.location.pathname + (qs ? ('?'+qs):'');
    window.history.replaceState(null,'',newUrl);
  },[breakpoints, loadedUrl, frameHeight, themeMode, dirty]);

  const addBreakpoint = useCallback((e: FormEvent)=>{
    e.preventDefault();
    const widthNum = Number(newWidth);
    if(!widthNum || widthNum < 100 || widthNum > 5000) return;
    const id = 'bp'+Date.now();
    setBreakpoints(prev => {
      const next = [...prev, { id, width: widthNum, unit: newUnit }].sort((a,b)=>a.width - b.width);
      return next;
    });
    setNewWidth('');
    setDirty(true);
  },[newWidth,newUnit]);

  const updateBreakpoint = useCallback((id: string, width: number, unit: 'px'|'em')=>{
    setBreakpoints(prev => prev.map(b=> b.id===id ? { ...b, width, unit } : b).sort((a,b)=>a.width-b.width));
    setDirty(true);
  },[]);

  const removeBreakpoint = useCallback((id: string)=>{
    setBreakpoints(prev => prev.filter(b=>b.id!==id));
    setDirty(true);
  },[]);

  const serialized = useMemo(()=> serializeBreakpoints(breakpoints), [breakpoints]);
  const shareUrl = useMemo(()=> typeof window !== 'undefined' ? window.location.href : '', []);

  const copyShare = useCallback(async ()=>{
    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast('Share link copied','success');
    } catch {
      pushToast('Copy failed','error');
    }
  },[pushToast]);

  // direct iframe src (proxy removed)

  // Attach real scroll listener inside iframe document for sync
  // sync scroll logic removed

  const saveCurrentAsPreset = useCallback(()=>{
    const trimmed = presetName.trim();
    if(!trimmed) return;
    const serialized = serializeBreakpoints(breakpoints);
    setPresets(prev => {
      const existed = Object.prototype.hasOwnProperty.call(prev, trimmed);
      const next = { ...prev, [trimmed]: { w: serialized, u: loadedUrl } };
      try { localStorage.setItem('rbp-presets', JSON.stringify(next)); } catch { /* ignore */ }
      pushToast(existed ? 'Preset updated' : 'Preset saved', 'success');
      return next;
    });
    setPresetName('');
    setActivePreset(trimmed);
  },[presetName, breakpoints, loadedUrl, pushToast]);

  const loadPreset = useCallback((name: string)=>{
    const data = presets[name];
    if(!data) return;
    const parsed = parseBreakpoints(data.w);
    if(!parsed) { pushToast('Preset is invalid','error'); return; }
    setBreakpoints(parsed);
    // If no URL currently loaded and preset has one, apply it
    if(!loadedUrl && data.u) {
      setUrl(data.u);
      setLoadedUrl(data.u);
    }
    setDirty(true);
    setActivePreset(name);
    pushToast(`Loaded preset ${name}`,'info');
    loadedFlagsRef.current = {};
  },[presets, loadedUrl, pushToast]);

  const deletePreset = useCallback((name: string)=>{
    setPresets(prev => {
      const next = { ...prev };
      delete next[name];
      try { localStorage.setItem('rbp-presets', JSON.stringify(next)); } catch { /* ignore */ }
      pushToast('Preset deleted', 'info');
      return next;
    });
    if(activePreset === name) setActivePreset(null);
  },[pushToast, activePreset]);

  // Lazy loading: track which iframes should load
  const loadedFlagsRef = useRef<Record<string, boolean>>({});
  const [, forceRerender] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    const markAll = () => {
      const flags: Record<string, boolean> = {};
      breakpoints.forEach(bp => { flags[bp.id] = true; });
      loadedFlagsRef.current = flags;
      forceRerender(x=>x+1);
    };
    if(!lazyLoad) { markAll(); return; }
    const rootEl = containerRef.current;
    if(!rootEl) { markAll(); return; }
    // Seed already-visible cards without waiting for observer
    const seed: Record<string, boolean> = { ...loadedFlagsRef.current };
    const cards = Array.from(rootEl.querySelectorAll('[data-bp-id]')) as HTMLElement[];
    cards.forEach(card => {
      const id = card.getAttribute('data-bp-id');
      if(!id) return;
      const rect = card.getBoundingClientRect();
      if(rect.top < window.innerHeight + 200) seed[id] = true;
    });
    loadedFlagsRef.current = seed;
    forceRerender(x=>x+1);
    const obs = new IntersectionObserver((entries)=>{
      let changed = false;
      entries.forEach(entry => {
        const id = entry.target.getAttribute('data-bp-id');
        if(!id) return;
        if(entry.isIntersecting && !loadedFlagsRef.current[id]) {
          loadedFlagsRef.current[id] = true;
          setPerfData(prev => ({ ...prev, [id]: { start: performance.now() } }));
          changed = true;
        }
      });
      if(changed) forceRerender(x=>x+1);
    }, { root: null, rootMargin: '200px 0px', threshold: 0.05 });
    cards.forEach(el => obs.observe(el));
    return ()=> obs.disconnect();
  },[breakpoints, lazyLoad]);

  const markFrameLoaded = useCallback((id: string)=>{
    setPerfData(prev => ({ ...prev, [id]: { ...prev[id], end: performance.now() } }));
  },[]);

  // Clock interval runs only while there are pending frames (start set but no end)
  useEffect(()=>{
    const hasPending = Object.values(perfData).some(v => v && v.start && !v.end);
    if(!hasPending) return; // no interval when all settled
    const h = setInterval(()=> setClock(Date.now()), 1000);
    return ()=> clearInterval(h);
  },[perfData]);

  const reloadFrame = useCallback((id: string)=>{
    setReloadCounts(prev => ({ ...prev, [id]: (prev[id]||0)+1 }));
    setPerfData(prev => ({ ...prev, [id]: { start: performance.now() } }));
  },[]);

  const totalLoadTime = useMemo(()=>{
    let sum = 0; let count = 0;
    Object.values(perfData).forEach(v => { if(v.end) { sum += (v.end - v.start); count++; } });
    return count ? { avg: sum / count, count } : null;
  },[perfData]);

  return (
    <div className="flex flex-col h-dvh">
      <header className="p-3 border-b border-base-border flex flex-wrap gap-3 items-center bg-base-bg/80 backdrop-blur-sm">
        <div className="flex gap-2 items-center flex-1 min-w-[280px]">
          <input
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>)=>setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 text-sm rounded-md border border-base-border bg-transparent outline-none focus:ring-2 focus:ring-base-accent"
          />
          <button onClick={()=>{ setLoadedUrl(url); setDirty(true); }} className="px-4 py-2 text-sm rounded-md bg-base-accent text-white hover:opacity-90">Load</button>
        </div>
        <form onSubmit={addBreakpoint} className="flex items-center gap-2 text-xs">
          <input
            value={newWidth}
            onChange={(e: ChangeEvent<HTMLInputElement>)=>setNewWidth(e.target.value.replace(/[^0-9]/g,''))}
            placeholder="width"
            className="w-20 px-2 py-1 rounded border border-base-border bg-transparent outline-none focus:ring-1 focus:ring-base-accent"
            inputMode="numeric"
          />
          <select value={newUnit} onChange={e=>setNewUnit(e.target.value as 'px'|'em')} className="px-2 py-1 rounded border border-base-border bg-transparent focus:ring-1 focus:ring-base-accent">
            <option value="px">px</option>
            <option value="em">em</option>
          </select>
          <button type="submit" className="px-3 py-1 rounded bg-base-accent text-white hover:opacity-90 disabled:opacity-40" disabled={!newWidth}>Add</button>
        </form>
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-[10px] font-mono text-base-muted select-all hidden md:block" title="Serialized breakpoints">{serialized}</div>
          <button type="button" onClick={copyShare} className="px-3 py-1 text-xs rounded border border-base-border hover:bg-base-hover">Copy Share URL</button>
          <button type="button" onClick={()=>{ toggleTheme(); setDirty(true); }} className="px-3 py-1 text-xs rounded border border-base-border hover:bg-base-hover" title={`Theme: ${themeMode}`}>{resolvedTheme === 'dark' ? '🌙' : '☀️'}</button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 space-y-6">
        <section className="flex flex-wrap gap-4 items-center text-xs bg-base-bg/40 rounded-md p-3 border border-base-border">
          {/* Layout toggle removed; always wrap */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Frame height:</span>
            <select value={frameHeight} onChange={e=>{setFrameHeight(Number(e.target.value)); setDirty(true);}} className="px-2 py-1 rounded border border-base-border bg-transparent focus:ring-1 focus:ring-base-accent">
              {FRAME_HEIGHT_PRESETS.map(h=> <option key={h} value={h}>{h}px</option>)}
            </select>
            <input type="range" min={300} max={1200} step={20} value={frameHeight} onChange={e=>{setFrameHeight(Number(e.target.value)); setDirty(true);}} />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" checked={lazyLoad} onChange={e=>{ setLazyLoad(e.target.checked); }} />
              <span>Lazy load</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input type="checkbox" checked={showPerf} onChange={e=> setShowPerf(e.target.checked)} />
              <span>Perf</span>
            </label>
          </div>
          {showPerf && totalLoadTime && (
            <div className="text-[10px] font-mono text-base-muted">
              avg load: {totalLoadTime.avg.toFixed(0)}ms ({totalLoadTime.count} frames)
            </div>
          )}
          {/* Sync scroll & Proxy mode controls removed */}
        </section>
        <section>
          <h2 className="text-xs font-semibold tracking-wide text-base-muted uppercase mb-2">Breakpoints</h2>
          <ul className="flex flex-wrap gap-2">
            {breakpoints.map(bp=> (
              <li key={bp.id} className="flex items-center gap-1 text-xs border border-base-border rounded px-2 py-1 bg-base-bg/60 backdrop-blur">
                <input
                  type="number"
                  value={bp.width}
                  min={100}
                  max={5000}
                  className="w-16 bg-transparent outline-none focus:ring-1 focus:ring-base-accent rounded"
                  onChange={e=>updateBreakpoint(bp.id, Number(e.target.value)||bp.width, bp.unit)}
                />
                <select value={bp.unit} onChange={e=>updateBreakpoint(bp.id, bp.width, e.target.value as 'px'|'em')} className="bg-transparent outline-none focus:ring-1 focus:ring-base-accent rounded">
                  <option value="px">px</option>
                  <option value="em">em</option>
                </select>
                <button type="button" onClick={()=>removeBreakpoint(bp.id)} className="text-red-500 hover:text-red-400 ml-1" aria-label="Remove breakpoint">×</button>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xs font-semibold tracking-wide text-base-muted uppercase mb-2 flex items-center gap-2">Presets {activePreset && <span className="px-2 py-0.5 text-[10px] rounded bg-base-accent/20 border border-base-accent/30 text-base-accent">{activePreset}</span>}</h2>
          <form onSubmit={(e)=>{ e.preventDefault(); saveCurrentAsPreset(); }} className="flex flex-wrap gap-2 items-center text-xs mb-2">
            <input
              value={presetName}
              onChange={e=>setPresetName(e.target.value)}
              placeholder="Preset name"
              className="px-2 py-1 rounded border border-base-border bg-transparent outline-none focus:ring-1 focus:ring-base-accent"
            />
            <button type="submit" disabled={!presetName.trim()} className="px-3 py-1 rounded border border-base-border hover:bg-base-hover disabled:opacity-40">Save</button>
          </form>
          {Object.keys(presets).length === 0 && (
            <p className="text-xs text-base-muted">No presets saved.</p>
          )}
          {Object.keys(presets).length > 0 && (
            <ul className="flex flex-wrap gap-2 text-xs">
              {Object.keys(presets).sort().map(name => (
                <li key={name} className={`flex items-center gap-1 border rounded px-2 py-1 bg-base-bg/60 ${activePreset===name?'border-base-accent':'border-base-border'}`}>
                  <span className="font-mono">{name}</span>
                  <button type="button" onClick={()=>loadPreset(name)} className="text-base-accent hover:underline">Load</button>
                  <button type="button" onClick={()=>deletePreset(name)} className="text-red-500 hover:text-red-400" aria-label={`Delete preset ${name}`}>×</button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section>
          {!loadedUrl && <p className="text-sm text-base-muted">Enter a URL and press Load to preview responsive frames.</p>}
          {loadedUrl && (
            <div className="flex flex-wrap gap-6 pb-4" ref={containerRef}>
              {breakpoints.map(bp => {
                const shouldLoad = !lazyLoad || loadedFlagsRef.current[bp.id];
                const frameKey = bp.id;
                const perf = perfData[frameKey];
                const loadMs = perf?.end && perf.start ? (perf.end - perf.start).toFixed(0) : null;
                // Determine status for pending loads
                let status: 'idle' | 'slow' | 'blocked' = 'idle';
                if(perf && perf.start && !perf.end) {
                  const elapsed = clock - perf.start;
                  if(elapsed > 8000) status = 'blocked';
                  else if(elapsed > 4000) status = 'slow';
                }
                const reloadCount = reloadCounts[frameKey] || 0;
                const iframeKey = frameKey + ':' + reloadCount; // force remount on reload
                return (
                  <div key={bp.id} data-bp-id={bp.id} className="shrink-0 border border-base-border rounded-md shadow-sm bg-white dark:bg-[#111] relative" style={{ width: bp.width + (bp.unit==='px'?'px':'em') }}>
                    <div className="px-2 py-1 text-xs font-mono flex items-center justify-between border-b border-base-border">
                      <span>{bp.width}{bp.unit}</span>
                      <div className="flex items-center gap-2">
                        {showPerf && loadMs && <span className="text-[10px] text-base-muted">{loadMs}ms</span>}
                        <a href={loadedUrl} target="_blank" rel="noopener" className="text-base-accent hover:underline">↗</a>
                      </div>
                    </div>
                    {!shouldLoad && (
                      <div className="flex flex-col gap-2 items-center justify-center text-[10px] text-base-muted h-full absolute inset-0 bg-gradient-to-br from-base-bg/40 to-base-bg/10 animate-pulse rounded-b-md select-none">
                        <span>waiting...</span>
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-base-accent/80 text-white text-[10px] hover:bg-base-accent"
                          onClick={()=>{ loadedFlagsRef.current[bp.id] = true; setPerfData(prev => ({ ...prev, [bp.id]: { start: performance.now() } })); forceRerender(x=>x+1); }}
                        >Load now</button>
                      </div>
                    )}
                    {shouldLoad && (
                      <>
                        <iframe
                          key={iframeKey}
                          title={bp.id}
                          src={loadedUrl}
                          style={{ width: bp.width + (bp.unit==='px' ? 'px' : 'em'), height: frameHeight+'px' }}
                          className="bg-white dark:bg-black rounded-b-md"
                          onLoad={()=> markFrameLoaded(frameKey)}
                        />
                        {status !== 'idle' && (
                          <div className={`absolute inset-0 rounded-b-md flex flex-col items-center justify-center gap-2 text-center px-3 ${status==='blocked' ? 'bg-red-500/15 border border-red-500/40' : 'bg-base-bg/70 border border-base-border/60'} backdrop-blur-sm`}> 
                            {status === 'slow' && (
                              <>
                                <span className="text-[11px] font-medium">Still loading…</span>
                                <span className="text-[10px] text-base-muted">Site taking longer than usual</span>
                              </>
                            )}
                            {status === 'blocked' && (
                              <>
                                <span className="text-[11px] font-semibold text-red-500">Likely blocked</span>
                                <span className="text-[10px] text-base-muted leading-snug">Embedding refused by site (X-Frame-Options / CSP)</span>
                              </>
                            )}
                            <div className="flex flex-wrap gap-2 justify-center">
                              {status !== 'blocked' && (
                                <button
                                  type="button"
                                  onClick={()=> reloadFrame(frameKey)}
                                  className="px-2 py-1 rounded bg-base-accent text-white text-[10px] hover:opacity-90"
                                >Reload</button>
                              )}
                              {status === 'blocked' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={()=> reloadFrame(frameKey)}
                                    className="px-2 py-1 rounded bg-base-accent text-white text-[10px] hover:opacity-90"
                                  >Retry</button>
                                  <a
                                    href={loadedUrl || '#'}
                                    target="_blank"
                                    rel="noopener"
                                    className="px-2 py-1 rounded border border-base-border text-[10px] hover:bg-base-hover"
                                  >Open</a>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
