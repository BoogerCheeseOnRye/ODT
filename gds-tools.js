/**
 * GDS Tools — ODT GameDev Suite Editor Tools Library
 * Combines: Sprite Editor + Audio Workbench + Particle Designer + Animation Timeline
 * Version: 2.0
 */
(function(global){
'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// SPRITE EDITOR (pixel art tool)
// ═══════════════════════════════════════════════════════════════════════════════

const SPR = {
    canvas: null, ctx: null, previewCanvas: null, previewCtx: null,
    width: 16, height: 16, zoom: 16,
    pixels: null, palette: [], activeColor: '#ff0000',
    tool: 'pencil', undoStack: [], redoStack: [],
    frames: [], activeFrame: 0,
    isDrawing: false, lastX: -1, lastY: -1,
    showGrid: true, onion: false, playInterval: null, playFPS: 8, opacity: 255,
};

const DEFAULT_PALETTE = ['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ff8800','#8800ff','#00ff88','#ff0088','#334455','#99aabb','#c8a96e','#5d4037','transparent'];

function initSpriteEditor(container){
    SPR.palette = [...DEFAULT_PALETTE];
    newSpriteCanvas(16, 16);
    container.innerHTML = buildSpriteUI();
    SPR.canvas = container.querySelector('#spr-canvas');
    SPR.ctx = SPR.canvas.getContext('2d');
    SPR.previewCanvas = container.querySelector('#spr-preview');
    SPR.previewCtx = SPR.previewCanvas.getContext('2d');
    bindSpriteEvents(container);
    renderPalette(container);
    renderFrameList(container);
    redrawCanvas();
    updatePreview();
}

function buildSpriteUI(){
    return `<div style="display:flex;flex-direction:column;height:100%;overflow:hidden">
      <div style="display:flex;gap:3px;padding:4px 6px;background:#010409;border-bottom:1px solid #21262d;flex-shrink:0;flex-wrap:wrap;align-items:center">
        <button class="scene-tool active" id="spr-tool-pencil" onclick="SPR_setTool('pencil',this)" title="Pencil (P)">✏️</button>
        <button class="scene-tool" id="spr-tool-erase" onclick="SPR_setTool('erase',this)" title="Eraser (E)">🧹</button>
        <button class="scene-tool" id="spr-tool-fill" onclick="SPR_setTool('fill',this)" title="Fill (F)">🪣</button>
        <button class="scene-tool" id="spr-tool-eyedropper" onclick="SPR_setTool('eyedropper',this)" title="Eyedropper (I)">💉</button>
        <button class="scene-tool" id="spr-tool-rect" onclick="SPR_setTool('rect',this)" title="Rectangle (R)">⬛</button>
        <button class="scene-tool" id="spr-tool-line" onclick="SPR_setTool('line',this)" title="Line (L)">╱</button>
        <div class="scene-tool-sep"></div>
        <button class="scene-tool" onclick="SPR_undo()" title="Undo">↩</button>
        <button class="scene-tool" onclick="SPR_redo()" title="Redo">↪</button>
        <div class="scene-tool-sep"></div>
        <button class="scene-tool" onclick="SPR_clear()" title="Clear">🗑</button>
        <button class="scene-tool" onclick="SPR_flipH()" title="Flip H">↔</button>
        <button class="scene-tool" onclick="SPR_flipV()" title="Flip V">↕</button>
        <div class="scene-tool-sep"></div>
        <select class="scene-tool" id="spr-size" onchange="SPR_resize(this.value)" style="padding:2px 4px;font-size:10px">
          <option value="8x8">8×8</option><option value="16x16" selected>16×16</option>
          <option value="32x32">32×32</option><option value="48x48">48×48</option><option value="64x64">64×64</option>
        </select>
        <label style="font-size:10px;color:#6e7681;display:flex;align-items:center;gap:3px"><input type="checkbox" id="spr-grid" checked onchange="SPR.showGrid=this.checked;redrawCanvas()"> Grid</label>
        <label style="font-size:10px;color:#6e7681;display:flex;align-items:center;gap:3px"><input type="checkbox" id="spr-onion" onchange="SPR.onion=this.checked;redrawCanvas()"> Onion</label>
      </div>
      <div style="display:flex;flex:1;min-height:0;overflow:hidden">
        <div style="display:flex;flex-direction:column;flex:1;min-width:0;overflow:hidden">
          <div id="spr-canvas-wrap" style="flex:1;overflow:auto;background:#1a1a2e;display:flex;align-items:center;justify-content:center;position:relative">
            <canvas id="spr-canvas" style="image-rendering:pixelated;cursor:crosshair"></canvas>
          </div>
          <div style="background:#010409;border-top:1px solid #21262d;padding:6px;flex-shrink:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <div style="font-size:10px;color:#6e7681">Color:</div>
              <div id="spr-active-color" style="width:22px;height:22px;border:2px solid #58a6ff;border-radius:3px;background:#ff0000;cursor:pointer" onclick="document.getElementById('spr-color-input').click()"></div>
              <input type="color" id="spr-color-input" style="position:absolute;opacity:0;width:0;height:0" onchange="SPR_setColor(this.value)">
              <input type="text" id="spr-color-hex" value="#ff0000" style="width:70px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:2px 5px;border-radius:3px;font-size:10px;font-family:monospace" onchange="SPR_setColor(this.value)">
              <input type="range" id="spr-opacity" min="0" max="255" value="255" style="flex:1" oninput="SPR_setOpacity(this.value)" title="Opacity">
            </div>
            <div id="spr-palette" style="display:flex;flex-wrap:wrap;gap:2px"></div>
            <div style="display:flex;gap:4px;margin-top:4px">
              <button class="scene-tool" onclick="SPR_addColor()" style="font-size:10px;flex:1">+ Add</button>
              <button class="scene-tool" onclick="SPR_exportPalette()" style="font-size:10px;flex:1">⬇ PAL</button>
              <button class="scene-tool" onclick="SPR_importPalette()" style="font-size:10px;flex:1">⬆ PAL</button>
            </div>
          </div>
        </div>
        <div style="width:90px;background:#010409;border-left:1px solid #21262d;display:flex;flex-direction:column;flex-shrink:0;overflow:hidden">
          <div style="font-size:9px;color:#484f58;text-align:center;padding:3px;border-bottom:1px solid #21262d">PREVIEW</div>
          <div style="padding:4px;display:flex;flex-direction:column;align-items:center;gap:4px">
            <canvas id="spr-preview" width="64" height="64" style="image-rendering:pixelated;border:1px solid #30363d;background:#0d1117"></canvas>
            <div style="font-size:9px;color:#484f58">1× / 4×</div>
            <canvas id="spr-preview-small" width="32" height="32" style="image-rendering:pixelated;border:1px solid #30363d;background:#0d1117"></canvas>
            <canvas id="spr-preview-bg" width="32" height="32" style="image-rendering:pixelated;border:1px solid #30363d"></canvas>
          </div>
          <div style="font-size:9px;color:#484f58;text-align:center;padding:3px;border-top:1px solid #21262d;border-bottom:1px solid #21262d">FRAMES</div>
          <div id="spr-frame-list" style="overflow-y:auto;flex:1;padding:4px;display:flex;flex-direction:column;gap:3px"></div>
          <div style="padding:4px;border-top:1px solid #21262d;display:flex;flex-direction:column;gap:2px">
            <button class="scene-tool" onclick="SPR_addFrame()" style="font-size:9px;width:100%">+ Frame</button>
            <button class="scene-tool" onclick="SPR_play()" id="spr-play-btn" style="font-size:9px;width:100%">▶ Play</button>
            <input type="number" value="8" min="1" max="60" style="width:100%;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:2px;font-size:9px;text-align:center" title="FPS" onchange="SPR.playFPS=parseInt(this.value)||8">
          </div>
        </div>
      </div>
      <div style="background:#010409;border-top:1px solid #21262d;padding:4px 6px;display:flex;gap:4px;flex-shrink:0">
        <button class="scene-tool" onclick="SPR_export('png')" style="font-size:10px">⬇ PNG</button>
        <button class="scene-tool" onclick="SPR_export('sheet')" style="font-size:10px">📋 Spritesheet</button>
        <button class="scene-tool" onclick="SPR_exportDataURL()" style="font-size:10px">📦 → Assets</button>
        <button class="scene-tool" onclick="SPR_exportJS()" style="font-size:10px">📜 → JS</button>
        <button class="scene-tool" onclick="SPR_importPNG()" style="font-size:10px">⬆ PNG</button>
      </div>
      <input type="file" id="spr-import-input" accept="image/*" style="display:none" onchange="SPR_handleImport(event)">
    </div>`;
}

function newSpriteCanvas(w,h){ SPR.width=w; SPR.height=h; SPR.pixels=new Uint32Array(w*h); SPR.frames=[new Uint32Array(w*h)]; SPR.activeFrame=0; SPR.undoStack=[]; SPR.redoStack=[]; }

function redrawCanvas(){
    const {canvas,ctx,width,height,zoom,showGrid,onion,pixels}=SPR;
    if(!canvas)return;
    canvas.width=width*zoom; canvas.height=height*zoom;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
            const px=pixels[y*width+x],a=(px>>>24)&0xff;
            if(a===0){ctx.fillStyle=((x+y)%2===0)?'#555':'#888';ctx.fillRect(x*zoom,y*zoom,zoom,zoom);}
            else{const r=(px>>>16)&0xff,g=(px>>>8)&0xff,b=px&0xff;ctx.fillStyle=`rgba(${r},${g},${b},${a/255})`;ctx.fillRect(x*zoom,y*zoom,zoom,zoom);}
        }
    }
    if(onion&&SPR.activeFrame>0){
        const prev=SPR.frames[SPR.activeFrame-1]; ctx.globalAlpha=0.3;
        for(let y=0;y<height;y++){for(let x=0;x<width;x++){const px=prev[y*width+x],a=(px>>>24)&0xff;if(a>0){const r=(px>>>16)&0xff,g=(px>>>8)&0xff,bl=px&0xff;ctx.fillStyle=`rgba(${r},${g},${bl},${(a/255)*0.4})`;ctx.fillRect(x*zoom,y*zoom,zoom,zoom);}}}
        ctx.globalAlpha=1;
    }
    if(showGrid&&zoom>=4){
        ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=0.5;
        for(let x=0;x<=width;x++){ctx.beginPath();ctx.moveTo(x*zoom,0);ctx.lineTo(x*zoom,canvas.height);ctx.stroke();}
        for(let y=0;y<=height;y++){ctx.beginPath();ctx.moveTo(0,y*zoom);ctx.lineTo(canvas.width,y*zoom);ctx.stroke();}
    }
    updatePreview();
}

