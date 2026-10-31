const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const DB_NAME = "szc-ai-local";
let db, engine, modelLoaded = false, currentFile = "html", files = {
  html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Project</title></head>
<body><main class="hero"><span class="tag">A NEW DIGITAL EXPERIENCE</span><h1>Build something<br><em>remarkable.</em></h1><p>A clean starter website, ready for your ideas.</p><a href="#about">Explore the project ↗</a></main><section id="about"><h2>Designed to begin.</h2><p>Edit the HTML, CSS and JavaScript in SZC AI.</p></section></body></html>`,
  css: `*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#17202b;background:#f4f6f8}.hero{min-height:85vh;padding:12vh 10vw;display:flex;align-items:flex-start;justify-content:center;flex-direction:column;background:linear-gradient(135deg,#edf3f8,#fff)}.tag{font-size:11px;letter-spacing:.18em;color:#61768d}.hero h1{font-size:clamp(48px,9vw,100px);line-height:.98;letter-spacing:-.06em;margin:24px 0}.hero em{font-style:normal;color:#55799e}.hero p{color:#647184;max-width:420px;line-height:1.7}.hero a{margin-top:20px;background:#172b40;color:white;padding:14px 20px;border-radius:5px;text-decoration:none}section{padding:70px 10vw}section p{color:#657080}`,
  js: `// Add your project interactions here.\nconsole.log("SZC AI preview ready");`
};
const defaultFiles = structuredClone(files);

