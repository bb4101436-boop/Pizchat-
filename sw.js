<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>PizCamera</title>
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#000000">
<link rel="apple-touch-icon" href="logo.png">
<script>
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js'); }
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:system-ui}
body{background:#000;height:100vh;overflow:hidden}
#video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.08) saturate(1.15) brightness(1.03);transform-origin:center}
#top{position:fixed;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:12px 16px;z-index:10}
.topBtn{width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,0.6);border:1px solid #fff3;color:#fff;font-size:16px}
#logo{color:#fff;font-weight:900;padding:7px 18px;border-radius:20px;border:1px solid #2df4a0;background:rgba(0,0,0,0.5);letter-spacing:2px;font-size:13px}
#timerBox{position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:20;display:none}
#timerBox span{background:#ff2a2a;color:#fff;padding:6px 18px;border-radius:20px;font-weight:900;font-size:14px}
#bottom{position:fixed;bottom:0;left:0;right:0;padding-bottom:26px;background:linear-gradient(transparent,#000 85%);z-index:10}
#filters{display:flex;gap:8px;overflow-x:auto;padding:0 16px 14px} #filters::-webkit-scrollbar{display:none}
#filters button{flex:0 0 auto;padding:7px 14px;border-radius:20px;background:#1a1a1a;color:#fff;border:1px solid #333;font-size:12px}
#filters button.active{background:#2df4a0;color:#000;font-weight:800}
#controls{max-width:380px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;padding:0 24px}
#gallery{width:52px;height:52px;border-radius:12px;background:#222;border:2px solid #fff5;overflow:hidden;color:#fff}
#gallery img{width:100%;height:100%;object-fit:cover}
#shutter{width:74px;height:74px;border-radius:50%;background:#fff;border:4px solid #2df4a0}
#recBtn{width:60px;height:60px;border-radius:50%;background:#ff2a2a;border:3px solid #fff;color:#fff;font-weight:900;font-size:11px}
#recBtn.on{background:#fff;color:red;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
#zoomText{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:#fff;padding:8px 16px;border-radius:20px;display:none;z-index:20;font-weight:700}
#settingsView,#galleryView,#fullView{position:fixed;inset:0;background:#000;z-index:100;display:none;flex-direction:column}
.settingRow{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #1a1a1a;color:#fff}
#grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px;overflow:auto}
canvas{display:none}
</style>
</head>
<body>
<video id="video" autoplay playsinline muted></video>
<div id="top"><button class="topBtn" id="flashBtn">⚡</button><div id="logo">PIZCAMERA</div><button class="topBtn" id="settingsBtn">⚙️</button></div>
<div id="timerBox"><span id="timeText">● 00:00:00</span></div>
<div id="zoomText">1.0x</div>
<div id="bottom">
<div id="filters">
<button class="active" onclick="setF('contrast(1.08) saturate(1.15) brightness(1.03)',this)">✨ CLEAN</button>
<button onclick="setF('contrast(1.12) saturate(1.25) brightness(1.05)',this)">🔥 VIVID</button>
<button onclick="setF('contrast(1.06) brightness(1.08) saturate(1.1)',this)">💎 CRYSTAL</button>
<button onclick="setF('saturate(1.3) contrast(1.1)',this)">🌈 HOT</button>
<button onclick="setF('saturate(1.2) hue-rotate(200deg) contrast(1.1)',this)">💙 BLUE</button>
<button onclick="setF('saturate(1.2) hue-rotate(80deg) contrast(1.1)',this)">💚 GREEN</button>
<button onclick="setF('none',this)">Original</button>
<button onclick="setF('saturate(0) contrast(1.2)',this)">B&W</button>
</div>
<div id="controls"><button id="gallery">🖼️</button><button id="shutter"></button><button id="recBtn">REC</button></div>
</div>
<div id="settingsView"><div style="padding:16px;display:flex;justify-content:space-between;background:#111"><b style="color:#fff">⚙️ Settings</b><button onclick="settingsView.style.display='none'" style="padding:8px 16px;border-radius:20px;background:#fff;color:#000;border:none;font-weight:bold">Close ✕</button></div><div class="settingRow"><span>📷 Camera</span><select id="facingSel"><option value="environment">Back</option><option value="user">Front</option></select></div><div class="settingRow"><span>🎥 Quality</span><select id="qualitySel"><option value="fhd">Full HD Smooth</option><option value="hd">HD Fast</option><option value="4k">4K High</option></select></div><div class="settingRow"><span>©️ Watermark</span><select id="wmSel"><option value="on">ON</option><option value="off">OFF</option></select></div><div class="settingRow"><span>⏱️ Timer</span><select id="timerSel"><option value="0">Off</option><option value="3">3s</option><option value="5">5s</option></select></div></div>
<div id="galleryView"><div style="padding:12px;display:flex;justify-content:space-between;background:#111"><span style="color:#fff;font-weight:700">📸 Your Shots</span><button onclick="galleryView.style.display='none'" style="padding:8px 14px;border-radius:20px;background:#fff;color:#000;border:none;font-weight:bold">Close ✕</button></div><div id="grid"></div></div>
<div id="fullView"><div style="padding:12px;display:flex;justify-content:space-between;background:#111"><button onclick="fullView.style.display='none'" style="padding:8px 14px;border-radius:20px;background:#fff;color:#000;border:none">← Back</button><span style="color:#fff" id="fullName"></span><button onclick="fullView.style.display='none'" style="padding:8px 14px;border-radius:20px;background:#222;color:#fff;border:none">✕</button></div><img id="fullImg" style="display:none;flex:1;object-fit:contain"><video id="fullVideo" style="display:none;flex:1;width:100%" controls></video><div style="padding:16px;display:flex;gap:10px;justify-content:center;background:#111"><button onclick="downloadFull()" style="padding:10px 18px;border-radius:20px;background:#2df4a0;border:none;font-weight:700">💾 Save</button><button onclick="shareFull()" style="padding:10px 18px;border-radius:20px;background:#1a73e8;color:#fff;border:none;font-weight:700">📤 Share</button><button onclick="deleteFull()" style="padding:10px 18px;border-radius:20px;background:#ff2a2a;color:#fff;border:none">🗑️ Delete</button></div></div>
<canvas id="canvas"></canvas>
<script>
const video=document.getElementById('video'), canvas=document.getElementById('canvas'), shutter=document.getElementById('shutter'), recBtn=document.getElementById('recBtn'), gallery=document.getElementById('gallery'), settingsView=document.getElementById('settingsView'), galleryView=document.getElementById('galleryView'), fullView=document.getElementById('fullView'), grid=document.getElementById('grid'), timerBox=document.getElementById('timerBox'), timeText=document.getElementById('timeText'), zoomText=document.getElementById('zoomText'), fullImg=document.getElementById('fullImg'), fullVideo=document.getElementById('fullVideo');
let stream, facing='environment', zoom=1, sy=0, sz=1, rec, chunks=[], isRecording=false, quality='fhd', watermark='on', timer=0, sec=0, timerId=null; let items=[], currentFull=null;
async function startCam(){ if(stream) stream.getTracks().forEach(t=>t.stop()); let w=1920,h=1080; stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:w},height:{ideal:h}},audio:true}); video.srcObject=stream; await video.play(); } startCam();
function setF(f,b){ video.style.filter=f; document.querySelectorAll('#filters button').forEach(x=>x.classList.remove('active')); if(b) b.classList.add('active'); }
document.getElementById('settingsBtn').onclick=()=>settingsView.style.display='flex'; document.getElementById('facingSel').onchange=e=>{ facing=e.target.value; startCam(); }; document.getElementById('qualitySel').onchange=e=>quality=e.target.value; document.getElementById('wmSel').onchange=e=>watermark=e.target.value; document.getElementById('timerSel').onchange=e=>timer=parseInt(e.target.value); document.getElementById('flashBtn').onclick=async()=>{ try{ let tr=stream.getVideoTracks()[0]; await tr.applyConstraints({advanced:[{torch:!tr.getSettings().torch}]}); }catch{} };
function addToGrid(url,type,name){ items.push({url,type,name}); let el=document.createElement(type==='img'?'img':'video'); el.src=url; el.onclick=()=>openFull(url,type,name); grid.prepend(el); gallery.innerHTML=`<img src="${url}">`; }
function openFull(url,type,name){ currentFull={url,type,name}; fullView.style.display='flex'; if(type==='img'){ fullImg.style.display='block'; fullVideo.style.display='none'; fullImg.src=url; } else{ fullImg.style.display='none'; fullVideo.style.display='block'; fullVideo.src=url; } document.getElementById('fullName').textContent=name; }
function downloadFull(){ let a=document.createElement('a'); a.href=currentFull.url; a.download=currentFull.name; a.click(); }
async function shareFull(){ try{ let res=await fetch(currentFull.url); let blob=await res.blob(); let file=new File([blob], currentFull.name, {type: blob.type}); await navigator.share({files:[file]}); }catch{ downloadFull(); } }
function deleteFull(){ fullView.style.display='none'; let idx=items.findIndex(i=>i.url===currentFull.url); if(idx>-1) items.splice(idx,1); grid.innerHTML=''; items.forEach(it=>{ let el=document.createElement(it.type==='img'?'img':'video'); el.src=it.url; el.onclick=()=>openFull(it.url,it.type,it.name); grid.appendChild(el); }); }
gallery.onclick=()=>galleryView.style.display='flex';
video.addEventListener('touchstart',e=>{ if(e.touches.length===1){ sy=e.touches[0].clientY; sz=zoom; } if(e.touches.length===2){ let d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); sy=d; sz=zoom; } },{passive:true});
video.addEventListener('touchmove',e=>{ if(e.touches.length===1){ zoom=Math.max(1,Math.min(5,sz+(e.touches[0].clientY-sy)/150)); } if(e.touches.length===2){ let d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); zoom=Math.max(1,Math.min(5,sz*(d/sy))); } video.style.transform=(facing==='user'?'scaleX(-1) ':'')+`scale(${zoom})`; zoomText.textContent=zoom.toFixed(1)+'x'; zoomText.style.display='block'; clearTimeout(window.zt); window.zt=setTimeout(()=>zoomText.style.display='none',800); },{passive:true});
function takePhoto(){ const doSnap=()=>{ canvas.width=video.videoWidth; canvas.height=video.videoHeight; let ctx=canvas.getContext('2d'); ctx.filter=video.style.filter; if(facing==='user'){ ctx.translate(canvas.width,0); ctx.scale(-1,1); } ctx.drawImage(video,0,0); if(watermark==='on'){ ctx.filter='none'; ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,canvas.height-60,canvas.width,60); ctx.fillStyle='#2df4a0'; ctx.font=`bold ${canvas.width*0.05}px system-ui`; ctx.textAlign='center'; ctx.fillText('PIZCAMERA',canvas.width/2,canvas.height-20); } canvas.toBlob(b=>{ let url=URL.createObjectURL(b); let name='PIZ_'+Date.now()+'.jpg'; addToGrid(url,'img',name); let a=document.createElement('a'); a.href=url; a.download=name; a.click(); },'image/jpeg',0.92); }; if(timer>0){ let c=timer; let iv=setInterval(()=>{ zoomText.textContent=c+'s'; zoomText.style.display='block'; c--; if(c<0){ clearInterval(iv); zoomText.style.display='none'; doSnap(); } },1000); } else doSnap(); }
shutter.onclick=takePhoto;
function fmt(s){ let h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sc=s%60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`; }
recBtn.onclick=()=>{ if(!isRecording){ chunks=[]; sec=0; try{ rec=new MediaRecorder(stream,{mimeType:'video/webm',videoBitsPerSecond:1500000}); }catch{ rec=new MediaRecorder(stream); } rec.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); }; rec.onstop=()=>{ let blob=new Blob(chunks,{type:'video/webm'}); let url=URL.createObjectURL(blob); let name='PIZ_'+Date.now()+'.webm'; addToGrid(url,'video',name); let a=document.createElement('a'); a.href=url; a.download=name; a.click(); }; rec.start(500); timerBox.style.display='block'; timeText.textContent='● 00:00:00'; timerId=setInterval(()=>{ sec++; timeText.textContent='● '+fmt(sec); },1000); isRecording=true; recBtn.classList.add('on'); recBtn.textContent='STOP'; } else{ clearInterval(timerId); timerBox.style.display='none'; rec.stop(); isRecording=false; recBtn.classList.remove('on'); recBtn.textContent='REC'; } };
</script>
</body>
</html>