function updatePreview(){
    const {previewCtx,width,height,pixels}=SPR; if(!previewCtx)return;
    const off=new OffscreenCanvas(width,height),oc=off.getContext('2d'),id=oc.createImageData(width,height);
    for(let i=0;i<pixels.length;i++){const px=pixels[i],a=(px>>>24)&0xff;id.data[i*4]=(px>>>16)&0xff;id.data[i*4+1]=(px>>>8)&0xff;id.data[i*4+2]=px&0xff;id.data[i*4+3]=a;}
    oc.putImageData(id,0,0);
    ['spr-preview','spr-preview-small','spr-preview-bg'].map(id=>document.getElementById(id)).filter(Boolean).forEach(c=>{const cc=c.getContext('2d');cc.clearRect(0,0,c.width,c.height);cc.imageSmoothingEnabled=false;cc.drawImage(off,0,0,c.width,c.height);});
}

function getPixelFromEvent(e){const rect=SPR.canvas.getBoundingClientRect();return{x:Math.floor((e.clientX-rect.left)/SPR.zoom),y:Math.floor((e.clientY-rect.top)/SPR.zoom)};}

let rectStart=null,lineStart=null;
function paint(x,y){
    if(x<0||y<0||x>=SPR.width||y>=SPR.height)return;
    const idx=y*SPR.width+x;
    if(SPR.tool==='pencil')SPR.pixels[idx]=colorToUint32(SPR.activeColor,SPR.opacity);
    else if(SPR.tool==='erase')SPR.pixels[idx]=0;
    else if(SPR.tool==='eyedropper'){const px=SPR.pixels[idx];if((px>>>24)===0){SPR_setColor('transparent');return;}SPR_setColor(rgbToHex((px>>>16)&0xff,(px>>>8)&0xff,px&0xff));}
    else if(SPR.tool==='fill'){pushSpriteUndo();fillBucket(x,y,SPR.pixels[idx],colorToUint32(SPR.activeColor,SPR.opacity));}
    redrawCanvas(); syncFrame();
}
function paintLine(x0,y0,x1,y1,c32){let dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy;while(true){if(x0>=0&&y0>=0&&x0<SPR.width&&y0<SPR.height)SPR.pixels[y0*SPR.width+x0]=c32;if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>-dy){err-=dy;x0+=sx;}if(e2<dx){err+=dx;y0+=sy;}}}
function fillBucket(sx,sy,fc,tc){if(fc===tc)return;const{pixels,width,height}=SPR,stack=[sy*width+sx];while(stack.length){const i=stack.pop();if(i<0||i>=width*height||pixels[i]!==fc)continue;pixels[i]=tc;const x=i%width;if(x>0)stack.push(i-1);if(x<width-1)stack.push(i+1);if(i>=width)stack.push(i-width);if(i<width*(height-1))stack.push(i+width);}}
function colorToUint32(hex,opacity=255){if(hex==='transparent')return 0;const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return((opacity&0xff)<<24)|((r&0xff)<<16)|((g&0xff)<<8)|(b&0xff);}
function uint32ToHex(px){const r=(px>>>16)&0xff,g=(px>>>8)&0xff,b=px&0xff;return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');}
function rgbToHex(r,g,b){return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');}

function pushSpriteUndo(){SPR.undoStack.push(new Uint32Array(SPR.pixels));if(SPR.undoStack.length>50)SPR.undoStack.shift();SPR.redoStack=[];}
function SPR_undo(){if(!SPR.undoStack.length)return;SPR.redoStack.push(new Uint32Array(SPR.pixels));SPR.pixels=SPR.undoStack.pop();syncFrame();redrawCanvas();}
function SPR_redo(){if(!SPR.redoStack.length)return;SPR.undoStack.push(new Uint32Array(SPR.pixels));SPR.pixels=SPR.redoStack.pop();syncFrame();redrawCanvas();}

function renderPalette(container){
    const el=(container||document).getElementById('spr-palette');if(!el)return;
    const CBG=`url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGElEQVQImWNgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==') repeat`;
    el.innerHTML=SPR.palette.map((c,i)=>`<div style="width:18px;height:18px;background:${c==='transparent'?CBG:c};border:1px solid ${c===SPR.activeColor?'#58a6ff':'#30363d'};border-radius:2px;cursor:pointer;flex-shrink:0" title="${c}" onclick="SPR_setColor('${c}')"></div>`).join('');
}
function SPR_setColor(hex){
    SPR.activeColor=hex;
    const CBG=`url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGElEQVQImWNgYGD4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==') repeat`;
    const el=document.getElementById('spr-active-color');const hexEl=document.getElementById('spr-color-hex');
    if(el)el.style.background=hex==='transparent'?CBG:hex;
    if(hexEl&&hex!=='transparent'){hexEl.value=hex;document.getElementById('spr-color-input').value=hex;}
    renderPalette();
}
function SPR_setOpacity(v){SPR.opacity=parseInt(v);}
function SPR_addColor(){if(!SPR.palette.includes(SPR.activeColor)){SPR.palette.push(SPR.activeColor);renderPalette();}}
function SPR_exportPalette(){const blob=new Blob(['JASC-PAL\n0100\n'+SPR.palette.length+'\n'+SPR.palette.filter(c=>c!=='transparent').map(c=>{const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);return`${r} ${g} ${b}`;}).join('\n')],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='palette.pal';a.click();}
function SPR_importPalette(){const input=document.createElement('input');input.type='file';input.accept='.pal,.txt';input.onchange=e=>{const reader=new FileReader();reader.onload=ev=>{const lines=ev.target.result.split('\n').slice(3);SPR.palette=lines.filter(l=>l.trim()).slice(0,32).map(l=>{const[r,g,b]=l.split(' ').map(Number);return rgbToHex(r,g,b);});renderPalette();};reader.readAsText(e.target.files[0]);};input.click();}

function SPR_setTool(tool,btn){SPR.tool=tool;document.querySelectorAll('[id^="spr-tool-"]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');SPR.canvas.style.cursor={pencil:'crosshair',erase:'cell',fill:'copy',eyedropper:'zoom-in',rect:'crosshair',line:'crosshair'}[tool]||'crosshair';}
function SPR_clear(){pushSpriteUndo();SPR.pixels.fill(0);syncFrame();redrawCanvas();}
function SPR_flipH(){pushSpriteUndo();const{pixels,width,height}=SPR;for(let y=0;y<height;y++)for(let x=0;x<Math.floor(width/2);x++){const a=y*width+x,b=y*width+(width-1-x);[pixels[a],pixels[b]]=[pixels[b],pixels[a]];}syncFrame();redrawCanvas();}
function SPR_flipV(){pushSpriteUndo();const{pixels,width,height}=SPR;for(let y=0;y<Math.floor(height/2);y++)for(let x=0;x<width;x++){const a=y*width+x,b=(height-1-y)*width+x;[pixels[a],pixels[b]]=[pixels[b],pixels[a]];}syncFrame();redrawCanvas();}
function SPR_resize(val){const[w,h]=val.split('x').map(Number);if(!confirm(`Resize to ${w}×${h}? Art will be cleared.`))return;newSpriteCanvas(w,h);SPR.pixels=SPR.frames[0];redrawCanvas();}

function syncFrame(){SPR.frames[SPR.activeFrame]=new Uint32Array(SPR.pixels);}
function SPR_addFrame(){SPR.frames.push(new Uint32Array(SPR.width*SPR.height));SPR_selectFrame(SPR.frames.length-1);renderFrameList();}
function SPR_selectFrame(i){syncFrame();SPR.activeFrame=i;SPR.pixels=new Uint32Array(SPR.frames[i]);renderFrameList();redrawCanvas();}
function renderFrameList(container){
    const el=(container||document).getElementById('spr-frame-list');if(!el)return;
    el.innerHTML=SPR.frames.map((frame,i)=>`<div style="display:flex;align-items:center;gap:4px;padding:2px;border-radius:3px;background:${i===SPR.activeFrame?'#1f3a5f':'transparent'};cursor:pointer;border:1px solid ${i===SPR.activeFrame?'#388bfd':'transparent'}" onclick="SPR_selectFrame(${i})"><div style="width:24px;height:24px;background:#0d1117;border:1px solid #30363d;border-radius:2px;font-size:8px;display:flex;align-items:center;justify-content:center;color:#484f58">${i+1}</div><span style="font-size:9px;color:#6e7681">Frame ${i+1}</span>${SPR.frames.length>1?`<span style="margin-left:auto;color:#f85149;cursor:pointer;font-size:11px" onclick="event.stopPropagation();SPR_deleteFrame(${i})">✕</span>`:''}</div>`).join('');
}
function SPR_deleteFrame(i){if(SPR.frames.length<=1)return;SPR.frames.splice(i,1);SPR.activeFrame=Math.min(SPR.activeFrame,SPR.frames.length-1);SPR.pixels=new Uint32Array(SPR.frames[SPR.activeFrame]);renderFrameList();redrawCanvas();}

let sprPlayInterval=null;
function SPR_play(){const btn=document.getElementById('spr-play-btn');if(sprPlayInterval){clearInterval(sprPlayInterval);sprPlayInterval=null;if(btn)btn.textContent='▶ Play';return;}if(btn)btn.textContent='■ Stop';let i=0;sprPlayInterval=setInterval(()=>{i=(i+1)%SPR.frames.length;SPR_selectFrame(i);},1000/(SPR.playFPS||8));}

function pixelsToImageData(pixels,w,h){const id=new ImageData(w,h);for(let i=0;i<pixels.length;i++){const px=pixels[i],a=(px>>>24)&0xff;id.data[i*4]=(px>>>16)&0xff;id.data[i*4+1]=(px>>>8)&0xff;id.data[i*4+2]=px&0xff;id.data[i*4+3]=a;}return id;}
function framesDataURL(){const{width,height,frames}=SPR;const c=document.createElement('canvas');c.width=width*frames.length;c.height=height;const ctx=c.getContext('2d');frames.forEach((frame,i)=>{const off=document.createElement('canvas');off.width=width;off.height=height;off.getContext('2d').putImageData(pixelsToImageData(frame,width,height),0,0);ctx.drawImage(off,i*width,0);});return c.toDataURL('image/png');}
function SPR_export(mode){syncFrame();let dataUrl=mode==='sheet'?framesDataURL():(()=>{const c=document.createElement('canvas');c.width=SPR.width;c.height=SPR.height;c.getContext('2d').putImageData(pixelsToImageData(SPR.pixels,SPR.width,SPR.height),0,0);return c.toDataURL('image/png');})();const a=document.createElement('a');a.href=dataUrl;a.download=mode==='sheet'?'sprite-sheet.png':'sprite.png';a.click();}
function SPR_exportDataURL(){syncFrame();const c=document.createElement('canvas');c.width=SPR.width;c.height=SPR.height;c.getContext('2d').putImageData(pixelsToImageData(SPR.pixels,SPR.width,SPR.height),0,0);const dataUrl=c.toDataURL('image/png');const name='sprite_'+Date.now()+'.png';if(typeof GDS!=='undefined'){GDS.assets.push({name,type:'image',dataUrl,created:Date.now()});if(typeof saveState==='function')saveState();if(typeof renderAssets==='function')renderAssets();}if(typeof log==='function')log('Added to assets: '+name,'ok');}
function SPR_exportJS(){
    syncFrame();const{width,height,pixels}=SPR;const data=[];
    for(let i=0;i<pixels.length;i++){const px=pixels[i];data.push('0x'+px.toString(16).padStart(8,'0'));}
    const code=`// Sprite ${width}×${height} pixel data\nconst spriteData = {\n  width: ${width}, height: ${height},\n  pixels: new Uint32Array([${data.join(',')}])\n};`;
    navigator.clipboard?.writeText(code).then(()=>{if(typeof log==='function')log('Sprite JS copied to clipboard','ok');});
}
function SPR_importPNG(){document.getElementById('spr-import-input')?.click();}
function SPR_handleImport(event){
    const file=event.target.files[0];if(!file)return;
    const img=new Image();img.onload=()=>{
        const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
        newSpriteCanvas(img.width,img.height);const id=ctx.getImageData(0,0,img.width,img.height);
        for(let i=0;i<SPR.pixels.length;i++){const b=i*4,a=id.data[b+3];SPR.pixels[i]=a===0?0:((a<<24)|((id.data[b])<<16)|((id.data[b+1])<<8)|(id.data[b+2]));}
        syncFrame();redrawCanvas();
    };img.src=URL.createObjectURL(file);
}

function bindSpriteEvents(container){
    const canvas=container.querySelector('#spr-canvas');
    canvas.addEventListener('mousedown',e=>{
        e.preventDefault();SPR.isDrawing=true;
        const{x,y}=getPixelFromEvent(e);
        if(SPR.tool==='rect'){pushSpriteUndo();rectStart={x,y};}
        else if(SPR.tool==='line'){pushSpriteUndo();lineStart={x,y};}
        else{pushSpriteUndo();paint(x,y);}
        SPR.lastX=x;SPR.lastY=y;
    });
    canvas.addEventListener('mousemove',e=>{
        if(!SPR.isDrawing)return;
        const{x,y}=getPixelFromEvent(e);
        if(x===SPR.lastX&&y===SPR.lastY)return;
        if(SPR.tool==='pencil'||SPR.tool==='erase'){paintLine(SPR.lastX,SPR.lastY,x,y,SPR.tool==='erase'?0:colorToUint32(SPR.activeColor,SPR.opacity));redrawCanvas();syncFrame();}
        SPR.lastX=x;SPR.lastY=y;
    });
    canvas.addEventListener('mouseup',e=>{
        if(!SPR.isDrawing)return;
        SPR.isDrawing=false;
        const{x,y}=getPixelFromEvent(e);
        if(SPR.tool==='rect'&&rectStart){const rx=Math.min(rectStart.x,x),ry=Math.min(rectStart.y,y),rw=Math.abs(x-rectStart.x)+1,rh=Math.abs(y-rectStart.y)+1;const c32=colorToUint32(SPR.activeColor,SPR.opacity);for(let py=ry;py<ry+rh&&py<SPR.height;py++)for(let px=rx;px<rx+rw&&px<SPR.width;px++)SPR.pixels[py*SPR.width+px]=c32;rectStart=null;redrawCanvas();syncFrame();}
        else if(SPR.tool==='line'&&lineStart){paintLine(lineStart.x,lineStart.y,x,y,colorToUint32(SPR.activeColor,SPR.opacity));lineStart=null;redrawCanvas();syncFrame();}
    });
    canvas.addEventListener('mouseleave',()=>{if(SPR.isDrawing){SPR.isDrawing=false;}});
    canvas.addEventListener('wheel',e=>{e.preventDefault();SPR.zoom=Math.max(2,Math.min(32,SPR.zoom+(e.deltaY<0?2:-2)));redrawCanvas();},{passive:false});
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO WORKBENCH
// ═══════════════════════════════════════════════════════════════════════════════

let audioCtx=null;
function getAudioCtx(){if(!audioCtx||audioCtx.state==='closed')audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}

const SFX={type:'square',frequency:440,detune:0,attack:0.01,decay:0.1,sustain:0.3,release:0.3,duration:0.5,volume:0.5,pitch_sweep:0,vibrato:0,tremolo:0,cutoff:4000,distortion:0};

const PRESETS={
    jump:{type:'square',frequency:440,attack:0.01,decay:0.05,sustain:0,release:0.1,duration:0.15,pitch_sweep:8,volume:0.6,cutoff:8000},
    shoot:{type:'square',frequency:880,attack:0.001,decay:0.05,sustain:0,release:0.05,duration:0.1,pitch_sweep:-12,volume:0.5,cutoff:6000},
    collect:{type:'sine',frequency:660,attack:0.01,decay:0.1,sustain:0.2,release:0.2,duration:0.3,pitch_sweep:5,volume:0.5,cutoff:8000},
    explode:{type:'noise',frequency:200,attack:0.001,decay:0.2,sustain:0.1,release:0.3,duration:0.5,pitch_sweep:-5,volume:0.8,cutoff:1200},
    hit:{type:'square',frequency:200,attack:0.001,decay:0.1,sustain:0,release:0.05,duration:0.15,pitch_sweep:-4,volume:0.6,cutoff:3000},
    powerup:{type:'sawtooth',frequency:220,attack:0.01,decay:0.1,sustain:0.5,release:0.3,duration:0.6,pitch_sweep:12,volume:0.6,cutoff:5000},
    coin:{type:'sine',frequency:988,attack:0.01,decay:0.08,sustain:0,release:0.1,duration:0.2,pitch_sweep:3,volume:0.5,cutoff:8000},
    death:{type:'sawtooth',frequency:440,attack:0.01,decay:0.3,sustain:0.1,release:0.5,duration:0.8,pitch_sweep:-24,volume:0.7,cutoff:2000},
    beep:{type:'sine',frequency:880,attack:0.01,decay:0.05,sustain:0,release:0.1,duration:0.1,pitch_sweep:0,volume:0.4,cutoff:8000},
    laser:{type:'sawtooth',frequency:1200,attack:0.001,decay:0.15,sustain:0,release:0.1,duration:0.2,pitch_sweep:-16,volume:0.5,cutoff:8000},
    alarm:{type:'square',frequency:880,attack:0.01,decay:0.1,sustain:0.5,release:0.1,duration:0.4,vibrato:8,tremolo:10,volume:0.5,cutoff:6000},
    wind:{type:'noise',frequency:400,attack:0.3,decay:0.3,sustain:0.5,release:0.5,duration:1.5,pitch_sweep:0,volume:0.3,cutoff:600},
};

function createNoiseBuffer(ctx,duration){const len=Math.ceil(ctx.sampleRate*duration);const buf=ctx.createBuffer(1,len,ctx.sampleRate);const data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=Math.random()*2-1;return buf;}

function playSFX(params){
    const ctx=getAudioCtx(),now=ctx.currentTime,p={...SFX,...params};
    const{attack,decay,sustain,release,duration,volume}=p;
    const gain=ctx.createGain();
    gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+attack);gain.gain.linearRampToValueAtTime(volume*sustain,now+attack+decay);gain.gain.setValueAtTime(volume*sustain,now+duration-release);gain.gain.linearRampToValueAtTime(0,now+duration);
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(p.cutoff,now);
    let waveshaper=null;
    if(p.distortion>0){waveshaper=ctx.createWaveShaper();const n=256,curve=new Float32Array(n);for(let i=0;i<n;i++){const x=(i*2/n)-1;curve[i]=(Math.PI+p.distortion*400)*x/(Math.PI+p.distortion*400*Math.abs(x));}waveshaper.curve=curve;waveshaper.oversample='2x';}
    let source;
    if(p.type==='noise'){source=ctx.createBufferSource();source.buffer=createNoiseBuffer(ctx,duration+0.1);if(p.pitch_sweep!==0)filter.frequency.linearRampToValueAtTime(p.cutoff*Math.pow(2,p.pitch_sweep/12),now+duration);}
    else{
        source=ctx.createOscillator();source.type=p.type;source.frequency.setValueAtTime(p.frequency,now);if(p.detune)source.detune.setValueAtTime(p.detune,now);if(p.pitch_sweep!==0)source.frequency.linearRampToValueAtTime(p.frequency*Math.pow(2,p.pitch_sweep/12),now+duration);
        if(p.vibrato>0){const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.setValueAtTime(6,now);lg.gain.setValueAtTime(p.vibrato,now);lfo.connect(lg);lg.connect(source.frequency);lfo.start(now);lfo.stop(now+duration+0.05);}
        if(p.tremolo>0){const tl=ctx.createOscillator(),tg=ctx.createGain();tl.frequency.setValueAtTime(8,now);tg.gain.setValueAtTime(p.tremolo*0.1,now);tl.connect(tg);tg.connect(gain.gain);tl.start(now);tl.stop(now+duration+0.05);}
    }
    let node=source;if(waveshaper){node.connect(waveshaper);node=waveshaper;}node.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.start(now);source.stop(now+duration+0.1);
    return{source,gain,filter};
}

async function exportWAV(params){
    const p={...SFX,...params},sampleRate=44100,numSamples=Math.ceil((p.duration+0.2)*sampleRate);
    const offCtx=new OfflineAudioContext(1,numSamples,sampleRate);
    const gain=offCtx.createGain();
    gain.gain.setValueAtTime(0,0);gain.gain.linearRampToValueAtTime(p.volume,p.attack);gain.gain.linearRampToValueAtTime(p.volume*p.sustain,p.attack+p.decay);gain.gain.setValueAtTime(p.volume*p.sustain,p.duration-p.release);gain.gain.linearRampToValueAtTime(0,p.duration);
    const filter=offCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(p.cutoff,0);
    let source;
    if(p.type==='noise'){source=offCtx.createBufferSource();source.buffer=createNoiseBuffer(offCtx,p.duration+0.2);}
    else{source=offCtx.createOscillator();source.type=p.type;source.frequency.setValueAtTime(p.frequency,0);if(p.pitch_sweep!==0)source.frequency.linearRampToValueAtTime(p.frequency*Math.pow(2,p.pitch_sweep/12),p.duration);}
    source.connect(filter);filter.connect(gain);gain.connect(offCtx.destination);source.start(0);source.stop(p.duration+0.1);
    const rendered=await offCtx.startRendering();
    const numCh=rendered.numberOfChannels,ns=rendered.length,bps=2,ba=numCh*bps,br=sampleRate*ba,ds=ns*ba,ab=new ArrayBuffer(44+ds),view=new DataView(ab);
    let o=0;const ws=(s)=>{for(let i=0;i<s.length;i++)view.setUint8(o++,s.charCodeAt(i));};
    ws('RIFF');view.setUint32(o,36+ds,true);o+=4;ws('WAVEfmt ');view.setUint32(o,16,true);o+=4;view.setUint16(o,1,true);o+=2;view.setUint16(o,numCh,true);o+=2;view.setUint32(o,sampleRate,true);o+=4;view.setUint32(o,br,true);o+=4;view.setUint16(o,ba,true);o+=2;view.setUint16(o,16,true);o+=2;ws('data');view.setUint32(o,ds,true);o+=4;
    const data=rendered.getChannelData(0);for(let i=0;i<ns;i++){const s=Math.max(-1,Math.min(1,data[i]));view.setInt16(o,s<0?s*0x8000:s*0x7fff,true);o+=2;}
    return new Blob([ab],{type:'audio/wav'});
}

function buildAudioUI(container){
    container.innerHTML=`<div style="display:flex;flex-direction:column;height:100%;overflow:hidden">
      <div style="padding:4px 8px;background:#010409;border-bottom:1px solid #21262d;flex-shrink:0">
        <div style="font-size:10px;color:#484f58;margin-bottom:4px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Presets</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px">${Object.keys(PRESETS).map(k=>`<button class="scene-tool" onclick="AUD_loadPreset('${k}')" style="font-size:9px">${k}</button>`).join('')}</div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:6px">
        <div><div class="prop-label">Waveform</div><div style="display:flex;gap:3px">${['sine','square','sawtooth','triangle','noise'].map(t=>`<button class="scene-tool" id="aud-type-${t}" onclick="AUD_setType('${t}')" style="font-size:9px;flex:1">${t}</button>`).join('')}</div></div>
        ${audSlider('frequency','Frequency (Hz)',20,2000,440,1)}${audSlider('detune','Detune (cents)',-100,100,0,1)}${audSlider('pitch_sweep','Pitch Sweep',-24,24,0,1)}
        ${audSlider('attack','Attack',0.001,2,0.01,0.001)}${audSlider('decay','Decay',0.001,2,0.1,0.001)}${audSlider('sustain','Sustain',0,1,0.3,0.01)}${audSlider('release','Release',0.001,2,0.3,0.001)}${audSlider('duration','Duration (s)',0.05,3,0.5,0.01)}${audSlider('volume','Volume',0,1,0.5,0.01)}
        ${audSlider('cutoff','Filter Cutoff',50,20000,4000,10)}${audSlider('distortion','Distortion',0,1,0,0.01)}${audSlider('vibrato','Vibrato',0,50,0,1)}${audSlider('tremolo','Tremolo',0,10,0,0.1)}
      </div>
      <div style="padding:6px 8px;background:#010409;border-top:1px solid #21262d;display:flex;gap:4px;flex-shrink:0;flex-wrap:wrap">
        <button class="tb-btn primary" onclick="AUD_play()" style="flex:1">▶ Play</button>
        <button class="scene-tool" onclick="AUD_downloadWAV()" style="font-size:10px;flex:1">⬇ WAV</button>
        <button class="scene-tool" onclick="AUD_copyJS()" style="font-size:10px;flex:1">📜 JS</button>
        <button class="scene-tool" onclick="AUD_addToAssets()" style="font-size:10px;flex:1">📦 Assets</button>
        <button class="scene-tool" onclick="AUD_randomize()" style="font-size:10px;flex:1">🎲 Random</button>
      </div>
    </div>`;
    setTimeout(()=>AUD_setType(SFX.type),10);
}
function audSlider(key,label,min,max,def,step){return`<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px"><span class="prop-label" style="margin:0">${label}</span><span id="aud-val-${key}" style="font-size:10px;color:#58a6ff;font-family:monospace">${def}</span></div><input type="range" id="aud-${key}" min="${min}" max="${max}" value="${def}" step="${step}" style="width:100%" oninput="SFX['${key}']=parseFloat(this.value);document.getElementById('aud-val-${key}').textContent=parseFloat(this.value).toFixed(${step<0.01?3:step<0.1?2:step<1?1:0})"></div>`;}
function AUD_setType(type){SFX.type=type;document.querySelectorAll('[id^="aud-type-"]').forEach(b=>b.classList.remove('active'));document.getElementById('aud-type-'+type)?.classList.add('active');}
function AUD_loadPreset(name){const preset=PRESETS[name];if(!preset)return;Object.assign(SFX,preset);Object.keys(SFX).forEach(k=>{const el=document.getElementById('aud-'+k);if(el){el.value=SFX[k];const val=document.getElementById('aud-val-'+k);if(val)val.textContent=SFX[k];}});AUD_setType(SFX.type);AUD_play();if(typeof log==='function')log('Loaded preset: '+name,'info');}
function AUD_play(){playSFX({});}
async function AUD_downloadWAV(){const blob=await exportWAV({});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sfx_'+Date.now()+'.wav';a.click();if(typeof log==='function')log('WAV exported','ok');}
async function AUD_addToAssets(){const blob=await exportWAV({});const name='sfx_'+SFX.type+'_'+Date.now()+'.wav';const reader=new FileReader();reader.onload=e=>{if(typeof GDS!=='undefined'){GDS.assets.push({name,type:'audio',dataUrl:e.target.result,created:Date.now()});if(typeof saveState==='function')saveState();if(typeof renderAssets==='function')renderAssets();if(typeof log==='function')log('Added to assets: '+name,'ok');}};reader.readAsDataURL(blob);}
function AUD_copyJS(){const params=Object.entries(SFX).map(([k,v])=>`  ${k}: ${typeof v==='string'?`'${v}'`:v}`).join(',\n');navigator.clipboard?.writeText(`const sfxParams = {\n${params}\n};\n// playSFX(sfxParams);`).then(()=>{if(typeof log==='function')log('Copied SFX code','ok');});}
function AUD_randomize(){const types=['sine','square','sawtooth','triangle','noise'];SFX.type=types[Math.floor(Math.random()*types.length)];SFX.frequency=Math.random()*1500+100;SFX.pitch_sweep=(Math.random()-0.5)*30;SFX.attack=Math.random()*0.1;SFX.decay=Math.random()*0.3;SFX.sustain=Math.random()*0.5;SFX.release=Math.random()*0.4;SFX.duration=Math.random()*0.6+0.1;SFX.volume=0.4+Math.random()*0.4;SFX.cutoff=Math.random()*6000+500;Object.keys(SFX).forEach(k=>{const el=document.getElementById('aud-'+k);if(el){el.value=SFX[k];const val=document.getElementById('aud-val-'+k);if(val)val.textContent=parseFloat(SFX[k]).toFixed(2);}});AUD_setType(SFX.type);AUD_play();}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE DESIGNER — visual particle system editor
// ═══════════════════════════════════════════════════════════════════════════════

const PD = {
    canvas: null, ctx: null, animFrame: null, running: false,
    particles: [],
    config: {
        count: 30, speed: 80, spread: 360, angle: 270, lifetime: 1.2,
        sizeStart: 8, sizeEnd: 0, colorStart: '#ffcc00', colorEnd: '#ff4400',
        gravity: 120, fadeOut: true, shape: 'circle', rate: 15, burst: true,
    },
    presets: {
        fire:      {count:40,speed:60,spread:30,angle:270,lifetime:1.2,sizeStart:10,sizeEnd:0,colorStart:'#ff8800',colorEnd:'#ff0000',gravity:-80,fadeOut:true,shape:'circle'},
        smoke:     {count:20,speed:25,spread:20,angle:270,lifetime:2.5,sizeStart:15,sizeEnd:25,colorStart:'#888888',colorEnd:'#333333',gravity:-30,fadeOut:true,shape:'circle'},
        explosion: {count:60,speed:180,spread:360,angle:0,lifetime:0.7,sizeStart:12,sizeEnd:0,colorStart:'#ffee00',colorEnd:'#ff2200',gravity:60,fadeOut:true,shape:'circle'},
        sparkle:   {count:25,speed:100,spread:360,angle:0,lifetime:1.0,sizeStart:4,sizeEnd:0,colorStart:'#ffffff',colorEnd:'#88aaff',gravity:40,fadeOut:true,shape:'star'},
        rain:      {count:50,speed:300,spread:10,angle:90,lifetime:0.8,sizeStart:3,sizeEnd:2,colorStart:'#aaddff',colorEnd:'#6699cc',gravity:200,fadeOut:false,shape:'circle'},
        snow:      {count:30,speed:20,spread:30,angle:90,lifetime:4.0,sizeStart:4,sizeEnd:4,colorStart:'#ffffff',colorEnd:'#ddddff',gravity:20,fadeOut:true,shape:'circle'},
        confetti:  {count:50,speed:120,spread:180,angle:270,lifetime:2.5,sizeStart:6,sizeEnd:5,colorStart:'#ff0088',colorEnd:'#00ffcc',gravity:60,fadeOut:true,shape:'square'},
        portal:    {count:35,speed:70,spread:360,angle:0,lifetime:1.5,sizeStart:5,sizeEnd:0,colorStart:'#aa44ff',colorEnd:'#0044ff',gravity:-20,fadeOut:true,shape:'circle'},
    },
};

function initParticleDesigner(container){
    container.innerHTML = buildParticleDesignerUI();
    PD.canvas = container.querySelector('#pd-canvas');
    PD.ctx = PD.canvas.getContext('2d');
    PD.running = true;
    pdLoop();
    pdApplyPreset('explosion');
}

function buildParticleDesignerUI(){
    return `<div style="display:flex;flex-direction:column;height:100%;overflow:hidden">
      <!-- Presets -->
      <div style="padding:4px 8px;background:#010409;border-bottom:1px solid #21262d;flex-shrink:0">
        <div style="font-size:10px;color:#484f58;margin-bottom:4px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Presets</div>
        <div style="display:flex;flex-wrap:wrap;gap:3px">${Object.keys(PD.presets).map(k=>`<button class="scene-tool" onclick="pdApplyPreset('${k}')" style="font-size:9px">${k}</button>`).join('')}</div>
      </div>
      <!-- Preview canvas -->
      <div style="background:#0d0d1a;height:140px;flex-shrink:0;position:relative;cursor:crosshair;border-bottom:1px solid #21262d" onclick="pdEmit(event)">
        <canvas id="pd-canvas" style="width:100%;height:100%"></canvas>
        <div style="position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:9px;color:#484f58">Click to emit</div>
      </div>
      <!-- Controls -->
      <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:5px">
        <!-- Shape -->
        <div><div class="prop-label">Shape</div><div style="display:flex;gap:3px">${['circle','square','star'].map(s=>`<button class="scene-tool" id="pd-shape-${s}" onclick="pdSet('shape','${s}',this)" style="font-size:9px;flex:1">${s}</button>`).join('')}</div></div>
        <!-- Type -->
        <div><div class="prop-label">Emit Mode</div><div style="display:flex;gap:3px"><button class="scene-tool active" id="pd-mode-burst" onclick="pdSet('burst',true,this)" style="font-size:9px;flex:1">Burst</button><button class="scene-tool" id="pd-mode-stream" onclick="pdSet('burst',false,this)" style="font-size:9px;flex:1">Stream</button></div></div>
        ${pdSlider('count','Particle Count',1,200,30,1)}
        ${pdSlider('speed','Speed',10,400,80,1)}
        ${pdSlider('spread','Spread (°)',0,360,360,1)}
        ${pdSlider('angle','Angle (°)',0,360,270,1)}
        ${pdSlider('lifetime','Lifetime (s)',0.1,5,1.2,0.1)}
        ${pdSlider('sizeStart','Size Start',1,40,8,1)}
        ${pdSlider('sizeEnd','Size End',0,40,0,1)}
        ${pdSlider('gravity','Gravity',-300,300,120,1)}
        <!-- Colors -->
        <div style="display:flex;gap:8px;align-items:center">
          <div><div class="prop-label">Start Color</div><input type="color" value="#ffcc00" id="pd-colorStart" oninput="PD.config.colorStart=this.value" style="width:50px;height:24px;border:none;background:transparent;cursor:pointer"></div>
          <div><div class="prop-label">End Color</div><input type="color" value="#ff4400" id="pd-colorEnd" oninput="PD.config.colorEnd=this.value" style="width:50px;height:24px;border:none;background:transparent;cursor:pointer"></div>
          <label style="font-size:10px;color:#6e7681;display:flex;align-items:center;gap:3px"><input type="checkbox" checked onchange="PD.config.fadeOut=this.checked"> Fade</label>
        </div>
      </div>
      <!-- Actions -->
      <div style="padding:6px 8px;background:#010409;border-top:1px solid #21262d;display:flex;gap:4px;flex-shrink:0">
        <button class="tb-btn primary" onclick="pdEmitCenter()" style="flex:1">▶ Emit</button>
        <button class="scene-tool" onclick="pdCopyJS()" style="font-size:10px;flex:1">📜 Copy JS</button>
        <button class="scene-tool" onclick="pdClear()" style="font-size:10px">🗑</button>
      </div>
    </div>`;
}

function pdSlider(key,label,min,max,def,step){
    return`<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px"><span class="prop-label" style="margin:0">${label}</span><span id="pd-val-${key}" style="font-size:10px;color:#58a6ff;font-family:monospace">${def}</span></div><input type="range" id="pd-${key}" min="${min}" max="${max}" value="${def}" step="${step}" style="width:100%" oninput="PD.config['${key}']=parseFloat(this.value);document.getElementById('pd-val-${key}').textContent=parseFloat(this.value).toFixed(${step<1?1:0})"></div>`;
}

function pdSet(key,val,btn){
    PD.config[key]=val;
    if(key==='shape')document.querySelectorAll('[id^="pd-shape-"]').forEach(b=>b.classList.remove('active'));
    if(key==='burst'){document.getElementById('pd-mode-burst').classList.toggle('active',val===true);document.getElementById('pd-mode-stream').classList.toggle('active',val===false);}
    if(btn)btn.classList.add('active');
    pdEmitCenter();
}

function pdApplyPreset(name){
    const p=PD.presets[name];if(!p)return;
    Object.assign(PD.config,p);
    Object.keys(p).forEach(k=>{
        const el=document.getElementById('pd-'+k);if(el&&el.type==='range'){el.value=p[k];const vEl=document.getElementById('pd-val-'+k);if(vEl)vEl.textContent=p[k];}
        if(k==='colorStart'){const el2=document.getElementById('pd-colorStart');if(el2)el2.value=p[k];}
        if(k==='colorEnd'){const el2=document.getElementById('pd-colorEnd');if(el2)el2.value=p[k];}
        if(k==='shape'){document.querySelectorAll('[id^="pd-shape-"]').forEach(b=>b.classList.remove('active'));document.getElementById('pd-shape-'+p[k])?.classList.add('active');}
    });
    pdEmitCenter();
}

function pdEmit(event){
    if(!PD.canvas)return;
    const rect=PD.canvas.getBoundingClientRect();
    const x=(event.clientX-rect.left)*(PD.canvas.width/rect.width);
    const y=(event.clientY-rect.top)*(PD.canvas.height/rect.height);
    pdSpawn(x,y);
}
function pdEmitCenter(){if(!PD.canvas)return;pdClear();pdSpawn(PD.canvas.width/2,PD.canvas.height*0.6);}
function pdClear(){PD.particles=[];}

function pdSpawn(x,y){
    const c=PD.config;
    for(let i=0;i<c.count;i++){
        const angle=(c.angle+(Math.random()-.5)*c.spread)*Math.PI/180;
        const spd=c.speed*(0.5+Math.random()*0.5);
        PD.particles.push({x,y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,life:c.lifetime,maxLife:c.lifetime,shape:c.shape,cfg:{...c}});
    }
}

let pdLastTime=0;
function pdLoop(ts=0){
    if(!PD.running)return;
    const dt=Math.min((ts-pdLastTime)/1000,.05); pdLastTime=ts;
    if(!PD.canvas){requestAnimationFrame(pdLoop);return;}
    PD.canvas.width=PD.canvas.offsetWidth||200; PD.canvas.height=PD.canvas.offsetHeight||140;
    const ctx=PD.ctx;
    ctx.clearRect(0,0,PD.canvas.width,PD.canvas.height);
    // Dark grid background
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
    for(let x=0;x<PD.canvas.width;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,PD.canvas.height);ctx.stroke();}
    for(let y=0;y<PD.canvas.height;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(PD.canvas.width,y);ctx.stroke();}
    // Update + draw particles
    PD.particles=PD.particles.filter(p=>{
        p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=p.cfg.gravity*dt;
        if(p.life<=0)return false;
        const t=1-(p.life/p.maxLife);
        const size=p.cfg.sizeStart+(p.cfg.sizeEnd-p.cfg.sizeStart)*t;
        const alpha=p.cfg.fadeOut?(p.life/p.maxLife):1;
        const color=pdLerpColor(p.cfg.colorStart,p.cfg.colorEnd,t);
        ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle=color;
        ctx.beginPath();
        if(p.shape==='square'){ctx.rect(p.x-size/2,p.y-size/2,size,size);}
        else if(p.shape==='star'){pdDrawStar(ctx,p.x,p.y,size*0.4,size*0.8,5);}
        else{ctx.arc(p.x,p.y,Math.max(.1,size/2),0,Math.PI*2);}
        ctx.fill(); ctx.restore();
        return true;
    });
    requestAnimationFrame(pdLoop);
}

function pdLerpColor(a,b,t){const pa=pdParseColor(a),pb=pdParseColor(b);return`rgb(${Math.round(pa[0]+(pb[0]-pa[0])*t)},${Math.round(pa[1]+(pb[1]-pa[1])*t)},${Math.round(pa[2]+(pb[2]-pa[2])*t)})`;}
function pdParseColor(hex){return[parseInt(hex.slice(1,3),16)||0,parseInt(hex.slice(3,5),16)||0,parseInt(hex.slice(5,7),16)||0];}
function pdDrawStar(ctx,x,y,r1,r2,pts){ctx.beginPath();for(let i=0;i<pts*2;i++){const r=i%2===0?r2:r1,a=i*Math.PI/pts-Math.PI/2;if(i===0)ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a));else ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();}

function pdCopyJS(){
    const c=PD.config;
    const code=`// Particle effect config\nconst particleConfig = ${JSON.stringify(c,null,2)};\n// engine.particles.emit(x, y, particleConfig);`;
    navigator.clipboard?.writeText(code).then(()=>{if(typeof log==='function')log('Particle config copied','ok');});
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION TIMELINE — keyframe editor
// ═══════════════════════════════════════════════════════════════════════════════

const TL = {
    tracks: [],         // [{name, property, keyframes:[{time, value}]}]
    duration: 3.0,      // total timeline length (seconds)
    currentTime: 0,
    playing: false,
    loop: true,
    pixelsPerSecond: 80,
    selectedKf: null,
    dragging: null,
    animFrame: null,
    lastTime: 0,
    canvas: null,
    ctx: null,
    onChange: null,     // callback when values change
};

function initTimeline(container, onChange){
    TL.onChange = onChange || null;
    container.innerHTML = buildTimelineUI();
    TL.canvas = container.querySelector('#tl-canvas');
    TL.ctx = TL.canvas.getContext('2d');
    bindTimelineEvents();
    // Add some starter tracks
    if(!TL.tracks.length){
        tlAddTrack('entity.x', 'position.x');
        tlAddTrack('entity.y', 'position.y');
        TL.tracks[0].keyframes = [{time:0,value:100},{time:1.5,value:300},{time:3,value:100}];
        TL.tracks[1].keyframes = [{time:0,value:100},{time:1.5,value:50},{time:3,value:100}];
    }
    tlRedraw();
}

function buildTimelineUI(){
    return `<div style="display:flex;flex-direction:column;height:100%;overflow:hidden;background:#010409">
      <!-- Transport bar -->
      <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid #21262d;flex-shrink:0">
        <button class="scene-tool" id="tl-play-btn" onclick="tlTogglePlay()" title="Play/Pause">▶</button>
        <button class="scene-tool" onclick="tlStop()" title="Stop">■</button>
        <label style="font-size:10px;color:#6e7681;display:flex;align-items:center;gap:3px"><input type="checkbox" checked onchange="TL.loop=this.checked"> Loop</label>
        <div style="font-size:10px;color:#58a6ff;font-family:monospace" id="tl-time-display">0.000s</div>
        <div style="flex:1"></div>
        <span class="prop-label" style="margin:0;margin-right:4px">Duration</span>
        <input type="number" value="3" min="0.5" max="30" step="0.5" style="width:50px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:2px 4px;border-radius:3px;font-size:10px" onchange="TL.duration=parseFloat(this.value);tlRedraw()">
        <button class="scene-tool" onclick="tlAddTrackPrompt()" style="font-size:9px">+ Track</button>
      </div>
      <!-- Track list + canvas area -->
      <div style="display:flex;flex:1;min-height:0;overflow:hidden">
        <!-- Left: track names -->
        <div id="tl-track-names" style="width:120px;flex-shrink:0;border-right:1px solid #21262d;overflow-y:auto;background:#010409">
          <div style="height:24px;border-bottom:1px solid #21262d;display:flex;align-items:center;padding:0 6px;font-size:9px;color:#484f58">TRACKS</div>
          <div id="tl-names-list"></div>
        </div>
        <!-- Right: timeline canvas -->
        <div style="flex:1;overflow:hidden;position:relative">
          <canvas id="tl-canvas" style="display:block;width:100%;height:100%;cursor:crosshair"></canvas>
        </div>
      </div>
    </div>`;
}

function tlAddTrack(name, property){
    TL.tracks.push({id:Date.now(),name:name||'Track '+(TL.tracks.length+1),property:property||'x',keyframes:[{time:0,value:0},{time:TL.duration,value:100}]});
    tlRenderNames();tlRedraw();
}
function tlAddTrackPrompt(){
    const name=prompt('Track name (e.g. entity.x):','entity.x');if(!name)return;
    tlAddTrack(name,name);
}
function tlRemoveTrack(id){TL.tracks=TL.tracks.filter(t=>t.id!==id);tlRenderNames();tlRedraw();}

function tlRenderNames(){
    const el=document.getElementById('tl-names-list');if(!el)return;
    el.innerHTML=TL.tracks.map((t,i)=>`<div style="height:32px;display:flex;align-items:center;padding:0 6px;border-bottom:1px solid #161b22;gap:4px">
      <div style="width:8px;height:8px;border-radius:50%;background:${tlTrackColor(i)};flex-shrink:0"></div>
      <span style="font-size:9px;color:#c9d1d9;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${t.name}">${t.name}</span>
      <span style="font-size:11px;color:#484f58;cursor:pointer" onclick="tlRemoveTrack(${t.id})">✕</span>
    </div>`).join('');
}

function tlTrackColor(i){return['#58a6ff','#3fb950','#ff7b72','#d2a8ff','#ffa657','#79c0ff'][i%6];}

const RULER_H=24,TRACK_H=32;
function tlRedraw(){
    const canvas=TL.canvas;if(!canvas)return;
    canvas.width=canvas.offsetWidth||400; canvas.height=canvas.offsetHeight||200;
    const ctx=TL.ctx,w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);

    // Ruler
    ctx.fillStyle='#0d1117'; ctx.fillRect(0,0,w,RULER_H);
    ctx.strokeStyle='#21262d'; ctx.beginPath(); ctx.moveTo(0,RULER_H); ctx.lineTo(w,RULER_H); ctx.stroke();
    const pps=TL.pixelsPerSecond;
    for(let t=0;t<=TL.duration+.01;t+=0.5){
        const x=t*pps+1; if(x>w)break;
        ctx.fillStyle='#484f58'; ctx.font='9px monospace'; ctx.textAlign='center';
        ctx.fillText(t.toFixed(1)+'s',x,RULER_H-3);
        ctx.strokeStyle='#21262d'; ctx.beginPath(); ctx.moveTo(x,RULER_H-8); ctx.lineTo(x,RULER_H); ctx.stroke();
    }

    // Track backgrounds
    TL.tracks.forEach((track,ti)=>{
        const y=RULER_H+ti*TRACK_H;
        ctx.fillStyle=ti%2===0?'#0d1117':'#010409';
        ctx.fillRect(0,y,w,TRACK_H);
        ctx.strokeStyle='#161b22'; ctx.beginPath(); ctx.moveTo(0,y+TRACK_H); ctx.lineTo(w,y+TRACK_H); ctx.stroke();

        // Bezier curve connecting keyframes
        if(track.keyframes.length>1){
            ctx.strokeStyle=tlTrackColor(ti); ctx.lineWidth=1.5; ctx.setLineDash([]);
            ctx.beginPath();
            const ky=y+TRACK_H/2;
            const first=track.keyframes[0];
            ctx.moveTo(first.time*pps,ky);
            for(let i=1;i<track.keyframes.length;i++){
                const prev=track.keyframes[i-1],curr=track.keyframes[i];
                const px=prev.time*pps,cx=curr.time*pps;
                ctx.bezierCurveTo(px+(cx-px)*0.5,ky,px+(cx-px)*0.5,ky,cx,ky);
            }
            ctx.stroke(); ctx.lineWidth=1;
        }

        // Keyframe diamonds
        track.keyframes.forEach((kf,ki)=>{
            const x=kf.time*pps, ky2=y+TRACK_H/2;
            const isSelected=TL.selectedKf?.track===ti&&TL.selectedKf?.kf===ki;
            ctx.save();
            ctx.fillStyle=isSelected?'#fff':tlTrackColor(ti);
            ctx.strokeStyle=isSelected?tlTrackColor(ti):'rgba(0,0,0,0.4)';
            ctx.lineWidth=1.5;
            ctx.beginPath();
            ctx.moveTo(x,ky2-6); ctx.lineTo(x+5,ky2); ctx.lineTo(x,ky2+6); ctx.lineTo(x-5,ky2); ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.restore();
        });
    });

    // Playhead
    const px=TL.currentTime*pps;
    ctx.strokeStyle='#f85149'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,h); ctx.stroke();
    ctx.fillStyle='#f85149'; ctx.beginPath(); ctx.moveTo(px-5,0); ctx.lineTo(px+5,0); ctx.lineTo(px,8); ctx.closePath(); ctx.fill();

    // Time display
    const td=document.getElementById('tl-time-display');
    if(td)td.textContent=TL.currentTime.toFixed(3)+'s';

    // Sync names height
    tlRenderNames();
}

