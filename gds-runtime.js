/**
 * GDS Runtime — ODT GameDev Suite
 * Standalone game engine library. Include in your exported games.
 * Provides: GameEngine, Entity, SceneManager, InputSystem,
 *            ParticleSystem, TweenSystem, AudioSystem
 * Version: 2.0
 */
(function(global){
'use strict';

// ═══════════════════════════════════════════════════════════════
// INPUT SYSTEM — configurable key/gamepad bindings
// ═══════════════════════════════════════════════════════════════
class InputSystem {
  constructor(){
    this._keys   = {};
    this._prev   = {};
    this._mouse  = { x:0, y:0, down:false, prevDown:false };
    this._pad    = null;
    this.bindings = {
      left:  ['ArrowLeft','KeyA'],  right: ['ArrowRight','KeyD'],
      up:    ['ArrowUp','KeyW'],    down:  ['ArrowDown','KeyS'],
      jump:  ['Space','ArrowUp'],   action:['KeyZ','KeyJ','Enter'],
      attack:['KeyX','KeyK'],       pause: ['Escape','KeyP'],
      dash:  ['ShiftLeft','ShiftRight'],
    };
    window.addEventListener('keydown', e => { this._keys[e.code]=true; e.preventDefault&&this._shouldPrevent(e.code)&&e.preventDefault(); });
    window.addEventListener('keyup',   e => { this._keys[e.code]=false; });
    window.addEventListener('gamepadconnected', e => { this._pad = e.gamepad; });
  }
  _shouldPrevent(c){ return ['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(c); }
  update(){
    this._prev = {...this._keys};
    this._mouse.prevDown = this._mouse.down;
    if(navigator.getGamepads) this._pad = navigator.getGamepads()[0]||null;
  }
  key(code){ return !!this._keys[code]; }
  keyDown(code){ return !!this._keys[code] && !this._prev[code]; }
  keyUp(code){ return !this._keys[code] && !!this._prev[code]; }
  is(action){ return (this.bindings[action]||[]).some(k=>this._keys[k]); }
  just(action){ return (this.bindings[action]||[]).some(k=>this._keys[k]&&!this._prev[k]); }
  bind(action, keys){ this.bindings[action]=Array.isArray(keys)?keys:[keys]; }
  setMouse(canvas){
    canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();this._mouse.x=e.clientX-r.left;this._mouse.y=e.clientY-r.top;});
    canvas.addEventListener('mousedown',()=>this._mouse.down=true);
    canvas.addEventListener('mouseup',()=>this._mouse.down=false);
    canvas.addEventListener('touchstart',e=>{const r=canvas.getBoundingClientRect();const t=e.touches[0];this._mouse.x=t.clientX-r.left;this._mouse.y=t.clientY-r.top;this._mouse.down=true;e.preventDefault();},{passive:false});
    canvas.addEventListener('touchend',()=>this._mouse.down=false,{passive:false});
  }
  get mouse(){ return this._mouse; }
  get mouseClick(){ return this._mouse.down && !this._mouse.prevDown; }
  // Gamepad helpers
  padButton(i){ return this._pad?.buttons[i]?.pressed||false; }
  padAxis(i){ const v=this._pad?.axes[i]||0; return Math.abs(v)>.15?v:0; }
}

// ═══════════════════════════════════════════════════════════════
// TWEEN SYSTEM — keyframe animation
// ═══════════════════════════════════════════════════════════════
const Easing = {
  linear: t=>t,
  easeIn: t=>t*t,
  easeOut: t=>1-(1-t)*(1-t),
  easeInOut: t=>t<.5?2*t*t:1-(-2*t+2)**2/2,
  bounce: t=>{ if(t<1/2.75)return 7.5625*t*t; if(t<2/2.75){t-=1.5/2.75;return 7.5625*t*t+0.75;} if(t<2.5/2.75){t-=2.25/2.75;return 7.5625*t*t+0.9375;} t-=2.625/2.75; return 7.5625*t*t+0.984375; },
  elastic: t=>{ if(t===0||t===1)return t; const c4=2*Math.PI/3; return -Math.pow(2,10*t-10)*Math.sin((t*10-10.75)*c4); },
  spring: t=>{ const c=2*Math.PI/4.5; return t===0?0:t===1?1:-Math.pow(2,10*t-10)*Math.sin((t*10-10.75)*c); },
};

class TweenSystem {
  constructor(){ this._tweens=[]; }
  to(target, props, duration, options={}){
    const start={}, end={};
    for(const k in props){ start[k]=target[k]; end[k]=props[k]; }
    const tween={target,start,end,duration,elapsed:0,ease:Easing[options.ease||'easeOut'],onComplete:options.onComplete,delay:options.delay||0,loop:options.loop||false,pingpong:options.pingpong||false,forward:true};
    this._tweens.push(tween);
    return tween;
  }
  wait(duration, callback){ return this.to({_:0},{_:1},duration,{onComplete:callback}); }
  update(dt){
    this._tweens = this._tweens.filter(tw=>{
      tw.elapsed+=dt;
      if(tw.elapsed<tw.delay)return true;
      const t=tw.elapsed-tw.delay;
      const progress=Math.min(1,t/tw.duration);
      const e=(tw.pingpong&&!tw.forward)?1-tw.ease(progress):tw.ease(progress);
      for(const k in tw.start) tw.target[k]=tw.start[k]+(tw.end[k]-tw.start[k])*e;
      if(progress>=1){
        if(tw.loop){ tw.elapsed=tw.delay; tw.forward=tw.pingpong?!tw.forward:true; return true; }
        tw.onComplete?.();
        return false;
      }
      return true;
    });
  }
  killAll(target){ this._tweens=target?this._tweens.filter(t=>t.target!==target):[];}
}

// ═══════════════════════════════════════════════════════════════
// PARTICLE SYSTEM — runtime emitter
// ═══════════════════════════════════════════════════════════════
class ParticleSystem {
  constructor(){
    this._emitters=[];
  }
  emit(x, y, config={}){
    const cfg={
      count:       config.count      ?? 20,
      speed:       config.speed      ?? 80,
      spread:      config.spread     ?? 360,
      angle:       config.angle      ?? 270,
      lifetime:    config.lifetime   ?? 1.0,
      sizeStart:   config.sizeStart  ?? 6,
      sizeEnd:     config.sizeEnd    ?? 0,
      colorStart:  config.colorStart ?? '#ffcc00',
      colorEnd:    config.colorEnd   ?? '#ff4400',
      gravity:     config.gravity    ?? 120,
      fadeOut:     config.fadeOut    ?? true,
      burst:       config.burst      ?? true,
      rate:        config.rate       ?? 10,
      shape:       config.shape      ?? 'circle',
    };
    const particles=[];
    for(let i=0;i<cfg.count;i++){
      const angle=(cfg.angle+(Math.random()-.5)*cfg.spread)*Math.PI/180;
      const spd=cfg.speed*(0.5+Math.random()*0.5);
      particles.push({x,y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,life:cfg.lifetime,maxLife:cfg.lifetime,size:cfg.sizeStart,shape:cfg.shape,cfg});
    }
    this._emitters.push({particles,cfg,burst:cfg.burst,rateAcc:0,x,y});
  }
  update(dt){
    for(const em of this._emitters){
      for(const p of em.particles){
        p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=em.cfg.gravity*dt;
        const t=1-(p.life/p.maxLife);
        p.size=em.cfg.sizeStart+(em.cfg.sizeEnd-em.cfg.sizeStart)*t;
        p.alpha=em.cfg.fadeOut?(p.life/p.maxLife):1;
        p.color=lerpColor(em.cfg.colorStart,em.cfg.colorEnd,t);
      }
      em.particles=em.particles.filter(p=>p.life>0);
    }
    this._emitters=this._emitters.filter(e=>e.particles.length>0);
  }
  draw(ctx, cameraX=0, cameraY=0){
    for(const em of this._emitters){
      for(const p of em.particles){
        ctx.save();
        ctx.globalAlpha=p.alpha??1;
        ctx.fillStyle=p.color||'#ffcc00';
        ctx.beginPath();
        if(p.shape==='square') ctx.rect(p.x-p.size/2-cameraX,p.y-p.size/2-cameraY,p.size,p.size);
        else if(p.shape==='star') drawStar(ctx,p.x-cameraX,p.y-cameraY,p.size/2,p.size,5);
        else ctx.arc(p.x-cameraX,p.y-cameraY,Math.max(.1,p.size/2),0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  get count(){ return this._emitters.reduce((n,e)=>n+e.particles.length,0); }
}

function lerpColor(a,b,t){
  const pa=parseColor(a),pb=parseColor(b);
  const r=Math.round(pa[0]+(pb[0]-pa[0])*t);
  const g=Math.round(pa[1]+(pb[1]-pa[1])*t);
  const bl=Math.round(pa[2]+(pb[2]-pa[2])*t);
  return `rgb(${r},${g},${bl})`;
}
function parseColor(hex){
  const r=parseInt(hex.slice(1,3),16)||0, g=parseInt(hex.slice(3,5),16)||0, b=parseInt(hex.slice(5,7),16)||0;
  return [r,g,b];
}
function drawStar(ctx,x,y,r1,r2,pts){
  ctx.beginPath();
  for(let i=0;i<pts*2;i++){const r=i%2===0?r2/2:r1/2,a=i*Math.PI/pts-Math.PI/2;if(i===0)ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a));else ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}
  ctx.closePath();
}

// ═══════════════════════════════════════════════════════════════
// AUDIO SYSTEM — procedural ADSR synth
// ═══════════════════════════════════════════════════════════════
class AudioSystem {
  constructor(){ this._ctx=null; this._sounds={}; }
  _getCtx(){ if(!this._ctx||this._ctx.state==='closed') this._ctx=new(window.AudioContext||window.webkitAudioContext)(); if(this._ctx.state==='suspended')this._ctx.resume(); return this._ctx; }
  beep(freq=440,type='square',dur=.1,vol=.3){
    const ctx=this._getCtx(),now=ctx.currentTime;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(vol,now); g.gain.linearRampToValueAtTime(0,now+dur);
    o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+dur+.05);
  }
  play(config={}){
    const ctx=this._getCtx(), now=ctx.currentTime;
    const {type='square',frequency=440,attack=.01,decay=.1,sustain=.3,release=.3,duration=.5,volume=.5,pitch_sweep=0,cutoff=8000}=config;
    const o=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    o.type=type==='noise'?'sawtooth':type; o.frequency.value=frequency;
    if(pitch_sweep) o.frequency.linearRampToValueAtTime(frequency*Math.pow(2,pitch_sweep/12),now+duration);
    f.type='lowpass'; f.frequency.value=cutoff;
    const end=now+duration; const rEnd=end+release;
    g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(volume,now+attack);
    g.gain.linearRampToValueAtTime(volume*sustain,now+attack+decay);
    g.gain.setValueAtTime(volume*sustain,end); g.gain.linearRampToValueAtTime(0,rEnd);
    o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(now); o.stop(rEnd+.05);
  }
  preload(name, config){ this._sounds[name]=config; }
  trigger(name){ if(this._sounds[name])this.play(this._sounds[name]); }
}

// ═══════════════════════════════════════════════════════════════
// SCENE MANAGER
// ═══════════════════════════════════════════════════════════════
class SceneManager {
  constructor(engine){
    this._engine=engine; this._scenes={}; this._stack=[]; this._current=null;
  }
  register(name, scene){ this._scenes[name]=scene; return this; }
  switch(name){
    if(this._current) this._scenes[this._current]?.exit?.(this._engine);
    this._stack=[name]; this._current=name;
    this._engine.entities=[];
    this._scenes[name]?.enter?.(this._engine);
  }
  push(name){
    this._scenes[this._current]?.pause?.(this._engine);
    this._stack.push(name); this._current=name;
    this._scenes[name]?.enter?.(this._engine);
  }
  pop(){
    if(this._stack.length<=1)return;
    this._scenes[this._current]?.exit?.(this._engine);
    this._stack.pop(); this._current=this._stack[this._stack.length-1];
    this._scenes[this._current]?.resume?.(this._engine);
  }
  update(dt){ this._scenes[this._current]?.update?.(this._engine,dt); }
  render(){ this._scenes[this._current]?.render?.(this._engine); }
  get current(){ return this._current; }
}

// ═══════════════════════════════════════════════════════════════
// ENTITY BASE CLASS
// ═══════════════════════════════════════════════════════════════
class Entity {
  constructor(x=0,y=0,w=32,h=32){
    this.x=x; this.y=y; this.w=w; this.h=h;
    this.vx=0; this.vy=0; this.tags=[];
    this.alive=true; this.engine=null; this._components={};
  }
  add(component){ this._components[component.name||component.constructor.name]=component; component.entity=this; component.init?.(this); return this; }
  get(name){ return this._components[name]; }
  tag(...tags){ tags.forEach(t=>this.tags.push(t)); return this; }
  hasTag(t){ return this.tags.includes(t); }
  init(e){}
  update(e,dt){}
  render(e){ e.drawRect(this.x,this.y,this.w,this.h,'#58a6ff'); }
  destroy(){ this.alive=false; }
}

// ═══════════════════════════════════════════════════════════════
// GAME ENGINE — main class
// ═══════════════════════════════════════════════════════════════
class GameEngine {
  constructor(canvasId, w=640, h=480){
    this.canvas = typeof canvasId==='string' ? (document.getElementById(canvasId)||document.querySelector('canvas')) : canvasId;
    if(!this.canvas){ this.canvas=document.createElement('canvas'); document.body.appendChild(this.canvas); }
    this.ctx    = this.canvas.getContext('2d');
    this.canvas.width=w; this.canvas.height=h;

    this.entities = [];
    this.running  = false;
    this._lt      = 0;
    this.gravity  = 800;
    this.camera   = {x:0, y:0};
    this._layers  = {}; // named entity groups

    this.input    = new InputSystem();
    this.input.setMouse(this.canvas);
    this.tween    = new TweenSystem();
    this.particles= new ParticleSystem();
    this.audio    = new AudioSystem();
    this.scenes   = new SceneManager(this);
  }

  // ── Entity management ──────────────────────────────────────
  add(entity, layer='default'){
    entity.engine=this;
    entity.init?.(this);
    this.entities.push(entity);
    (this._layers[layer]=this._layers[layer]||[]).push(entity);
    return entity;
  }
  remove(entity){ entity.alive=false; }
  _cleanup(){ this.entities=this.entities.filter(e=>e.alive!==false); for(const l in this._layers)this._layers[l]=this._layers[l].filter(e=>e.alive!==false); }
  get(tag){ return this.entities.filter(e=>e.tags?.includes(tag)); }
  getOne(tag){ return this.entities.find(e=>e.tags?.includes(tag)); }
  layer(name){ return this._layers[name]||[]; }

  // ── Physics ────────────────────────────────────────────────
  aabb(a,b){ return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y; }
  collide(entity, others){ return (others??this.entities).filter(o=>o!==entity&&o.alive!==false&&this.aabb(entity,o)); }
  applyGravity(entity, dt, platforms){
    entity.vy=(entity.vy||0)+this.gravity*dt;
    entity.x+=(entity.vx||0)*dt;
    entity.y+=entity.vy*dt;
    entity.onGround=false;
    for(const p of platforms??[]){
      if(this.aabb(entity,p)&&entity.vy>0&&entity.y+entity.h-entity.vy*dt<=p.y+2){
        entity.y=p.y-entity.h; entity.vy=0; entity.onGround=true; break;
      }
    }
  }
  followCamera(entity, lerp=.1, minX=0, minY=0, maxX=Infinity, maxY=Infinity){
    const tx=entity.x+entity.w/2-this.canvas.width/2;
    const ty=entity.y+entity.h/2-this.canvas.height/2;
    this.camera.x+=(Math.max(minX,Math.min(maxX-this.canvas.width,tx))-this.camera.x)*lerp;
    this.camera.y+=(Math.max(minY,Math.min(maxY-this.canvas.height,ty))-this.camera.y)*lerp;
  }
  screenShake(intensity=8, duration=.3){
    const orig={...this.camera}; let t=0;
    const fn=()=>{ t+=1/60; if(t>duration){this.camera.x=orig.x;this.camera.y=orig.y;return;} this.camera.x=orig.x+(Math.random()-.5)*intensity; this.camera.y=orig.y+(Math.random()-.5)*intensity; requestAnimationFrame(fn); };
    fn();
  }

  // ── Drawing ────────────────────────────────────────────────
  clear(color='#0d0d1a'){ this.ctx.fillStyle=color; this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height); }
  drawRect(x,y,w,h,color='#fff',alpha=1){ const ctx=this.ctx; ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color; ctx.fillRect(x-this.camera.x,y-this.camera.y,w,h); ctx.restore(); }
  drawOutline(x,y,w,h,color='#fff',lw=1){ const ctx=this.ctx; ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.strokeRect(x-this.camera.x,y-this.camera.y,w,h); ctx.restore(); }
  drawCircle(x,y,r,color='#fff',alpha=1){ const ctx=this.ctx; ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x-this.camera.x,y-this.camera.y,r,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  drawText(text,x,y,{color='#fff',size=14,font='monospace',align='left',baseline='top',alpha=1}={}){ const ctx=this.ctx; ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color; ctx.font=`${size}px ${font}`; ctx.textAlign=align; ctx.textBaseline=baseline; ctx.fillText(text,x-this.camera.x,y-this.camera.y); ctx.restore(); }
  drawImage(img,x,y,w,h,flipX=false){ if(!img?.complete)return; const ctx=this.ctx; ctx.save(); if(flipX){ctx.translate(x-this.camera.x+(w||img.width),y-this.camera.y);ctx.scale(-1,1);ctx.drawImage(img,0,0,w||img.width,h||img.height);}else{ctx.drawImage(img,x-this.camera.x,y-this.camera.y,w||img.width,h||img.height);} ctx.restore(); }
  drawSprite(img,sx,sy,sw,sh,x,y,w,h){ if(!img?.complete)return; this.ctx.drawImage(img,sx,sy,sw,sh,x-this.camera.x,y-this.camera.y,w||sw,h||sh); }
  drawTilemap(map, tileSize, palette, offsetX=0, offsetY=0){ const ctx=this.ctx; map.forEach((row,ry)=>row.forEach((tile,rx)=>{ if(!tile)return; ctx.fillStyle=palette[tile]||'#999'; ctx.fillRect(rx*tileSize-this.camera.x+offsetX,ry*tileSize-this.camera.y+offsetY,tileSize,tileSize); })); }
  loadImage(src){ const img=new Image(); img.src=src; return img; }

  // ── HUD (screen-space, ignores camera) ────────────────────
  hud(fn){ this.ctx.save(); this.ctx.setTransform(1,0,0,1,0,0); fn(this.ctx,this.canvas.width,this.canvas.height); this.ctx.restore(); }

  // ── Main loop ──────────────────────────────────────────────
  start(){
    this.running=true;
    const loop=ts=>{
      if(!this.running)return;
      const dt=Math.min((ts-this._lt)/1000,.05);
      this._lt=ts;
      this.input.update();
      this.tween.update(dt);
      this.particles.update(dt);
      this.scenes.update(dt);
      for(const e of [...this.entities]) if(e.alive!==false) e.update?.(this,dt);
      this.scenes.render();
      this.particles.draw(this.ctx,this.camera.x,this.camera.y);
      this._cleanup();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(ts=>{this._lt=ts;requestAnimationFrame(loop);});
    return this;
  }
  stop(){ this.running=false; return this; }
  pause(){ this.running=!this.running; if(this.running)this.start(); }
}

// ── Exports ────────────────────────────────────────────────────
global.GDSRuntime={GameEngine,Entity,InputSystem,TweenSystem,Easing,ParticleSystem,AudioSystem,SceneManager};
// Convenience global
global.GameEngine=GameEngine;
global.Entity=Entity;

})(typeof window!=='undefined'?window:global);
