import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const $ = (id) => document.getElementById(id);
const toast = (message) => { const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2600); };
const info = {
  arduino:{title:'Arduino Uno',text:'Board mikrokontroler yang menjalankan program dan mengendalikan pin input/output. Pin digital dapat digunakan untuk mengendalikan LED.'},
  led:{title:'LED',text:'Light Emitting Diode adalah komponen keluaran yang memancarkan cahaya saat dialiri arus dengan polaritas yang benar. Gunakan resistor pembatas arus.'},
  resistor:{title:'Resistor 220Ω',text:'Resistor membatasi arus agar LED tidak rusak. Nilai resistansi dinyatakan dalam ohm (Ω).'},
  ultrasonic:{title:'Sensor HC-SR04',text:'Sensor ultrasonik mengirim gelombang suara dan mengukur waktu pantulnya. Jarak dihitung dari waktu tempuh pergi-pulang gelombang.'}
};
let completed = new Set();
let ledOn = false;
let selectedComponent = 'arduino';
let quizData = null;
let quizAnswered = false;

// Navigation
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  $(`${name}Page`).classList.add('active');
  if(name==='ai') $('aiTopic').focus({preventScroll:true});
}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
$('openAI').addEventListener('click',()=>showPage('ai'));
$('helpBtn').addEventListener('click',()=>$('modal').classList.add('show'));
$('modalClose').addEventListener('click',()=>$('modal').classList.remove('show'));
$('modalOk').addEventListener('click',()=>$('modal').classList.remove('show'));
$('scenarioBtn').addEventListener('click',()=>toast('Skenario gotong royong: mahasiswa membantu warga sekolah memantau ketersediaan air dan menentukan tindak lanjut.'));

function updateProgress(){
  const n=completed.size;
  $('progressText').textContent=`${n||1}/4`;
  $('progressBar').style.width=`${Math.max(25,n*25)}%`;
  $('progressCaption').textContent=n===4?'Modul selesai. Bagus!':n===0?'Mulai dari pengenalan komponen':`${n} tahapan telah diselesaikan`;
}
document.querySelectorAll('[data-complete]').forEach(btn=>btn.addEventListener('click',()=>{
  const n=Number(btn.dataset.complete);
  if(completed.has(n)){completed.delete(n);btn.classList.remove('done');btn.textContent='Tandai selesai';}
  else {completed.add(n);btn.classList.add('done');btn.textContent='✓ Selesai';toast('Tahapan belajar ditandai selesai.');}
  updateProgress();
}));

