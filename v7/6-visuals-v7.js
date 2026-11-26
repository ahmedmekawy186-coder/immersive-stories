/* Visual revision 5. Scene content and scoring are unchanged. */
(function () {
 const T=AFRAME.THREE;
 const tex=new T.TextureLoader();
 const wood=tex.load('assets/2-wood.jpg'), plaster=tex.load('assets/3-plaster.jpg');
 [wood,plaster].forEach(t=>{t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;});
 const mat=(c,r=.7,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const white=mat('#e9e9e4'),steel=mat('#686e73',.35,.65),black=mat('#25292c'),woodMat=mat('#fff3dc');woodMat.map=wood;
 function mesh(parent,g,m,x,y,z){const a=new T.Mesh(g,m);a.position.set(x,y,z);parent.add(a);return a;}
 function box(p,x,y,z,w,h,d,m){return mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z);}
 function cyl(p,x,y,z,r,h,m){return mesh(p,new T.CylinderGeometry(r,r,h,16),m,x,y,z);}

 // Light shadows on capable devices (laptop/tablet); phones keep the flat fallback. ?shadows=0 forces off, ?shadows=1 forces on.
 function enableShadows(){const q=new URLSearchParams(location.search).get('shadows');const ok=q==='1'||(q!=='0'&&(navigator.hardwareConcurrency||2)>=6);const sc=document.querySelector('a-scene');if(!ok||!sc||!sc.renderer)return;const r=sc.renderer;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.2;
  const L=document.querySelector('#sun').getObject3D('light');if(L){L.castShadow=true;L.shadow.mapSize.set(2048,2048);const c=L.shadow.camera;c.left=-8;c.right=8;c.top=8;c.bottom=-8;c.near=1;c.far=24;L.shadow.bias=-.0006;L.shadow.normalBias=.02;c.updateProjectionMatrix();}
  sc.object3D.traverse(o=>{if(o.isMesh&&!(o.material&&o.material.isMeshBasicMaterial)){o.castShadow=!o.isSkinnedMesh||true;o.receiveShadow=true;if(o.material)o.material.needsUpdate=true;}});}
 [4000,9000,16000].forEach(t=>setTimeout(enableShadows,t));
 function softenRoom(){
  const root=document.querySelector('#classroom');if(!root)return;document.querySelector('#ambient').setAttribute('light','intensity',.7);
  root.querySelectorAll('a-plane').forEach(e=>{const m=e.getObject3D('mesh');if(!m||e.id||e.dataset.target)return;const p=e.object3D.position;
   if(e.getAttribute('width')>=9&&p.y>0.3){m.material.map=plaster;m.material.color.set(p.y<1?'#ece8e0':(p.y>3?'#fbfaf6':'#fdfcf9'));if(p.y>3){m.material.emissive=new T.Color('#f2f0ea');m.material.emissiveIntensity=.7;}m.material.needsUpdate=true;}
   if(p.y===0){const fix=()=>{m.material.map=null;m.material.color.set('#d9d6cf');m.material.roughness=.7;m.material.needsUpdate=true;};fix();setTimeout(fix,1200);}
  });
  root.querySelectorAll('a-box').forEach(e=>{const m=e.getObject3D('mesh');if(!m||e.dataset.target)return;const c=m.material.color.getHexString();
   if(['b78a55','9c7448','a9784a'].includes(c)){m.material.map=wood;m.material.color.set('#fffaf0');m.material.emissive=new T.Color('#9a8868');m.material.emissiveIntensity=.35;m.material.roughness=.65;m.material.needsUpdate=true;}
  });
  const decor=new T.Group();root.object3D.add(decor);
  // Suspended acoustic ceiling, brushed aluminium edges and recessed LED panels.
  for(let x=-4.8;x<5;x+=.8)box(decor,x,3.185,.25,.012,.012,9.5,white);
  for(let z=-4.4;z<5;z+=.8)box(decor,0,3.18,z,10,.012,.012,white);
  for(let x of [-3,0,3])for(let z of [-2.5,.5,3.5])box(decor,x,3.10,z,1.05,.035,1.05,new T.MeshBasicMaterial({color:0xe8eced}));
  // Front teaching wall: twin dry-erase wings, speakers, camera and projector.
  for(let x of [-2.65,2.65]){box(decor,x,1.7,-4.40,1.65,1.3,.05,steel);box(decor,x,1.7,-4.36,1.58,1.23,.025,white);}
  for(let x of [-1.5,1.5]){box(decor,x,2.35,-4.32,.17,.55,.13,black);for(let y of [2.23,2.46]){let c=cyl(decor,x,y,-4.24,.055,.012,steel);c.rotation.x=Math.PI/2;}}
  box(decor,0,2.93,-3.4,.42,.15,.34,white);cyl(decor,0,3.07,-3.4,.025,.22,steel);
  let lens=cyl(decor,0,2.92,-3.18,.055,.07,black);lens.rotation.x=Math.PI/2;

  // v6 extras: posters, backpacks, window sun patches.
  function posterTex(i){const cv=document.createElement('canvas');cv.width=256;cv.height=352;const g=cv.getContext('2d');const pal=[['#1d6fa5','#ffffff'],['#2e8b57','#fff8e1'],['#c0572b','#fff3e0'],['#5b4aa8','#f4f1ff']][i%4];g.fillStyle=pal[1];g.fillRect(0,0,256,352);g.fillStyle=pal[0];g.fillRect(0,0,256,64);g.fillStyle='#fff';g.font='bold 26px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(['الأمن الرقمي','التعليم الذكي','سلامة الأجهزة','الخصوصية'][i%4],128,34);
   g.fillStyle=pal[0];g.beginPath();g.arc(128,160,52,0,7);g.fill();g.fillStyle=pal[1];g.beginPath();g.arc(128,160,30,0,7);g.fill();g.fillStyle=pal[0];g.beginPath();g.arc(128,160,12,0,7);g.fill();
   for(let r=0;r<4;r++){g.fillStyle='#c9ced2';g.fillRect(30,240+r*24,196-(r*28),9);}g.fillStyle=pal[0];g.fillRect(30,330,60,8);const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;return t;}
  [[-3.8,4.94,180],[-2.4,4.94,180],[2.2,4.94,180],[3.6,4.94,180]].forEach((p,i)=>{const m=new T.Mesh(new T.PlaneGeometry(.8,1.1),new T.MeshStandardMaterial({map:posterTex(i),roughness:.8}));m.position.set(p[0],1.75,p[1]);m.rotation.y=Math.PI;decor.add(m);});
  [[-4.94,-3.3],[-4.94,-2.2]].forEach((p,i)=>{const m=new T.Mesh(new T.PlaneGeometry(.8,1.1),new T.MeshStandardMaterial({map:posterTex(i+1),roughness:.8}));m.position.set(p[0],1.75,p[1]);m.rotation.y=Math.PI/2;decor.add(m);});
  const bag=(x,z,c,ry)=>{const g=new T.Group();const m=mat(c,.8);const b=new T.Mesh(new T.BoxGeometry(.30,.40,.17),m);b.position.y=.22;g.add(b);const p=new T.Mesh(new T.BoxGeometry(.22,.16,.05),mat(c,.8));p.position.set(0,.14,.11);g.add(p);const tp=new T.Mesh(new T.CylinderGeometry(.085,.085,.30,12,1,false,0,Math.PI),m);tp.rotation.z=Math.PI/2;tp.position.y=.42;g.add(tp);g.position.set(x,0,z);g.rotation.y=ry;decor.add(g);};
  bag(-1.45,1.15,'#2f5fa8',.4);bag(-1.5,2.75,'#2e8b57',-.3);bag(-4.3,1.2,'#b83a3a',.8);bag(-1.4,-.35,'#c8782d',.2);
  [-2.6,.6,3.6].forEach(z=>{const m=new T.Mesh(new T.PlaneGeometry(2.6,1.5),new T.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:.16,blending:T.AdditiveBlending,depthWrite:false}));m.rotation.x=-Math.PI/2;m.rotation.z=.35;m.position.set(3.2,.015,z-.1);decor.add(m);});
  // Floor joints and perimeter skirting.
  const grout=mat('#aeb4b2');for(let x=-5;x<=5;x+=1)box(decor,x,.003,.25,.009,.005,9.5,grout);for(let z=-4.5;z<=5;z+=1)box(decor,0,.003,z,10,.005,.009,grout);
  for(let z of [-4.47,4.97])box(decor,0,.065,z,10,.13,.035,steel);
  for(let x of [-4.97,4.97])box(decor,x,.065,.25,.035,.13,9.5,steel);
  // Roller blinds and window handles.
  for(let z of [-2.6,.6,3.6]){box(decor,4.89,2.63,z,.16,.12,1.98,white);box(decor,4.88,2.42,z,.02,.3,1.78,white);box(decor,4.84,1.85,z+.8,.04,.12,.025,steel);}
  // Detailed caster chairs, keyboards and desk accessories.
  for(let side of [-1,1])for(let z of [.2,1.8,3.4])for(let dx of [-.7,.7]){
   let x=side*2.8+dx;
   for(let a=0;a<5;a++){let q=a*Math.PI*2/5;let leg=box(decor,x+Math.sin(q)*.12,.10,z+.78+Math.cos(q)*.12,.035,.025,.30,steel);leg.rotation.y=q;let w=cyl(decor,x+Math.sin(q)*.26,.065,z+.78+Math.cos(q)*.26,.045,.045,black);w.rotation.z=Math.PI/2;}
   for(let s of [-1,1]){box(decor,x+s*.24,.61,z+.80,.035,.25,.035,steel);box(decor,x+s*.24,.74,z+.77,.065,.025,.30,black);}
   for(let r=0;r<4;r++)for(let c=0;c<12;c++)box(decor,x-.18+c*.031,.790,z+.16+r*.026,.025,.007,.019,steel);
   box(decor,x-.44,.79,z+.18,.21,.035,.28,mat('#446f7b'));
  }
  // Merge repeated desk and ceiling details into shared-material meshes.
  const groups=new Map();decor.updateMatrixWorld(true);decor.children.slice().forEach(o=>{if(!o.isMesh)return;let list=groups.get(o.material)||[];let g=o.geometry.clone();g.applyMatrix4(o.matrix);if(g.index)g=g.toNonIndexed();list.push(g);groups.set(o.material,list);decor.remove(o);});groups.forEach((gs,m)=>{let p=[],n=[],u=[];gs.forEach(g=>{p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);u.push(...g.attributes.uv.array);g.dispose();});let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));decor.add(new T.Mesh(g,m));});
  // Clock on the teaching wall.
  const cv=document.createElement('canvas');cv.width=cv.height=256;let g=cv.getContext('2d');g.fillStyle='#fafafa';g.beginPath();g.arc(128,128,120,0,7);g.fill();g.strokeStyle='#34424a';g.lineWidth=10;g.stroke();g.font='22px sans-serif';g.textAlign='center';g.textBaseline='middle';for(let n=1;n<=12;n++){let a=n*Math.PI/6;g.fillStyle='#34424a';g.fillText(n,128+Math.sin(a)*92,128-Math.cos(a)*92);}g.lineWidth=6;g.beginPath();g.moveTo(128,128);g.lineTo(128,65);g.moveTo(128,128);g.lineTo(178,158);g.stroke();const cm=new T.MeshBasicMaterial({map:new T.CanvasTexture(cv)});mesh(decor,new T.CircleGeometry(.22,40),cm,3.9,2.65,-4.36);
 }
 // ---- CC0 mocap clips (anim.gameasset.net, public domain): sampled once to joint positions, retargeted per person by aiming bones
 const ClipBank={cache:{},files:{teacher:'7543_a_person_gestures_with_hands_while_explaining',0:'7387_a_person_types_on_laptop_while_sitting',1:'8842_a_person_clicks_mouse_repeatedly_absentmindedly',2:'8860_a_person_sits_in_an_office_chair_relaxed',sup:'8860_a_person_sits_in_an_office_chair_relaxed',3:'8892_a_person_clicks_mouse_during_virtual_call',4:'7387_a_person_types_on_laptop_while_sitting'},
  joints:['Hips','Spine1','Spine2','Chest','Neck1','Head','HeadEnd'].concat(...['Left','Right'].map(S=>[S+'Arm',S+'ForeArm',S+'Hand'].concat(...['Thumb','Index','Middle','Ring','Pinky'].map(f=>[1,2,3,4].map(i=>S+'Hand'+f+i).concat([S+'Hand'+f+'End']))))),
  get(key){const f=this.files[key];if(!f)return Promise.resolve(null);if(this.cache[f])return this.cache[f];const Ld=T.GLTFLoader||(window.THREE&&THREE.GLTFLoader);if(!Ld)return Promise.resolve(null);
   return this.cache[f]=new Promise(res=>{new Ld().load(({"7387_a_person_types_on_laptop_while_sitting": "v6/60-7387_a_person_types_on_laptop_while_sitting.glb", "7543_a_person_gestures_with_hands_while_explaining": "v6/61-7543_a_person_gestures_with_hands_while_explaining.glb", "8842_a_person_clicks_mouse_repeatedly_absentmindedly": "v6/62-8842_a_person_clicks_mouse_repeatedly_absentmindedly.glb", "8860_a_person_sits_in_an_office_chair_relaxed": "v6/63-8860_a_person_sits_in_an_office_chair_relaxed.glb", "8892_a_person_clicks_mouse_during_virtual_call": "v6/64-8892_a_person_clicks_mouse_during_virtual_call.glb"}[f]+'?v=6'),g=>{try{const clip=g.animations[0],dur=clip.duration,mx=new T.AnimationMixer(g.scene);mx.clipAction(clip).play();const K=24,keys=[];const nodes={};this.joints.forEach(n=>{const o=g.scene.getObjectByName(n);if(o)nodes[n]=o;});
    for(let k=0;k<K;k++){mx.setTime(dur*k/(K-1));g.scene.updateMatrixWorld(true);const p={};for(const n in nodes){const v=new T.Vector3();nodes[n].getWorldPosition(v);p[n]=v;}keys.push(p);}
    res({keys,dur});}catch(e){console.warn('clip',e);res(null);}},undefined,()=>res(null));});}};
 const Dir=window.V5Dir={speaker:null,ver:0,mood:{teacher:'',super:'',students:''}};