function tlTogglePlay(){
    TL.playing=!TL.playing;
    const btn=document.getElementById('tl-play-btn');
    if(btn)btn.textContent=TL.playing?'⏸':'▶';
    if(TL.playing){TL.lastTime=performance.now();tlAnimate();}
}
function tlStop(){TL.playing=false;TL.currentTime=0;const btn=document.getElementById('tl-play-btn');if(btn)btn.textContent='▶';tlRedraw();}

function tlAnimate(){
    if(!TL.playing)return;
    const now=performance.now();
    const dt=(now-TL.lastTime)/1000; TL.lastTime=now;
    TL.currentTime+=dt;
    if(TL.currentTime>=TL.duration){
        if(TL.loop)TL.currentTime=0;
        else{TL.playing=false;TL.currentTime=TL.duration;const btn=document.getElementById('tl-play-btn');if(btn)btn.textContent='▶';}
    }
    const values={};
    TL.tracks.forEach(track=>{values[track.property]=tlGetValue(track,TL.currentTime);});
    TL.onChange?.(values,TL.currentTime);
    tlRedraw();
    if(TL.playing)requestAnimationFrame(tlAnimate);
}

function tlGetValue(track,t){
    const kfs=track.keyframes;if(!kfs.length)return 0;
    if(t<=kfs[0].time)return kfs[0].value;
    if(t>=kfs[kfs.length-1].time)return kfs[kfs.length-1].value;
    for(let i=1;i<kfs.length;i++){
        if(t<=kfs[i].time){
            const a=kfs[i-1],b=kfs[i];
            const p=(t-a.time)/(b.time-a.time);
            const e=p*p*(3-2*p); // smoothstep
            return a.value+(b.value-a.value)*e;
        }
    }
    return 0;
}

