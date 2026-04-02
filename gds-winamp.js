// ═══════════════════════════════════════════════════════════════════
// GDS-WINAMP.JS — Winamp 2.x Player for ODT GameDev Suite
// Self-contained IIFE. Requires: #wa-audio, #wa-container HTML.
// ═══════════════════════════════════════════════════════════════════
(function(){
const WA = {
  audio: document.getElementById('wa-audio'),
  ctx: null, analyser: null, src: null, gainNode: null, panNode: null,
  filters: [],
  eqEnabled: false, preamp: 0,
  playlist: [], current: -1,
  shuffle: false, repeat: false,
  playing: false, seeking: false,
  vis_raf: null, title_x: 0,
  shaded: false,
  EQ_FREQS: [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
  EQ_VALS: Array(10).fill(0),
};
window._WA = WA;

function setupCtx(){
  if(WA.ctx) return;
  WA.ctx = new (window.AudioContext||window.webkitAudioContext)();
  WA.gainNode = WA.ctx.createGain(); WA.gainNode.gain.value = 0.8;
  WA.panNode = WA.ctx.createStereoPanner ? WA.ctx.createStereoPanner() : WA.ctx.createPanner();
  WA.EQ_FREQS.forEach((f,i)=>{
    const bq = WA.ctx.createBiquadFilter();
    bq.type = i===0?'lowshelf':i===9?'highshelf':'peaking';
    bq.frequency.value = f;
    bq.Q.value = 1.0;
    bq.gain.value = 0;
    WA.filters.push(bq);
  });
  WA.analyser = WA.ctx.createAnalyser();
  WA.analyser.fftSize = 128;
  WA.src = WA.ctx.createMediaElementSource(WA.audio);
  let node = WA.src;
  WA.filters.forEach(f=>{ node.connect(f); node=f; });
  node.connect(WA.gainNode);
  const isPan = WA.panNode instanceof StereoPannerNode;
  if(isPan){ WA.gainNode.connect(WA.panNode); WA.panNode.connect(WA.analyser); }
  else { WA.gainNode.connect(WA.analyser); }
  WA.analyser.connect(WA.ctx.destination);
}

window.waLoadFiles = function(files){
  Array.from(files).forEach(f=>{ WA.playlist.push({name:f.name, url:URL.createObjectURL(f), duration:0}); });
  if(WA.current<0 && WA.playlist.length>0) waLoadTrack(0);
  waRenderPlaylist();
};

function waLoadTrack(idx){
  if(idx<0||idx>=WA.playlist.length)return;
  WA.current=idx;
  const t=WA.playlist[idx];
  WA.audio.src=t.url;
  WA.audio.load();
  document.getElementById('wa-songtitle').textContent=t.name+'        '+t.name+'        ';
  WA.title_x=275;
  document.getElementById('wa-kbps').textContent='---';
  document.getElementById('wa-khz').textContent=Math.round((WA.audio.sampleRate||44100)/1000);
  waRenderPlaylist();
  if(WA.playing) WA.audio.play().catch(()=>{});
}

window.waPlayPause=function(){ if(WA.audio.paused)waPlay();else waPause(); };
window.waPlay=function(){ setupCtx(); if(WA.ctx.state==='suspended')WA.ctx.resume(); WA.audio.play().catch(()=>{}); WA.playing=true; document.getElementById('wa-playbtn').classList.add('wa-pressed'); startVis(); };
window.waPause=function(){ WA.audio.pause(); WA.playing=false; document.getElementById('wa-playbtn').classList.remove('wa-pressed'); };
window.waStop=function(){ WA.audio.pause(); WA.audio.currentTime=0; WA.playing=false; document.getElementById('wa-playbtn').classList.remove('wa-pressed'); waUpdateSeek(); };
window.waPrev=function(){ const n=WA.shuffle?waRandTrack():WA.current-1; if(n>=0)waLoadTrack(n); };
window.waNext=function(){ const n=WA.shuffle?waRandTrack():WA.current+1; if(n<WA.playlist.length)waLoadTrack(n); else if(WA.repeat)waLoadTrack(0); else waPause(); };
function waRandTrack(){ return Math.floor(Math.random()*WA.playlist.length); }

WA.audio.addEventListener('ended',()=>{ waNext(); });
WA.audio.addEventListener('timeupdate',()=>{ waUpdateSeek(); waUpdateTime(); });
WA.audio.addEventListener('loadedmetadata',()=>{ waUpdatePlaylistDuration(); document.getElementById('wa-khz').textContent=Math.round((WA.audio.sampleRate||44100)/1000); });

window.waSetVol=function(v){ setupCtx(); WA.gainNode.gain.value=v/100; };
window.waSetBal=function(v){ if(WA.panNode instanceof StereoPannerNode)WA.panNode.pan.value=v/100; };

let _seekDragging=false;
window.waSeekStart=function(e){ _seekDragging=true; waSeekTo(e); };
document.addEventListener('mousemove',e=>{ if(_seekDragging)waSeekTo(e); });
document.addEventListener('mouseup',()=>{ _seekDragging=false; });
function waSeekTo(e){ const bar=document.getElementById('wa-seekbar');const r=bar.getBoundingClientRect();const ratio=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));if(WA.audio.duration)WA.audio.currentTime=ratio*WA.audio.duration; }
function waUpdateSeek(){ if(WA.audio.duration){ const r=WA.audio.currentTime/WA.audio.duration; document.getElementById('wa-seekbar-fill').style.width=(r*100)+'%'; document.getElementById('wa-seekbar-thumb').style.left='calc('+r*100+'% - 2px)'; } }
function waUpdateTime(){ const t=WA.audio.currentTime|0; const m=Math.floor(t/60); const s=(t%60).toString().padStart(2,'0'); document.getElementById('wa-time').textContent=m+':'+s; }

window.waToggleShuffle=function(){ WA.shuffle=!WA.shuffle; document.getElementById('wa-shf').classList.toggle('active',WA.shuffle); };
window.waToggleRepeat=function(){ WA.repeat=!WA.repeat; document.getElementById('wa-rep').classList.toggle('active',WA.repeat); };

window.waEQBand=function(band,val){ setupCtx(); if(band===-1){ WA.preamp=val; }else{ WA.EQ_VALS[band]=val; if(WA.eqEnabled&&WA.filters[band])WA.filters[band].gain.value=val; } };
window.waEQToggle=function(){ WA.eqEnabled=!WA.eqEnabled; document.getElementById('wa-eq-on-btn').classList.toggle('active',WA.eqEnabled); WA.filters.forEach((f,i)=>{ f.gain.value=WA.eqEnabled?WA.EQ_VALS[i]:0; }); };
const EQ_PRESETS={flat:[0,0,0,0,0,0,0,0,0,0],rock:[4,3,2,1,-1,-1,2,3,4,4],pop:[-2,-1,0,2,4,3,2,1,0,-1],classical:[4,3,2,1,0,0,0,0,2,3],bass:[6,5,4,2,0,-1,-1,0,0,0],treble:[-2,-1,0,0,0,1,2,4,5,6],vocal:[-2,-2,0,3,4,4,3,0,-1,-2],dance:[4,3,1,0,-1,-2,0,2,3,3]};
window.waLoadPreset=function(name){ if(!name||!EQ_PRESETS[name])return; const vals=EQ_PRESETS[name]; const sliders=document.getElementById('wa-eq-bands').querySelectorAll('.wa-eq-range:not(#wa-eq-pre)'); sliders.forEach((s,i)=>{ s.value=vals[i]; waEQBand(i,vals[i]); }); };

function waRenderPlaylist(){ const el=document.getElementById('wa-pl-list'); el.innerHTML=WA.playlist.map((t,i)=>`<div class="wa-pl-item${i===WA.current?' active':''}" onclick="waPlPlay(${i})"><span class="wa-pl-num">${i+1}.</span><span class="wa-pl-name">${t.name.replace(/\.[^.]+$/,'')}</span><span class="wa-pl-dur">${t.duration?waFmtTime(t.duration):''}</span></div>`).join(''); document.getElementById('wa-pl-time').textContent=WA.playlist.length+' track'+(WA.playlist.length===1?'':'s'); }
window.waPlPlay=function(i){ waLoadTrack(i); waPlay(); };
window.waRemoveCurrent=function(){ if(WA.current<0)return; WA.playlist.splice(WA.current,1); if(WA.playlist.length===0)WA.current=-1; else WA.current=Math.min(WA.current,WA.playlist.length-1); waRenderPlaylist(); };
window.waPlClear=function(){ WA.playlist=[]; WA.current=-1; WA.audio.src=''; waRenderPlaylist(); document.getElementById('wa-songtitle').textContent='- - No file loaded - -'; document.getElementById('wa-time').textContent='0:00'; };
function waUpdatePlaylistDuration(){ if(WA.current>=0){ WA.playlist[WA.current].duration=WA.audio.duration||0; waRenderPlaylist(); } }
function waFmtTime(t){ const m=Math.floor(t/60),s=Math.round(t%60).toString().padStart(2,'0');return m+':'+s; }

window.waToggle=function(){ const c=document.getElementById('wa-container'); const on=c.style.display==='none'||c.style.display===''; c.style.display=on?'block':'none'; const b=document.getElementById('wa-toggle-btn'); if(b)b.classList.toggle('wa-on',on); if(on)waTitleScroll(); };
window.waToggleEQ=function(){ const w=document.getElementById('wa-eq-win'); const on=w.style.display==='none'; w.style.display=on?'block':'none'; document.getElementById('wa-eq-btn').classList.toggle('active',on); };
window.waTogglePL=function(){ const w=document.getElementById('wa-pl-win'); const on=w.style.display==='none'; w.style.display=on?'block':'none'; document.getElementById('wa-pl-btn').classList.toggle('active',on); waRenderPlaylist(); };
window.waShade=function(){ WA.shaded=!WA.shaded; const body=document.querySelector('#wa-main-win .wa-body'); if(body)body.style.display=WA.shaded?'none':'flex'; };
window.waMinimize=function(){ const c=document.getElementById('wa-container'); c.style.display='none'; const b=document.getElementById('wa-toggle-btn');if(b)b.classList.remove('wa-on'); };

let _drag={on:false,ox:0,oy:0};
document.getElementById('wa-drag-handle').addEventListener('mousedown',e=>{ const c=document.getElementById('wa-container'); _drag={on:true,ox:e.clientX-c.offsetLeft,oy:e.clientY-(parseInt(c.style.top)||window.innerHeight-c.offsetHeight-24)}; e.preventDefault(); });
document.addEventListener('mousemove',e=>{ if(!_drag.on)return; const c=document.getElementById('wa-container'); c.style.left=Math.max(0,e.clientX-_drag.ox)+'px'; c.style.bottom='auto'; c.style.top=Math.max(0,e.clientY-_drag.oy)+'px'; });
document.addEventListener('mouseup',()=>{ _drag.on=false; });

document.getElementById('wa-container').addEventListener('dragover',e=>{ e.preventDefault(); e.dataTransfer.dropEffect='copy'; });
document.getElementById('wa-container').addEventListener('drop',e=>{ e.preventDefault(); waLoadFiles(e.dataTransfer.files); });

function startVis(){ if(WA.vis_raf)return; drawVis(); }
function drawVis(){
  WA.vis_raf=requestAnimationFrame(drawVis);
  const canvas=document.getElementById('wa-vis'); if(!canvas)return;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#000'; ctx.fillRect(0,0,74,33);
  if(!WA.analyser||WA.audio.paused){ ctx.fillStyle='#0a2a12'; for(let i=0;i<18;i++){const h=Math.random()*2;ctx.fillRect(i*4+1,33-h,3,h);} return; }
  const data=new Uint8Array(WA.analyser.frequencyBinCount);
  WA.analyser.getByteFrequencyData(data);
  const bars=18; const step=Math.floor(data.length/bars);
  for(let i=0;i<bars;i++){
    const v=data[i*step]/255; const h=Math.max(1,v*31);
    const g=ctx.createLinearGradient(0,33,0,33-h);
    g.addColorStop(0,'#1aed59'); g.addColorStop(.6,'#5eff90'); g.addColorStop(1,'#ffffff');
    ctx.fillStyle=g; ctx.fillRect(i*4+1,33-h,3,h);
  }
}

function waTitleScroll(){
  const el=document.getElementById('wa-songtitle'); if(!el)return;
  WA.title_x-=0.5; const w=el.scrollWidth;
  if(WA.title_x<-w/2)WA.title_x=0;
  el.style.left=WA.title_x+'px';
  requestAnimationFrame(waTitleScroll);
}
waTitleScroll();

setTimeout(()=>{
  const tb=document.getElementById('topbar');
  if(tb&&!document.getElementById('wa-toggle-btn')){
    const btn=document.createElement('button');
    btn.id='wa-toggle-btn'; btn.title='Winamp Player';
    btn.textContent='🎵 Winamp';
    btn.onclick=waToggle;
    const swarm=tb.querySelector('[onclick*="swarm"]')||tb.lastElementChild;
    tb.insertBefore(btn,swarm||null);
  }
},100);

})(); // end WINAMP IIFE