window.addEventListener('v5-talk',e=>{const w=e.detail.who,nm=w==='supervisor'?'super':w==='student'?'s0':w;if(e.detail.on)Dir.speaker=nm;else if(Dir.speaker===nm)Dir.speaker=null;Dir.ver++;});
window.addEventListener('v5-mood',e=>{const w=e.detail.who;Dir.mood[w==='supervisor'?'super':w]=e.detail.mood;Dir.ver++;});
AFRAME.registerComponent('v5-person',{
  schema:{name:{default:'teacher'},seated:{default:false},idx:{default:0},pose:{default:''}},
  init(){this.el.addEventListener('model-loaded',e=>{
   const model=e.detail.model,D=this.data;D.idx=D.name==='teacher'?5:D.name==='super'?6:(parseInt(String(D.name).replace(/\D/g,''))||0);this.model=model;const bn={};
   model.traverse(o=>{if(o.isBone)bn[o.name.replace(/[.]/g,'')]=o;if(o.isMesh){if(D.idx===5&&o.material)o.material.color.setRGB(1.7,1.7,1.9);o.frustumCulled=false;if(o.material&&/suit|pants|jeans|shirt/i.test(o.material.name||'')){o.material.polygonOffset=true;o.material.polygonOffsetFactor=-3;o.material.polygonOffsetUnits=-3;}if(o.material&&/shoes/i.test(o.material.name||'')){o.material.polygonOffset=true;o.material.roughness=.35;}o.castShadow=true;o.receiveShadow=true;if(o.material&&o.material.map)o.material.map.anisotropy=4;}});
   this.origRest={};for(const k in bn)this.origRest[k]=bn[k].quaternion.clone();
   this.bones=bn;const B=n=>bn[n];this.head=B('head');if(this.head)this.head.userData.rest=this.head.quaternion.clone();
   model.updateMatrixWorld(true);
   const V=(x,y,z)=>new T.Vector3(x,y,z),wp=n=>{const v=new T.Vector3();(typeof n==='string'?B(n):n).getWorldPosition(v);return v};
   const up=V(0,1,0);
   const rotW=(b,R)=>{const pq=new T.Quaternion(),bq=new T.Quaternion();b.parent.getWorldQuaternion(pq);b.getWorldQuaternion(bq);b.quaternion.copy(pq.invert().multiply(R.clone().multiply(bq)));b.updateMatrixWorld(true);};
   const aim=(b,child,target,ps)=>{const cur=wp(child).sub(wp(b)).normalize();const R=new T.Quaternion().setFromUnitVectors(cur,target.clone().normalize());rotW(b,R);ps.forEach(p=>p.applyQuaternion(R));};
   const fwd=wp('toe2-1L').sub(wp('footL')).setY(0).normalize();
   const seated=D.seated,flat=seated&&D.idx!==6,holding=D.idx===6;
   for(const s of ['L','R']){
    const out=wp('upperarm01'+s).sub(wp('spine01')).setY(0).normalize();
    const p=V(0,-1,0);
    // relaxed fingers, curl graduated by finger (thumb nearly straight); flatter on the desk
    const base=flat?.22:holding?1.15:.7;
    [[2,.55],[3,.7],[4,.85],[5,1]].forEach(([f,k])=>{[[1,.3],[2,.5],[3,.34]].forEach(([j,a])=>{const b=B('finger'+f+'-'+j+s);if(!b)return;const ch=B('finger'+f+'-'+(j+1)+s)||null;const nx=ch?ch:null;const d=nx?wp('finger'+f+'-'+(j+1)+s).sub(wp('finger'+f+'-'+j+s)).normalize():wp('finger'+f+'-'+j+s).sub(wp('finger'+f+'-'+(j-1)+s)).normalize();const ax=new T.Vector3().crossVectors(d,p).normalize();rotW(b,new T.Quaternion().setFromAxisAngle(ax,a*base*k));});});
    [[1,.12],[2,.18],[3,.12]].forEach(([j,a])=>{const b=B('finger1-'+j+s);if(!b)return;const nx=B('finger1-'+(j+1)+s);const d=nx?wp('finger1-'+(j+1)+s).sub(wp('finger1-'+j+s)).normalize():wp('finger1-'+j+s).sub(wp('finger1-'+(j-1)+s)).normalize();const ax=new T.Vector3().crossVectors(d,p).normalize();rotW(b,new T.Quaternion().setFromAxisAngle(ax,a*(flat?.4:1)));});
    // arms
    const down=V(0,-1,0);
    const ps=[p];
    aim(B('upperarm01'+s),B('lowerarm01'+s),down.clone().add(out.clone().multiplyScalar(holding?.12:.1)).add(fwd.clone().multiplyScalar(seated?(holding?.45:.55):.04)),ps);
    const ftarget=holding?down.clone().multiplyScalar(.1).add(fwd.clone().multiplyScalar(1.35)).add(up.clone().multiplyScalar(.2)).add(out.clone().multiplyScalar(-.3)):seated?up.clone().multiplyScalar(.3).add(fwd).add(out.clone().multiplyScalar(-.12)):down.clone().add(out.clone().multiplyScalar(.04)).add(fwd.clone().multiplyScalar(.28));
    aim(B('lowerarm01'+s),B('wrist'+s),ftarget,ps);
    // forearm twist so the palm faces the thigh (standing) or the desk (seated)
    const d=wp('wrist'+s).sub(wp('lowerarm01'+s)).normalize();
    const pt=holding?out.clone().multiplyScalar(-1).add(up.clone().multiplyScalar(.8)):flat?down:out.clone().multiplyScalar(-1).add(fwd.clone().multiplyScalar(.15));
    const pa=p.clone().addScaledVector(d,-p.dot(d)).normalize(),pb=pt.clone().addScaledVector(d,-pt.dot(d)).normalize();
    let ang=Math.acos(Math.max(-1,Math.min(1,pa.dot(pb))));if(new T.Vector3().crossVectors(pa,pb).dot(d)<0)ang=-ang;
    if(this.data.dbg)console.log(D.idx,s,'twist',ang.toFixed(2));
    rotW(B('lowerarm02'+s),new T.Quaternion().setFromAxisAngle(d,ang*.5));
    rotW(B('wrist'+s),new T.Quaternion().setFromAxisAngle(d,ang*.5));
   }
   if(!seated){
    for(const s of ['L','R']){const ps=[],dn=V(0,-1,0),ot=wp('upperleg01'+s).sub(wp('spine05')).setY(0).normalize(),w=s==='L'?1:0;
     aim(B('upperleg01'+s),B('lowerleg01'+s),dn.clone().add(ot.clone().multiplyScalar(w?.03:.1)).add(fwd.clone().multiplyScalar(w?-.02:.1)),ps);
     aim(B('lowerleg01'+s),B('foot'+s),dn.clone().add(fwd.clone().multiplyScalar(w?-.01:-.05)),ps);
     aim(B('foot'+s),B('toe2-1'+s),fwd.clone().add(dn.clone().multiplyScalar(.04)),ps);}
   }
   if(seated){
    for(const s of ['L','R']){const ps=[];aim(B('upperleg01'+s),B('lowerleg01'+s),fwd.clone().add(V(0,-.05,0)),ps);aim(B('lowerleg01'+s),B('footL'.replace('L',s)),V(0,-1,0).add(fwd.clone().multiplyScalar(-.05)),ps);}
   }
   // stand feet on the floor (entity origin)
   model.updateMatrixWorld(true);
   const low=Math.min(wp('toe2-1L').y,wp('toe2-1R').y,wp('footL').y,wp('footR').y);const el=this.el.object3D;const ev=new T.Vector3();el.getWorldPosition(ev);
   if(seated){const py=(wp('pelvisL').y+wp('pelvisR').y)/2;model.position.y+=(ev.y+.56)-py;}else model.position.y+=(ev.y-low)+.012;
   model.updateMatrixWorld(true);
   if(holding){
    const cb=B('spine01'),lw=wp('finger3-1L'),rw=wp('finger3-1R');const lw0=lw.clone(),rw0=rw.clone();const span=Math.hypot(lw.x-rw.x,lw.z-rw.z);const BW=Math.max(.17,Math.min(.27,span-.045));const mid=lw.clone().add(rw).multiplyScalar(.5);
    const g=new T.Group();const brd=new T.Mesh(new T.BoxGeometry(BW,.31,.012),new T.MeshStandardMaterial({color:'#8a5a2b',roughness:.6})),pap=new T.Mesh(new T.BoxGeometry(BW-.03,.28,.004),new T.MeshStandardMaterial({color:'#f6f5ef',roughness:.9})),clip=new T.Mesh(new T.BoxGeometry(.08,.03,.02),new T.MeshStandardMaterial({color:'#9aa0a6',metalness:.6,roughness:.4}));
    pap.position.z=.008;clip.position.set(0,.16,.01);g.add(brd,pap,clip);
    // the sheet faces back toward the reader (opposite fwd), tilted up toward the face
    const zA=fwd.clone().multiplyScalar(-1).add(V(0,.55,0)).normalize();const xA=new T.Vector3().crossVectors(up,zA).normalize();const yA=new T.Vector3().crossVectors(zA,xA);
    const q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(xA,yA,zA));
    const wsc=new T.Vector3();cb.getWorldScale(wsc);cb.add(g);mid.addScaledVector(zA,.018);g.position.copy(cb.worldToLocal(mid));const cq=new T.Quaternion();cb.getWorldQuaternion(cq);g.quaternion.copy(cq.invert().multiply(q));g.scale.setScalar(1/wsc.y);this.clip=g;g.updateMatrixWorld(true);
   }
   this.initLife(model,bn,fwd,seated,holding);
   // retarget a mocap clip onto this rig: aim each bone along the clip's bone direction (no rest-pose matching needed)
   this.bakeAnim=(data)=>{
    const names=[];const mh=(n)=>B(n);
    const fingerNames=[];for(const s of ['L','R'])for(let f=1;f<=5;f++)for(let j=1;j<=3;j++)if(B('finger'+f+'-'+j+s))fingerNames.push('finger'+f+'-'+j+s);
    const torsoOnly=D.idx===6;const list=['spine05','spine03','spine01','neck02'].concat(...(torsoOnly?[]:['L','R'].map(s=>['upperarm01'+s,'lowerarm01'+s,'lowerarm02'+s,'wrist'+s]))).concat(torsoOnly?[]:fingerNames).filter(n=>B(n));
    const cn=['Thumb','Index','Middle','Ring','Pinky'];
    const keysOut=[];
    for(const n of list)if(this.origRest[n])B(n).quaternion.copy(this.origRest[n]);
    model.updateMatrixWorld(true);
    const k0=data.keys[0];const sc=k0.LeftArm.clone().sub(k0.RightArm).setY(0).normalize(),sm=wp('upperarm01L').sub(wp('upperarm01R')).setY(0).normalize();const yaw=new T.Quaternion().setFromUnitVectors(sc,sm);
    for(const P of data.keys){
     for(const n of list)B(n).quaternion.copy(this.origRest[n]);model.updateMatrixWorld(true);
     const dr=(a,b)=>P[b].clone().sub(P[a]).normalize().applyQuaternion(yaw),no=[];
     const kk=seated?.3:.8,dv=(a,b)=>V(0,1,0).lerp(dr(a,b),kk).normalize();aim(B('spine05'),B('spine03'),dv('Hips','Spine2'),no);aim(B('spine03'),B('spine01'),dv('Spine2','Chest'),no);aim(B('spine01'),B('neck02'),dv('Chest','Neck1'),no);aim(B('neck02'),B('head'),dv('Neck1','Head'),no);
     if(!torsoOnly)for(const s of ['L','R']){const S=s==='L'?'Left':'Right';
      aim(B('upperarm01'+s),B('lowerarm01'+s),dr(S+'Arm',S+'ForeArm'),no);
      aim(B('lowerarm01'+s),B('wrist'+s),dr(S+'ForeArm',S+'Hand'),no);
      aim(B('wrist'+s),B('finger3-1'+s),dr(S+'Hand',S+'Hand'+'Middle1'),no);
      // palm roll from the knuckle line
      const ax=dr(S+'Hand',S+'HandMiddle1'),kc=P[S+'HandIndex1'].clone().sub(P[S+'HandPinky1']).applyQuaternion(yaw),km=wp('finger2-1'+s).sub(wp('finger5-1'+s));
      const pa=km.clone().addScaledVector(ax,-km.dot(ax)).normalize(),pb=kc.clone().addScaledVector(ax,-kc.dot(ax)).normalize();let ang=Math.acos(Math.max(-1,Math.min(1,pa.dot(pb))));if(new T.Vector3().crossVectors(pa,pb).dot(ax)<0)ang=-ang;
      if(isFinite(ang))rotW(B('wrist'+s),new T.Quaternion().setFromAxisAngle(ax,ang));
      for(let f=1;f<=5;f++){const c=cn[f-1];for(let j=1;j<=3;j++){const b=B('finger'+f+'-'+j+s);if(!b)continue;const nx=B('finger'+f+'-'+(j+1)+s);const a1=S+'Hand'+c+j,a2=S+'Hand'+c+(j+1>4?'End':(j+1));if(!P[a1]||!P[a2])continue;
        const t=dr(a1,a2);if(nx)aim(b,nx,t,no);else{const cur=wp(b).sub(wp(b.parent)).normalize();rotW(b,new T.Quaternion().setFromUnitVectors(cur,t));}}}
     }
     const row=new Float32Array(list.length*4);list.forEach((n,i)=>{const q=B(n).quaternion;row[i*4]=q.x;row[i*4+1]=q.y;row[i*4+2]=q.z;row[i*4+3]=q.w;});keysOut.push(row);
    }
    // start from the first key
    list.forEach((n,i)=>B(n).quaternion.set(keysOut[0][i*4],keysOut[0][i*4+1],keysOut[0][i*4+2],keysOut[0][i*4+3]));
    this.anim={list,keys:keysOut,dur:data.dur,speed:D.idx===5?.8:.55+.06*D.idx,t0:D.idx*.7};
    if(this.life)this.life.anim=true;
   };
   if(D.idx!==6)ClipBank.get(D.idx===5?'teacher':D.idx).then(d=>{if(d)this.bakeAnim(d);});
  });},
  // ---- natural idle life layer (procedural, light): breathing, weight shift, glances, blinks, hand/arm micro motion
  initLife(model,bn,fwd,seated,holding){
   const D=this.data,rnd=(()=>{let x=(D.idx+1)*9301+49297;return()=>{x=(x*9301+49297)%233280;return x/233280;};})();
   const up=new T.Vector3(0,1,0),side=new T.Vector3().crossVectors(up,fwd).normalize();
   model.updateMatrixWorld(true);
   const L={bones:{},fwd:fwd.clone(),side,up,ph:rnd()*6.28,bp:3.9+rnd()*1.3,ba:.75+rnd()*.5,look:{y:0,p:0,ty:0,tp:0,next:1+rnd()*2},blink:{next:1.5+rnd()*3,t:-1},gest:{next:4+rnd()*5,t:-1},shift:{next:3+rnd()*5,from:0,to:0,t0:0},tap:{next:5+rnd()*6,t:-1},rnd};
   const reg=(n)=>{const b=bn[n];if(!b||!b.parent)return;const pq=new T.Quaternion();b.parent.getWorldQuaternion(pq);L.bones[n]={b,rest:b.quaternion.clone(),pq,pqi:pq.clone().invert()};};
   ['spine01','spine02','spine03','spine04','neck02','neck03','head','clavicleL','clavicleR','upperarm01L','upperarm01R','lowerarm01L','lowerarm01R','finger2-1L','finger2-1R','finger3-1R','finger3-1L','wristL','wristR'].forEach(reg);
   // per-character posture personality (static lean / head tilt / scale)
   const pr=[[.05,.02,.04],[-.02,-.03,-.02],[.08,.03,.05],[.02,-.02,.0],[.06,.0,-.05],[-.01,.01,.0],[.05,-.01,.03]][D.idx%7];
   L.lean=pr[0];L.roll=pr[1];L.tilt=pr[2];
   const sc=[1,.98,1.02,.99,1.01,1.03,1][D.idx%7];model.scale.multiplyScalar(sc);
   L.baseX=model.position.x;L.baseZ=model.position.z;
   // eyelids: a skin-coloured half shell per eye that rotates down for a blink
   try{
    const eyes=[];model.traverse(o=>{if(o.isSkinnedMesh&&o.name==='low-polyMesh')eyes.push(o);});
    const head=bn.head;
    if(eyes[0]&&head&&eyes[0].geometry.attributes.position){
     const sk=eyes[0],pos=sk.geometry.attributes.position,v=new T.Vector3();const cl=[[],[]],all=[];
     for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);sk.applyBoneTransform(i,v);v.applyMatrix4(sk.matrixWorld);all.push(v.clone());}
     const mc=new T.Vector3();all.forEach(p=>mc.add(p));mc.multiplyScalar(1/all.length);all.forEach(p=>cl[p.clone().sub(mc).dot(side)>0?0:1].push(p));
     // average skin colour from the face texture
     let col=new T.Color('#b88a62');
     const body=[];model.traverse(o=>{if(o.isSkinnedMesh&&/^(s\d|teacher|super)Mesh$/.test(o.name)&&o.material&&o.material.map&&o.material.map.image)body.push(o);});
     const bm=body[0]||null;
     if(bm){try{const im=bm.material.map.image,cv=document.createElement('canvas');cv.width=cv.height=8;const c=cv.getContext('2d');c.drawImage(im,im.width*.3,im.height*.1,im.width*.4,im.height*.15,0,0,8,8);const d=c.getImageData(0,0,8,8).data;let r=0,g=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}const n=d.length/4;col=new T.Color(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();col.multiplyScalar(.88);}catch(e){}}
     L.lids=[];
     cl.forEach(pts=>{if(pts.length<4)return;const bb=new T.Box3().setFromPoints(pts),c=bb.getCenter(new T.Vector3()),sz=bb.getSize(new T.Vector3());const r=Math.max(sz.x,sz.y,sz.z)*.5*1.1;
      const g=new T.SphereGeometry(r,10,6,0,Math.PI*2,0,Math.PI/2);const m=new T.MeshStandardMaterial({color:col,roughness:.8,side:T.DoubleSide});const lid=new T.Mesh(g,m);const pivot=new T.Group();head.add(pivot);pivot.position.copy(head.worldToLocal(c.clone()));{const hs=new T.Vector3();head.getWorldScale(hs);pivot.scale.setScalar(1/hs.y);}
      // orient so open = shell tucked up/back (pole along up), closed = pole forward
      pivot.add(lid);const hq=new T.Quaternion();head.getWorldQuaternion(hq);L.lidBase=hq.clone().invert();
      L.lids.push({pivot,lid,r});});
     L.lids.forEach(o=>{o.pivot.quaternion.copy(L.lidBase).multiply(new T.Quaternion().setFromAxisAngle(side,0));});
     
    }
   }catch(e){console.warn('lids',e);}
   this.life=L;
  },
  lifeTick(t,dt){
   const L=this.life,T_=t/1000,D=this.data;if(!L)return;dt=Math.min(.1,dt/1000);
   const Q=new T.Quaternion(),Q2=new T.Quaternion();
   if(L.dv!==Dir.ver){L.dv=Dir.ver;L.look.next=0;}
   const isSp=Dir.speaker===D.name,mood=D.name==='teacher'?Dir.mood.teacher:D.name==='super'?Dir.mood.super:Dir.mood.students;
   {const tf=D.name==='teacher'?(isSp?1:(mood==='anxious'?.9:.2)):D.name==='super'?1:(mood==='gasp'?.04:1);L.fac=(L.fac===undefined?tf:L.fac)+(tf-(L.fac===undefined?tf:L.fac))*(1-Math.exp(-dt*2.5));L.acc=(L.acc||0)+dt*L.fac;
    const gt=(mood==='gasp'||mood==='anxious')?1:0;L.gl=(L.gl||0)+(gt-(L.gl||0))*(1-Math.exp(-dt*(gt?6:1.5)));
    if(isSp){if(!L.mk){const m=new T.Mesh(new T.ConeGeometry(.045,.1,10),new T.MeshBasicMaterial({color:'#ffd23f'}));m.rotation.x=Math.PI;L.mk=m;this.el.sceneEl.object3D.add(m);}}
    if(L.mk){L.mk.visible=isSp;if(isSp){const hp=new T.Vector3();this.head.getWorldPosition(hp);L.mk.position.set(hp.x,hp.y+.34+Math.sin(T_*4)*.02,hp.z);L.mk.rotation.y=T_*2;}}}
   
   // accumulate per frame: reset to rest then apply
   if(this.anim){const A=this.anim,n=A.keys.length,u=((L.acc*A.speed/A.dur)+A.t0)%2,pp=u<1?u:2-u,f=pp*(n-1),i0=Math.min(n-2,Math.floor(f)),w=f-i0,q1=new T.Quaternion(),q2=new T.Quaternion();
    const r0=A.keys[i0],r1=A.keys[i0+1];A.list.forEach((nm,i)=>{q1.set(r0[i*4],r0[i*4+1],r0[i*4+2],r0[i*4+3]);q2.set(r1[i*4],r1[i*4+1],r1[i*4+2],r1[i*4+3]);q1.slerp(q2,w);const o=L.bones[nm];if(o){o.rest.copy(q1);}else{const b=this.bones[nm];if(b)b.quaternion.copy(q1);}});}
   for(const k in L.bones){const o=L.bones[k];o.b.quaternion.copy(o.rest);}
   const ap=(n,axis,ang)=>{const o=L.bones[n];if(!o||!ang)return;Q.setFromAxisAngle(axis,ang);Q2.copy(o.pqi).multiply(Q).multiply(o.pq);o.b.quaternion.premultiply(Q2);};
   const sd=L.side,fw=L.fwd,up=L.up;
   // breathing: inhale ~40% of the cycle, exhale ~60%, slight irregularity
   const ph=((T_/L.bp)+L.ph)%1,br=ph<.4?Math.sin(ph/.4*Math.PI/2):Math.cos((ph-.4)/.6*Math.PI/2);const bw=br*(1+.15*Math.sin(T_*.37+L.ph));
   ap('spine02',sd,-.016*L.ba*bw);ap('spine04',sd,-.012*L.ba*bw);
   ap('clavicleL',fw,.018*L.ba*bw);ap('clavicleR',fw,-.018*L.ba*bw);
   // posture + slow sway / weight shift
   const sw=Math.sin(T_*.21+L.ph)*.012+Math.sin(T_*.53+L.ph*2)*.006;
   ap('spine01',sd,L.lean*.5);ap('spine03',sd,L.lean*.5);
   ap('spine01',fw,L.roll*.5+sw);ap('spine03',fw,L.roll*.5-sw*.6);
   if(!D.seated){const s=L.shift;if(T_>s.next){s.from=s.to;s.to=(L.rnd()-.5)*.05;s.t0=T_;s.next=T_+5+L.rnd()*7;}const k=Math.min(1,(T_-s.t0)/1.6),e=k*k*(3-2*k),x=s.from+(s.to-s.from)*e;this.model.position.x=L.baseX+sd.x*x;this.model.position.z=L.baseZ+sd.z*x;ap('spine01',fw,x*1.2);ap('spine03',fw,-x*.8);}
   // gaze: pick a new target now and then; head leads, neck/upper spine follow; damped so it settles
   const lk=L.look;if(T_>lk.next){this.pickLook(lk,T_);}
   const sp=1-Math.exp(-dt*(lk.fast?9:4));lk.y+=(lk.ty-lk.y)*sp;lk.p+=(lk.tp-lk.p)*sp;
   const nz=Math.sin(T_*.9+L.ph)*.01+Math.sin(T_*2.3+L.ph*3)*.004;
   ap('spine03',up,(lk.y+nz)*.12);ap('neck02',up,(lk.y+nz)*.28);ap('head',up,(lk.y+nz)*.5);
   ap('neck02',sd,(lk.p)*.3);ap('head',sd,lk.p*.6+Math.sin(T_*.7+L.ph)*.008);
   ap('head',fw,L.tilt+Math.sin(T_*.31+L.ph)*.015-lk.y*.05);
   if(isSp){const env=Math.abs(Math.sin(T_*7.3))*Math.abs(Math.sin(T_*2.1+1));ap('head',sd,.05*env);ap('neck02',sd,.02*env);ap('head',up,Math.sin(T_*1.7)*.05);}
   if(L.gl>.01){ap('spine03',sd,-.1*L.gl);ap('head',sd,-.09*L.gl);if(mood==='anxious')ap('head',up,Math.sin(T_*5)*.06*L.gl);}
   // arms and hands: forearm drift, occasional gesture (teacher) / finger tap (student)
   const ad=Math.sin(T_*.45+L.ph)*.025;
   if(!this.anim&&D.idx!==6){ap('lowerarm01L',sd,ad);ap('lowerarm01R',sd,-ad*.8);}
   if(D.idx!==6){ap('upperarm01L',fw,Math.sin(T_*.3+L.ph)*.012);ap('upperarm01R',fw,-Math.sin(T_*.33+L.ph)*.012);}
   if(this.anim){}else if(D.idx===5){const g=L.gest;if(T_>g.next){g.t=T_;g.next=T_+7+L.rnd()*8;}const k=(T_-g.t)/2.6;if(k>=0&&k<1){const e=Math.sin(k*Math.PI);ap('upperarm01R',sd,-.55*e);ap('lowerarm01R',sd,-.7*e);ap('wristR',sd,-.2*e);ap('upperarm01R',up,.25*e);}}
   else if(D.seated&&D.idx!==6){const tp=L.tap;if(T_>tp.next){tp.t=T_;tp.next=T_+4+L.rnd()*8;}const k=(T_-tp.t)/1.2;if(k>=0&&k<1){const e=Math.max(0,Math.sin(k*Math.PI*3))*(1-k);ap('finger2-1R',sd,-.35*e);ap('finger3-1R',sd,-.25*e*Math.abs(Math.sin(k*9)));}}
   // blink
   if(L.lids){const b=L.blink;if(T_>b.next){b.t=T_;b.next=T_+2.5+L.rnd()*4.5;if(L.rnd()<.15)b.next=T_+.35;}
    const k=(T_-b.t)/.22;let c=0;if(k>=0&&k<1)c=k<.4?k/.4:1-(k-.4)/.6;
    L.lids.forEach(o=>{o.pivot.visible=c>.02;if(o.pivot.visible){Q.setFromAxisAngle(sd,c*1.45);o.pivot.quaternion.copy(L.lidBase).multiply(Q);}});}
  },
  pickLook(lk,T_){
   const L=this.life,D=this.data,all=[...document.querySelectorAll('[v5-person]')];const me=this.el;
   const r=L.rnd();let tgt=null;
   const spk=Dir.speaker,mood0=D.name==='teacher'?Dir.mood.teacher:D.name==='super'?Dir.mood.super:Dir.mood.students;
   if(spk&&spk!==D.name&&!(D.name==='super'&&Dir.mood.super==='note'&&r<.6)){const se=all.find(e=>e.components['v5-person']&&e.components['v5-person'].data.name===spk);
    if(se&&se.components['v5-person'].head&&r<.88){const hp2=new T.Vector3(),mp2=new T.Vector3();this.head.getWorldPosition(mp2);se.components['v5-person'].head.getWorldPosition(hp2);const d2=hp2.sub(mp2).normalize();
     lk.ty=Math.max(-.95,Math.min(.95,Math.atan2(d2.dot(L.side),d2.dot(L.fwd))));lk.tp=Math.max(-.25,Math.min(.4,Math.asin(-Math.max(-1,Math.min(1,d2.y)))));lk.fast=(mood0==='gasp'||mood0==='anxious')||L.rnd()<.4;lk.next=T_+(mood0==='gasp'?1.2:2+L.rnd()*2.5);return;}}
   if(D.name==='super'&&Dir.mood.super==='note'){lk.ty=(L.rnd()-.5)*.2;lk.tp=.36;lk.next=T_+2.5+L.rnd()*3;return;}
   const hp=new T.Vector3(),mp=new T.Vector3();this.head.getWorldPosition(mp);
   lk.fast=false;
   if(D.idx===5){ // teacher scans students and the room
    if(r<.75){const st=all.filter(e=>e!==me&&e.components['v5-person']&&e.components['v5-person'].head);tgt=st[Math.floor(L.rnd()*st.length)];}
    lk.next=T_+1.6+L.rnd()*3;
   }else if(D.idx===6){ // supervisor mostly reads the clipboard, sometimes looks up
    if(r<.35){const t=all.find(e=>e.components['v5-person']&&e.components['v5-person'].data.idx===5);tgt=t;}
    else{lk.ty=(L.rnd()-.5)*.3;lk.tp=.32;lk.next=T_+2+L.rnd()*4;return;}
    lk.next=T_+1.5+L.rnd()*2.5;
   }else{ // students: mostly teacher/screen, sometimes down at the desk or a neighbour
    if(r<.55){tgt=all.find(e=>e.components['v5-person']&&e.components['v5-person'].data.idx===5);}
    else if(r<.8){lk.ty=(L.rnd()-.5)*.5;lk.tp=.3+L.rnd()*.15;lk.next=T_+1.5+L.rnd()*3;return;}
    else{tgt=all[Math.floor(L.rnd()*5)];if(tgt===me)tgt=null;}
    lk.next=T_+2+L.rnd()*4;
   }
   if(tgt&&tgt.components['v5-person']&&tgt.components['v5-person'].head){tgt.components['v5-person'].head.getWorldPosition(hp);const d=hp.sub(mp).normalize();
    let y=Math.atan2(d.dot(L.side),d.dot(L.fwd)),p=Math.asin(-Math.max(-1,Math.min(1,d.y)));lk.ty=Math.max(-.9,Math.min(.9,y));lk.tp=Math.max(-.25,Math.min(.4,p));lk.fast=L.rnd()<.5;}
   else{lk.ty=(L.rnd()-.5)*.6;lk.tp=(L.rnd()-.3)*.2;}
  },
  tick(t,dt){if(!this.model||!this.head)return;this.lifeTick(t,dt);},
  _old(t,dt){if(!this.model||!this.head)return;this.head.quaternion.copy(this.head.userData.rest).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.sin(t*.0013+this.data.idx)*.03));}
 });
 function replacePeople(){
  const people=[Classroom.state.people.teacher,Classroom.state.people.supervisor,...Classroom.state.students];
  const NM=['teacher','super','s0','s1','s2','s3','s4'];
  people.forEach((el,i)=>{const model=document.createElement('a-entity');model.setAttribute('gltf-model',({"teacher": "v7/5-mh-teacher7.glb", "super": "v6/54-mh-super.glb", "s0": "v6/55-mh-s0.glb", "s1": "v6/56-mh-s1.glb", "s2": "v6/57-mh-s2.glb", "s3": "v6/58-mh-s3.glb", "s4": "v6/59-mh-s4.glb"}[NM[i]]+'?v=7'));model.setAttribute('rotation','0 180 0');model.setAttribute('v5-person',{name:NM[i],seated:!!el.__parts.seated,idx:i});
   model.addEventListener('model-loaded',()=>{[...el.children].filter(c=>c!==model).forEach(c=>c.object3D.visible=false);});el.appendChild(model);
  });
 }
 function hand(side){
  const group=new T.Group(),m=new T.MeshPhysicalMaterial({color:'#6dccf1',transparent:true,opacity:.58,roughness:.32,metalness:.25,emissive:'#17658c',emissiveIntensity:.3});
  let arm=mesh(group,new T.CylinderGeometry(.035,.055,.34,16),m,0,-.13,.10);arm.rotation.x=-.55;
  let palm=mesh(group,new T.SphereGeometry(.055,16,12),m,0,.025,-.025);palm.scale.set(.8,.42,1.22);
  for(let i=0;i<4;i++){let x=(i-1.5)*.023;let f=mesh(group,new T.CapsuleGeometry(.011,.062-(i===3?.018:0),4,8),m,x,.027,-.105);f.rotation.x=-1.45;}
  let thumb=mesh(group,new T.CapsuleGeometry(.014,.045,4,8),m,-side*.058,.01,-.04);thumb.rotation.z=-side*.8;thumb.rotation.x=-.9;
  group.position.set(side*.22,-.33,-.40);group.rotation.y=-side*.15;return group;
 }
 AFRAME.registerComponent('v5-hands',{
  init(){this.hands=[hand(-1),hand(1)];this.hands.forEach(h=>this.el.object3D.add(h));this.tap=0;window.addEventListener('hand-target',e=>{this.tap=performance.now();this.target=Classroom.state.calTargets[e.detail].group.object3D;});window.addEventListener('pointerdown',()=>this.tap=performance.now());},
  tick(t){this.hands.forEach((h,i)=>{h.visible=document.body.classList.contains('playing')&&!document.querySelector('a-scene').is('vr-mode');h.position.y=-.33+Math.sin(t*.0018+i)*.006;const k=Math.max(0,1-(performance.now()-this.tap)/650);h.position.z=-.40;h.position.x=(i===0?-1:1)*.22;if(i===1&&this.target&&k>0){const v=new T.Vector3();this.target.getWorldPosition(v);this.el.object3D.worldToLocal(v);h.position.lerp(v,Math.sin(k*Math.PI)*.78);}});}
 });
 window.addEventListener('load',()=>{const poll=setInterval(()=>{if(!Classroom.state.people.teacher)return;clearInterval(poll);softenRoom();replacePeople();{const root=document.querySelector('#classroom');const fl=document.createElement('a-entity');fl.setAttribute('light','type:point;intensity:0.55;distance:6;decay:1.5;color:#fffaf0');fl.setAttribute('position','-1.6 2.0 -1.2');root.appendChild(fl);const fl2=document.createElement('a-entity');fl2.setAttribute('light','type:point;intensity:0.35;distance:7;decay:1.5;color:#fffaf0');fl2.setAttribute('position','0 2.2 0.6');root.appendChild(fl2);}const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d'),grad=cx.createRadialGradient(64,64,8,64,64,64);grad.addColorStop(0,'rgba(40,255,170,.3)');grad.addColorStop(.5,'rgba(40,255,170,.14)');grad.addColorStop(1,'rgba(40,255,170,0)');cx.fillStyle=grad;cx.fillRect(0,0,128,128);const tm=new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false,blending:T.AdditiveBlending});Object.values(Classroom.state.calTargets).forEach(v=>{const a=new T.Mesh(new T.PlaneGeometry(.65,.65),tm);a.position.z=-.003;v.group.object3D.add(a);});document.querySelector('#cam').setAttribute('v5-hands','');},120);});
})();