function bindTimelineEvents(){
    const canvas=TL.canvas;if(!canvas)return;
    canvas.addEventListener('mousedown',e=>{
        const rect=canvas.getBoundingClientRect();
        const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
        const my=(e.clientY-rect.top)*(canvas.height/rect.height);
        const pps=TL.pixelsPerSecond;
        // Click on ruler → seek
        if(my<RULER_H){TL.currentTime=Math.max(0,Math.min(TL.duration,mx/pps));tlRedraw();return;}
        // Click on track → check for keyframe hit
        const ti=Math.floor((my-RULER_H)/TRACK_H);
        if(ti<0||ti>=TL.tracks.length)return;
        const track=TL.tracks[ti];
        let hit=null;
        track.keyframes.forEach((kf,ki)=>{
            if(Math.abs(kf.time*pps-mx)<8)hit=ki;
        });
        if(hit!==null){
            TL.selectedKf={track:ti,kf:hit};
            TL.dragging={track:ti,kf:hit};
        } else {
            // Add new keyframe on double-click (check with dblclick)
            const time=Math.max(0,Math.min(TL.duration,mx/pps));
            const value=parseFloat(prompt(`Keyframe value at ${time.toFixed(2)}s:`, '100')||'100');
            track.keyframes.push({time,value});
            track.keyframes.sort((a,b)=>a.time-b.time);
        }
        tlRedraw();
    });
    canvas.addEventListener('mousemove',e=>{
        if(!TL.dragging)return;
        const rect=canvas.getBoundingClientRect();
        const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
        const pps=TL.pixelsPerSecond;
        const track=TL.tracks[TL.dragging.track];
        if(!track)return;
        track.keyframes[TL.dragging.kf].time=Math.max(0,Math.min(TL.duration,mx/pps));
        track.keyframes.sort((a,b)=>a.time-b.time);
        tlRedraw();
    });
    canvas.addEventListener('mouseup',()=>{TL.dragging=null;});
    canvas.addEventListener('wheel',e=>{e.preventDefault();TL.pixelsPerSecond=Math.max(20,Math.min(300,TL.pixelsPerSecond-(e.deltaY>0?10:-10)));tlRedraw();},{passive:false});
    canvas.addEventListener('dblclick',e=>{
        // Double-click on selected keyframe to edit its value
        if(TL.selectedKf){
            const track=TL.tracks[TL.selectedKf.track];
            const kf=track?.keyframes[TL.selectedKf.kf];
            if(kf){const v=parseFloat(prompt('Keyframe value:',kf.value)??kf.value);if(!isNaN(v))kf.value=v;tlRedraw();}
        }
    });
}