function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)}
function setLog(msg){$("#modelLog").textContent=msg}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{req.result.createObjectStore("projects",{keyPath:"id"});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function dbPut(value){return new Promise((resolve,reject)=>{const tx=db.transaction("projects","readwrite");tx.objectStore("projects").put(value);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function dbGetAll(){return new Promise((resolve,reject)=>{const req=db.transaction("projects").objectStore("projects").getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function dbClear(){return new Promise((resolve,reject)=>{const tx=db.transaction("projects","readwrite");tx.objectStore("projects").clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}

function switchView(name){$$(".view").forEach(v=>v.classList.remove("active"));$(`#${name}View`).classList.add("active");$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));const titles={chat:["Agent chat","PERSONAL AI WORKSPACE"],developer:["Developer studio","BUILD & PREVIEW"],files:["Project files","LOCAL PROJECT LIBRARY"],settings:["Model & settings","ON-DEVICE AI ENGINE"]};$("#viewTitle").textContent=titles[name][0];$("#viewEyebrow").textContent=titles[name][1];$("#sidebar").classList.remove("open");if(name==="developer")renderPreview();if(name==="files")renderFiles()}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#newTask").addEventListener("click",()=>{switchView("chat");$("#promptInput").focus()});
$$(".quick-card").forEach(b=>b.addEventListener("click",()=>{$("#promptInput").value=b.dataset.prompt;$("#promptInput").focus()}));

function renderEditor(){const map={html:"html",css:"css",js:"js"};$("#codeEditor").value=files[map[currentFile]]}
$$(".file-tab").forEach(b=>b.addEventListener("click",()=>{files[currentFile]= $("#codeEditor").value;currentFile=b.dataset.file;$$(".file-tab").forEach(x=>x.classList.toggle("active",x===b));renderEditor()}));
$("#codeEditor").addEventListener("input",()=>{files[currentFile]=$("#codeEditor").value;$("#editorStatus").textContent="Unsaved changes"});
function previewDocument(){return files.html.replace("</head>",`<style>${files.css}</style></head>`).replace("</body>",`<script>${files.js.replace(/<\/script/gi,"<\\/script")}<\/script></body>`)}
function renderPreview(){files[currentFile]=$("#codeEditor").value;$("#previewFrame").srcdoc=previewDocument();$("#editorStatus").textContent="Preview updated"}
$("#runCode").addEventListener("click",renderPreview);
$("#resetCode").addEventListener("click",()=>{files=structuredClone(defaultFiles);renderEditor();renderPreview();toast("Starter project restored")});

async function saveProject(){files[currentFile]=$("#codeEditor").value;const project={id:"starter-project",name:"My first website",files,updatedAt:Date.now()};await dbPut(project);toast("Project saved on this iPad");renderFiles()}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
async function zipFiles(fileMap,name){const JSZip=(await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm")).default;const zip=new JSZip();Object.entries(fileMap).forEach(([k,v])=>zip.file(k==="html"?"index.html":k==="css"?"styles.css":"app.js",v));const blob=await zip.generateAsync({type:"blob"});downloadBlob(blob,name)}
$("#downloadProject").addEventListener("click",async()=>{try{await zipFiles(files,"szc-ai-website.zip");await saveProject()}catch(e){toast("ZIP export needs internet for the first JSZip load");console.error(e)}});
async function renderFiles(){const all=await dbGetAll();const list=$("#fileList");if(!all.length){list.innerHTML='<div class="empty-state">No saved projects yet. Save a project from Developer Studio.</div>';return}list.innerHTML=all.map(p=>`<div class="file-entry"><span>▤ &nbsp;${escapeHTML(p.name)} <small style="color:#8490a0"> · ${new Date(p.updatedAt).toLocaleString()}</small></span><button class="secondary-btn" data-export="${p.id}">Export ZIP</button></div>`).join("");$$("[data-export]").forEach(b=>b.addEventListener("click",async()=>{const p=all.find(x=>x.id===b.dataset.export);try{await zipFiles(p.files,"szc-ai-project.zip")}catch(e){toast("Could not load ZIP library")}}))}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("#exportAll").addEventListener("click",async()=>{const all=await dbGetAll();try{const JSZip=(await import("https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm")).default;const zip=new JSZip();all.forEach(p=>zip.folder(p.name).file("project.json",JSON.stringify(p,null,2)));downloadBlob(await zip.generateAsync({type:"blob"}),"szc-ai-workspace.zip")}catch(e){toast("Export needs internet for the first ZIP library load")}});
$("#clearData").addEventListener("click",async()=>{if(confirm("Delete all saved SZC AI projects from this browser? Export them first if needed.")){await dbClear();renderFiles();toast("Local projects cleared")}});

function addMessage(text,who="assistant"){const row=document.createElement("div");row.className=`message ${who}`;if(who==="assistant"){const av=document.createElement("div");av.className="avatar";av.textContent="S";row.append(av)}const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;row.append(bubble);$("#chatArea").append(row);$("#chatArea").scrollTop=$("#chatArea").scrollHeight}
async function runPrompt(prompt){addMessage(prompt,"user");$("#promptInput").value="";if(!modelLoaded){addMessage("No local model is loaded yet. I can still help through the built-in project tools. Open Developer Studio to edit and preview a website, or load a model in Model & settings to enable local AI responses. For now, here is a practical next step: describe the pages, visual style and functionality you want, then use the Developer Studio editor to build and test the project.");return}try{const reply=await engine.chat.completions.create({messages:[{role:"system",content:"You are SZC AI, a careful local-first development and creative assistant. Be honest about capabilities. Give concise, actionable guidance. You cannot directly manipulate files unless a provided tool exists."},{role:"user",content:prompt}],temperature:.4,max_tokens:700});addMessage(reply.choices?.[0]?.message?.content||"The model returned an empty response.")}catch(e){addMessage("Local inference error: "+e.message+". Try unloading the model or selecting a smaller model.");}}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const p=$("#promptInput").value.trim();if(p)runPrompt(p)});
$("#promptInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("#chatForm").requestSubmit()}});

async function checkGPU(){const ok=!!navigator.gpu;$("#gpuCapability").textContent=ok?"WebGPU is available in this browser. Model compatibility still needs testing.":"WebGPU is not available. Local model acceleration may not work in this browser.";$("#gpuCapability").style.color=ok?"#8ed4a7":"#f0bd83";$("#connectionLabel").textContent=navigator.onLine?"Browser online":"Offline";}
async function loadModel(){if(!navigator.gpu){setLog("WebGPU is unavailable. Check Safari/iPadOS version and browser settings.");return}$("#loadModel").disabled=true;const name=$("#modelSelect").value;setLog("Loading WebLLM runtime… The first download can be large and may take time.");try{const {CreateMLCEngine}=await import("https://esm.run/@mlc-ai/web-llm");engine=await CreateMLCEngine(name,{initProgressCallback:(p)=>{const pct=Math.round((p.progress||0)*100);$("#modelProgress").style.width=pct+"%";setLog(p.text||`Loading ${pct}%`)}});modelLoaded=true;$("#modelStatus").textContent="Model loaded · local inference enabled";$("#modePill").textContent="LOCAL AI READY";setLog("Model loaded successfully. Prompts are now processed locally in this browser.");toast("Local model ready")}catch(e){setLog("Model could not be loaded:\n"+e.message+"\n\nCheck model support, free storage, WebGPU compatibility and network access.");toast("Model loading failed")}finally{$("#loadModel").disabled=false}}
$("#loadModel").addEventListener("click",loadModel);
$("#unloadModel").addEventListener("click",async()=>{try{if(engine?.unload)await engine.unload()}catch{}engine=null;modelLoaded=false;$("#modelStatus").textContent="No model loaded · tools still available";$("#modePill").textContent="LOCAL MODE";$("#modelProgress").style.width="0%";setLog("Model unloaded.");toast("Model unloaded")});

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();window.deferredInstall=e;$("#installBtn").hidden=false});
$("#installBtn").addEventListener("click",async()=>{if(window.deferredInstall){window.deferredInstall.prompt();await window.deferredInstall.userChoice;window.deferredInstall=null}else toast("Use Safari Share → Add to Home Screen")});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(console.warn);

(async()=>{try{db=await openDB();await checkGPU();renderEditor();renderPreview();}catch(e){console.error(e);toast("Local database unavailable")}})();