// Three.js scene and interactive educational model
const wrap=$('sceneWrap');
let renderer,scene,camera,controls,labGroup,reticle,hitTestSource=null,viewerSpace=null,arPlaced=false;
const pickables=[];
const material=(color,roughness=.55,metalness=.08)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const mat={pcb:material('#168a69'),dark:material('#202a39'),black:material('#101820'),silver:material('#aab7c4',.28,.75),white:material('#f1f4f5'),red:material('#e74d58'),blue:material('#3b72d5'),bread:material('#e8edf0'),gold:material('#c8a35d',.3,.7)};
function box(parent,name,pos,size,matl,clickKey=null){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),matl);mesh.position.set(...pos);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(clickKey){mesh.userData.component=clickKey;pickables.push(mesh);}return mesh;
}
function cylinder(parent,name,pos,radius,length,matl,clickKey=null,segments=24){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,segments),matl);mesh.position.set(...pos);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(clickKey){mesh.userData.component=clickKey;pickables.push(mesh);}return mesh;
}
function labelSprite(text){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.fillStyle='rgba(17,34,52,.87)';ctx.roundRect(4,4,504,120,18);ctx.fill();ctx.font='bold 42px Arial';ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65);
  const texture=new THREE.CanvasTexture(canvas);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true}));sprite.scale.set(.66,.165,1);return sprite;
}
function buildLab(){
  labGroup=new THREE.Group();scene.add(labGroup);
  // Workbench slab; all objects are arranged above its upper surface for AR placement.
  const table=box(labGroup,'Meja praktikum',[0,.015,0],[2.3,.07,1.55],material('#f6f8fa'),null);table.castShadow=false;
  // subtle table frame
  box(labGroup,'Frame',[0,-.065,0],[2.2,.07,1.45],material('#c5d1dd'));
  // Arduino board
  const board=new THREE.Group();board.position.set(-.25,.12,-.1);labGroup.add(board);
  box(board,'PCB',[0,.075,0],[1.28,.12,.78],mat.pcb,'arduino');
  // USB and power socket
  box(board,'USB connector',[-.69,.09,.03],[.19,.16,.27],mat.silver,'arduino');
  box(board,'USB inset',[-.705,.18,.03],[.11,.025,.18],mat.dark);
  box(board,'DC jack',[.57,.12,.23],[.19,.2,.22],mat.black,'arduino');
  // Main IC and small components
  box(board,'ATmega chip',[.05,.155,-.02],[.37,.09,.29],mat.black,'arduino');
  for(let i=0;i<8;i++){box(board,'IC pin',[.05-.15+i*.043,.13,-.185],[.025,.025,.07],mat.silver);box(board,'IC pin',[.05-.15+i*.043,.13,.145],[.025,.025,.07],mat.silver);}
  box(board,'USB interface',[ -.38,.145,-.18],[.23,.07,.16],mat.dark);
  cylinder(board,'Reset button',[-.42,.19,.22],.075,.08,mat.red,'arduino');
  // Pin headers on both long edges
  for(let i=0;i<14;i++){
    const x=-.54+i*.083;
    cylinder(board,'Digital pin',[x,.17,-.38],.018,.11,mat.gold,'arduino',8);
    cylinder(board,'Digital pin',[x,.17,.38],.018,.11,mat.gold,'arduino',8);
  }
  for(let i=0;i<6;i++)cylinder(board,'Analog pin',[.43,.17,-.22+i*.085],.018,.11,mat.gold,'arduino',8);
  const boardLabel=labelSprite('ARDUINO UNO');boardLabel.position.set(0,.29,0);board.add(boardLabel);
  // Breadboard
  const bread=box(labGroup,'Breadboard',[.82,.095,-.18],[.82,.12,.57],mat.bread,null);
  for(let row=0;row<5;row++)for(let col=0;col<14;col++){
    const dot=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.006,8),material('#718091'));
    dot.rotation.x=Math.PI/2;dot.position.set(.49+col*.05,.16,-.38+row*.095);labGroup.add(dot);
  }
  // LED, resistor & wires
  const ledGroup=new THREE.Group();ledGroup.position.set(.65,.18,-.02);labGroup.add(ledGroup);
  cylinder(ledGroup,'LED base',[0,.07,0],.055,.11,mat.red,'led');
  const ledBulb=new THREE.Mesh(new THREE.SphereGeometry(.06,18,14),new THREE.MeshStandardMaterial({color:'#ff5964',emissive:'#300308',emissiveIntensity:.1,roughness:.22}));ledBulb.position.set(0,.155,0);ledBulb.name='LED lamp';ledBulb.userData.component='led';ledGroup.add(ledBulb);pickables.push(ledBulb);ledGroup.userData.ledBulb=ledBulb;
  cylinder(ledGroup,'LED leg',[-.025,.015,0],.008,.13,mat.silver,'led',8);cylinder(ledGroup,'LED leg',[.025,.015,0],.008,.13,mat.silver,'led',8);
  const resGroup=new THREE.Group();resGroup.position.set(.94,.2,-.02);labGroup.add(resGroup);
  const res=cylinder(resGroup,'Resistor body',[0,.06,0],.035,.21,material('#d6b77b'), 'resistor',16);res.rotation.z=Math.PI/2;
  for(let x of [-.16,.16]){const lead=cylinder(resGroup,'Resistor lead',[x,.06,0],.007,.13,mat.silver,null,8);lead.rotation.z=Math.PI/2;}
  for(let x of [-.045,-.015,.02]){const band=box(resGroup,'Resistor band',[x,.06,.033],[.012,.09,.009],material('#82462e'));band.rotation.z=Math.PI/2;}
  // Ultrasonic module
  const sensor=new THREE.Group();sensor.position.set(.76,.19,.48);labGroup.add(sensor);
  box(sensor,'HC-SR04 board',[0,.08,0],[.53,.14,.31],mat.blue,'ultrasonic');
  for(let x of [-.16,.16]){const ring=cylinder(sensor,'Ultrasonic transducer',[x,.18,-.02],.11,.07,mat.silver,'ultrasonic',36);ring.rotation.x=Math.PI/2;const inner=cylinder(sensor,'Transducer center',[x,.18,-.06],.07,.012,mat.dark,'ultrasonic',36);inner.rotation.x=Math.PI/2;}
  const sensorLabel=labelSprite('HC-SR04');sensorLabel.position.set(0,.32,.1);sensorLabel.scale.set(.5,.125,1);sensor.add(sensorLabel);
  // Simulated object target and rays
  const target=new THREE.Mesh(new THREE.BoxGeometry(.19,.22,.16),material('#e9a23b'));target.position.set(.78,.22,.89);target.name='Objek terukur';labGroup.add(target);labGroup.userData.target=target;
  const rayMat=new THREE.LineDashedMaterial({color:'#e7a43b',dashSize:.045,gapSize:.03,transparent:true,opacity:.8});
  const rayGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(.76,.32,.65),new THREE.Vector3(.76,.32,.8)]);const ray=new THREE.Line(rayGeo,rayMat);ray.computeLineDistances();labGroup.add(ray);
  // Label sprites for important elements
  const pinLabel=labelSprite('DIGITAL I/O');pinLabel.position.set(-.25,.48,-.58);pinLabel.scale.set(.55,.14,1);labGroup.add(pinLabel);
  // Lighting and surface accents
  const accent=new THREE.PointLight('#a8fff0',.45,4);accent.position.set(-1,2,1);scene.add(accent);
  return {ledBulb,target};
}
try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(wrap.clientWidth,wrap.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.xr.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;wrap.prepend(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color('#e5edf4');
  camera=new THREE.PerspectiveCamera(42,wrap.clientWidth/wrap.clientHeight,.05,50);camera.position.set(2.7,2.15,3.15);camera.lookAt(0,.25,0);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.25,0);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=1.7;controls.maxDistance=7;controls.update();
  scene.add(new THREE.HemisphereLight('#f5fbff','#a2b2c1',2.0));const key=new THREE.DirectionalLight('#ffffff',2.4);key.position.set(3,5,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),material('#dce6ee'));ground.rotation.x=-Math.PI/2;ground.position.y=-.11;ground.receiveShadow=true;scene.add(ground);
  const grid=new THREE.GridHelper(12,36,'#b9c8d4','#d1dce5');grid.position.y=-.105;scene.add(grid);
  const objects=buildLab();
  // Reticle for AR surface placement.
  reticle=new THREE.Mesh(new THREE.RingGeometry(.10,.13,32),new THREE.MeshBasicMaterial({color:0x1ac7a3,side:THREE.DoubleSide}));reticle.rotation.x=-Math.PI/2;reticle.matrixAutoUpdate=false;reticle.visible=false;scene.add(reticle);
  const arButton=ARButton.createButton(renderer,{requiredFeatures:['hit-test'],optionalFeatures:['dom-overlay'],domOverlay:{root:document.body}});arButton.textContent='◎ AR';arButton.id='webxrARButton';$('arBtn').replaceWith(arButton);
  const vrButton=VRButton.createButton(renderer);vrButton.textContent='◉ VR';vrButton.id='webxrVRButton';$('vrBtn').replaceWith(vrButton);
  let raycaster=new THREE.Raycaster();let pointer=new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown',(event)=>{
    const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(pickables,true);if(hits.length){const key=hits[0].object.userData.component;if(key)selectComponent(key);}
  });
  renderer.xr.addEventListener('sessionstart',async()=>{
    const session=renderer.xr.getSession();
    if(session?.environmentBlendMode==='additive'||session?.environmentBlendMode==='alpha-blend'){
      scene.background=null;renderer.setClearColor(0x000000,0);$('viewMode').textContent='IMMERSIVE AR';controls.enabled=false;reticle.visible=false;labGroup.visible=false;arPlaced=false;
      try{viewerSpace=await session.requestReferenceSpace('viewer');hitTestSource=await session.requestHitTestSource({space:viewerSpace});session.addEventListener('select',()=>{if(reticle.visible){labGroup.matrix.fromArray(reticle.matrix.elements);labGroup.matrix.decompose(labGroup.position,labGroup.quaternion,labGroup.scale);labGroup.visible=true;arPlaced=true;toast('Model laboratorium ditempatkan pada permukaan.');}});}catch(e){toast('Hit-test tidak tersedia pada perangkat ini.');labGroup.visible=true;}
    }else{$('viewMode').textContent='IMMERSIVE VR';controls.enabled=false;labGroup.visible=true;}
  });
  renderer.xr.addEventListener('sessionend',()=>{scene.background=new THREE.Color('#e5edf4');renderer.setClearColor(0x000000,1);controls.enabled=true;hitTestSource=null;viewerSpace=null;reticle.visible=false;labGroup.visible=true;labGroup.position.set(0,0,0);labGroup.quaternion.identity();$('viewMode').textContent='DESKTOP 3D VIEW';});
  renderer.setAnimationLoop((time,frame)=>{
    controls.update();
    if(frame&&hitTestSource){const referenceSpace=renderer.xr.getReferenceSpace();const results=frame.getHitTestResults(hitTestSource);if(results.length){const pose=results[0].getPose(referenceSpace);reticle.visible=true;reticle.matrix.fromArray(pose.transform.matrix);if(!arPlaced)labGroup.visible=false;}else reticle.visible=false;}
    renderer.render(scene,camera);
  });
  $('sceneLoading').style.display='none';
  window.addEventListener('resize',()=>{if(!renderer)return;const w=wrap.clientWidth,h=wrap.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
  $('resetView').addEventListener('click',()=>{camera.position.set(2.7,2.15,3.15);controls.target.set(0,.25,0);controls.update();toast('Tampilan laboratorium diatur ulang.');});
  window.labModel=objects;
}catch(error){console.error(error);$('sceneLoading').textContent='3D tidak dapat dimuat. Periksa koneksi internet dan jalankan aplikasi melalui server lokal.';toast('Gagal memuat mesin 3D.');}

function selectComponent(key){
  selectedComponent=key;const item=info[key];if(!item)return;
  $('componentDetail').innerHTML=`<b>${item.title}</b><p>${item.text}</p>`;$('tipTitle').textContent=item.title;$('tipText').textContent=item.text;
  document.querySelectorAll('.component-row').forEach(b=>b.classList.toggle('selected',b.dataset.component===key));
  toast(`${item.title} dipilih.`);
}
document.querySelectorAll('[data-component]').forEach(b=>b.addEventListener('click',()=>selectComponent(b.dataset.component)));

// Output interaction: turn LED on/off.
function setLed(value){ledOn=value;$('ledState').textContent=ledOn?'LED ON':'LED OFF';$('ledIndicator').classList.toggle('on',ledOn);$('ledToggle').classList.toggle('on',ledOn);$('ledToggle').setAttribute('aria-label',ledOn?'Matikan LED':'Nyalakan LED');
  if(window.labModel?.ledBulb){window.labModel.ledBulb.material.emissive.set(ledOn?'#ff2638':'#300308');window.labModel.ledBulb.material.emissiveIntensity=ledOn?1.6:.1;}
}
$('ledToggle').addEventListener('click',()=>{setLed(!ledOn);toast(ledOn?'Pin 13 HIGH: LED menyala.':'Pin 13 LOW: LED padam.');});
$('distanceSlider').addEventListener('input',e=>{
  const d=Number(e.target.value);$('distanceValue').textContent=d;$('distanceLabel').textContent=d<10?'Permukaan air sangat tinggi':d>150?'Permukaan air rendah':'Kondisi relatif normal';
  $('sensorResult').textContent=d<10?'Peringatan: permukaan air mendekati sensor. Warga sekolah perlu memeriksa kemungkinan bak hampir penuh.':d>150?'Jarak permukaan air jauh dari sensor. Periksa ketersediaan air dan rencanakan pengisian bersama.':`Jarak terukur ${d} cm. Kondisi relatif normal; lanjutkan pemantauan bersama.`;
  if(window.labModel?.target)window.labModel.target.position.z=.72+(d/200)*.95;
});

// Adaptive exercise: genuine GenAI is provided by backend; offline fallback is explicitly labelled.
const offlineItems={
  'Rangkaian LED dan resistor':[
    {question:'Dalam rangkaian LED yang dikendalikan pin digital Arduino, mengapa resistor dipasang seri dengan LED?',options:['Membatasi arus agar LED tidak rusak','Menaikkan tegangan keluaran pin','Mengubah sinyal digital menjadi analog','Menyimpan program Arduino'],correctIndex:0,explanation:'Resistor membatasi arus yang melewati LED sehingga arus tidak berlebihan.'},
    {question:'LED tidak menyala meskipun pin 13 diset HIGH. Pemeriksaan awal yang paling tepat adalah…',options:['Memeriksa polaritas LED dan jalur GND','Mengganti semua pin analog','Menghapus bootloader','Menaikkan frekuensi Wi-Fi'],correctIndex:0,explanation:'LED memiliki polaritas. Pastikan anoda terhubung ke pin melalui resistor dan katoda ke GND.'}
  ],
  'Pin digital Arduino Uno':[
    {question:'Apa kondisi logika pin digital Arduino ketika diberikan perintah HIGH?',options:['Pin berada pada level tegangan logika tinggi','Pin selalu menjadi input analog','Pin terputus dari catu daya','Pin berubah menjadi ground permanen'],correctIndex:0,explanation:'HIGH merepresentasikan level logika tinggi pada pin digital.'},
    {question:'Sebuah LED dihubungkan ke pin 13 dan GND. Perintah apa yang dibutuhkan agar LED menyala?',options:['digitalWrite(13, HIGH)','analogRead(13)','pinMode(13, INPUT)','Serial.end()'],correctIndex:0,explanation:'digitalWrite(13, HIGH) memberikan level logika tinggi pada pin 13.'}
  ],
  'Sensor ultrasonik HC-SR04':[
    {question:'Sensor HC-SR04 memperkirakan jarak terutama berdasarkan…',options:['Waktu tempuh gelombang ultrasonik pergi-pulang','Perubahan warna objek','Hambatan listrik objek','Intensitas cahaya ruangan'],correctIndex:0,explanation:'Jarak dihitung dari waktu antara pengiriman gelombang dan penerimaan pantulan.'},
    {question:'Jika waktu pantul semakin lama, apa yang umumnya terjadi pada jarak objek?',options:['Jarak objek semakin jauh','Jarak objek semakin dekat','Jarak selalu nol','Sensor berubah menjadi aktuator'],correctIndex:0,explanation:'Waktu tempuh gelombang yang lebih lama umumnya menunjukkan objek lebih jauh.'}
  ],
  'Monitoring lingkungan sekolah':[
    {question:'Untuk memantau ketinggian air pada bak penampungan sekolah, sensor HC-SR04 sebaiknya dipasang…',options:['Di bagian atas menghadap permukaan air','Terendam di dasar bak','Di dalam kotak tertutup logam','Menghadap menjauhi permukaan air'],correctIndex:0,explanation:'Sensor dipasang di atas permukaan air dan menghadap ke bawah agar mengukur jarak ke permukaan air.'},
    {question:'Jika jarak sensor ke permukaan air berkurang, apa artinya?',options:['Ketinggian air meningkat','Ketinggian air selalu nol','Sensor kehilangan catu daya','Suhu air pasti meningkat'],correctIndex:0,explanation:'Jarak yang lebih pendek dari sensor ke permukaan menunjukkan permukaan air makin tinggi.'}
  ]
};
function fallbackQuestion(topic,difficulty,context){
  const arr=offlineItems[topic]||offlineItems['Rangkaian LED dan resistor'];
  let q=arr[Math.floor(Math.random()*arr.length)];
  if(difficulty==='Lanjut'&&topic==='Monitoring lingkungan sekolah')q={question:`Dalam ${context.toLowerCase()}, sensor membaca jarak 18 cm dari sensor ke permukaan air. Setelah 10 menit nilainya menjadi 8 cm. Kesimpulan yang paling tepat adalah…`,options:['Permukaan air naik mendekati sensor','Permukaan air turun menjauhi sensor','Sensor mengukur suhu air','Tidak ada perubahan ketinggian air'],correctIndex:0,explanation:'Jarak sensor ke permukaan air berkurang, sehingga permukaan air naik mendekati sensor.'};
  return {...q,difficulty,topic,scenario:context,source:'LATIHAN LOKAL (TEMPLATE)'};
}
function renderQuestion(q){
  quizData=q;quizAnswered=false;
  $('quizArea').innerHTML=`<div class="quiz-meta">${escapeHtml(q.source||'GENAI GENERATED')} · ${escapeHtml(q.difficulty||'MENENGAH')} · ${escapeHtml(q.topic||'MIKROKONTROLER').toUpperCase()}</div><h4 class="quiz-question">${escapeHtml(q.question)}</h4><div id="optionsBox">${q.options.map((o,i)=>`<button class="quiz-option" data-answer="${i}"><span class="option-key">${String.fromCharCode(65+i)}</span><span>${escapeHtml(o)}</span></button>`).join('')}</div><div id="quizFeedback"></div><div class="quiz-actions"><small id="quizStatus">Pilih satu jawaban.</small><button class="secondary-btn" id="newQuestion">Buat variasi lain ↻</button></div>`;
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>answerQuestion(Number(b.dataset.answer))));
  $('newQuestion').addEventListener('click',()=>generatePractice());
}
function answerQuestion(index){if(quizAnswered)return;quizAnswered=true;const correct=index===Number(quizData.correctIndex);document.querySelectorAll('[data-answer]').forEach((b,i)=>{b.disabled=true;if(i===Number(quizData.correctIndex))b.classList.add('correct');if(i===index&&!correct)b.classList.add('wrong');});$('quizFeedback').innerHTML=`<div class="feedback ${correct?'good':'bad'}"><b>${correct?'Tepat!':'Belum tepat.'}</b> ${escapeHtml(quizData.explanation||'Pelajari kembali konsep pada materi.')}</div>`;$('quizStatus').textContent=correct?'Jawaban benar':'Coba pelajari umpan balik';if(correct)toast('Bagus! Jawaban kamu benar.');}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function generatePractice(){
  const btn=$('generateBtn');const topic=$('aiTopic').value;const difficulty=$('aiDifficulty').value;const context=$('aiContext').value;
  if(btn){btn.disabled=true;btn.textContent='Menyusun latihan…';}
  $('quizArea').innerHTML='<div class="empty-ai"><div class="sparkle">✳</div><b>AI sedang merancang skenario</b><p>Menyesuaikan topik, tingkat kesulitan, dan konteks belajar.</p></div>';
  try{
    const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic,difficulty,context,subject:'Mikrokontroler dan Antarmuka',language:'Bahasa Indonesia'})});
    if(!res.ok)throw new Error(`Backend tidak tersedia (${res.status})`);
    const data=await res.json();renderQuestion({...data,source:'GENERATED BY GENAI'});toast('Latihan berhasil dibuat oleh GenAI.');
  }catch(err){console.warn(err);const q=fallbackQuestion(topic,difficulty,context);renderQuestion(q);toast('Mode latihan lokal aktif. Konfigurasi API untuk GenAI sesungguhnya.');}
  if(btn){btn.disabled=false;btn.textContent='✳ Generate variasi latihan';}
}
$('generateBtn').addEventListener('click',generatePractice);
$('openAI').addEventListener('click',()=>{showPage('ai');});
// Helpful default state
selectComponent('arduino');updateProgress();