// ── Expose everything ─────────────────────────────────────────────────────────
// Sprite Editor
global.SPR=SPR; global.initSpriteEditor=initSpriteEditor; global.SPR_setTool=SPR_setTool; global.SPR_undo=SPR_undo; global.SPR_redo=SPR_redo; global.SPR_clear=SPR_clear; global.SPR_flipH=SPR_flipH; global.SPR_flipV=SPR_flipV; global.SPR_resize=SPR_resize; global.SPR_setColor=SPR_setColor; global.SPR_setOpacity=SPR_setOpacity; global.SPR_addColor=SPR_addColor; global.SPR_exportPalette=SPR_exportPalette; global.SPR_importPalette=SPR_importPalette; global.SPR_addFrame=SPR_addFrame; global.SPR_selectFrame=SPR_selectFrame; global.SPR_deleteFrame=SPR_deleteFrame; global.SPR_play=SPR_play; global.SPR_export=SPR_export; global.SPR_exportDataURL=SPR_exportDataURL; global.SPR_exportJS=SPR_exportJS; global.SPR_importPNG=SPR_importPNG; global.SPR_handleImport=SPR_handleImport; global.redrawCanvas=redrawCanvas;
// Audio Workbench
global.SFX=SFX; global.PRESETS=PRESETS; global.buildAudioUI=buildAudioUI; global.playSFX=playSFX; global.exportWAV=exportWAV; global.AUD_play=AUD_play; global.AUD_loadPreset=AUD_loadPreset; global.AUD_setType=AUD_setType; global.AUD_downloadWAV=AUD_downloadWAV; global.AUD_addToAssets=AUD_addToAssets; global.AUD_copyJS=AUD_copyJS; global.AUD_randomize=AUD_randomize;
// Particle Designer
global.PD=PD; global.initParticleDesigner=initParticleDesigner; global.pdApplyPreset=pdApplyPreset; global.pdEmit=pdEmit; global.pdEmitCenter=pdEmitCenter; global.pdClear=pdClear; global.pdSet=pdSet; global.pdCopyJS=pdCopyJS;
// Animation Timeline
global.TL=TL; global.initTimeline=initTimeline; global.tlAddTrack=tlAddTrack; global.tlAddTrackPrompt=tlAddTrackPrompt; global.tlRemoveTrack=tlRemoveTrack; global.tlTogglePlay=tlTogglePlay; global.tlStop=tlStop; global.tlRedraw=tlRedraw;

})(window);
