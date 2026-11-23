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
 function softenRoom(){
  const root=document.querySelector('#classroom');if(!root)return;document.querySelector('#ambient').setAttribute('light','intensity',.7);
  root.querySelectorAll('a-plane').forEach(e=>{const m=e.getObject3D('mesh');if(!m||e.id||e.dataset.target)return;const p=e.object3D.position;
   if(e.getAttribute('width')>=9&&p.y>0.3){m.material.map=plaster;m.material.color.set(p.y<1?'#afbbc0':'#f4f3ec');m.material.needsUpdate=true;}
   if(p.y===0){const fix=()=>{m.material.map=null;m.material.color.set('#c7ccca');m.material.roughness=.72;m.material.needsUpdate=true;};fix();setTimeout(fix,1200);}
  });
  root.querySelectorAll('a-box').forEach(e=>{const m=e.getObject3D('mesh');if(!m||e.dataset.target)return;const c=m.material.color.getHexString();
   if(['b78a55','9c7448','a9784a'].includes(c)){m.material.map=wood;m.material.color.set('#e4cfaa');m.material.roughness=.65;m.material.needsUpdate=true;}
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
 AFRAME.registerComponent('v5-person',{
  schema:{color:{default:'#ffffff'},seated:{default:false}},
  init(){this.el.addEventListener('model-loaded',e=>{
   const model=e.detail.model;this.model=model;this.bones={};model.traverse(o=>{if(o.isBone){this.bones[o.name]=o;o.userData.rest=o.quaternion.clone();}if(o.isMesh){o.material=o.material.clone();o.material.color.set(this.data.color);o.frustumCulled=false;}});
   if(this.data.seated){model.position.y=-.40;for(let side of ['L','R']){let a=this.bones['thigh_'+side],b=this.bones['calf_'+side];if(a)a.rotateX(-Math.PI/2);if(b)b.rotateX(Math.PI/2);let f=this.bones['forearm_'+side];if(f)f.rotateX(-.9);}}
   else {this.mixer=new T.AnimationMixer(model);let clip=this.el.components['gltf-model'].model.animations.find(a=>a.name==='idle');if(clip)this.mixer.clipAction(clip).play();}
  });},
  tick(t,dt){if(this.mixer)this.mixer.update(Math.min(dt,40)/1000);if(!this.model)return;const talking=this.el.parentEl.__speaking;const b=this.bones.head;if(b)b.rotation.z=Math.sin(t*.0013)*.025;
   if(talking){const a=this.bones.forearm_R;if(a)a.rotation.x=Math.sin(t*.003)*.12;}
  }
 });
 function replacePeople(){
  const people=[Classroom.state.people.teacher,Classroom.state.people.supervisor,...Classroom.state.students];
  people.forEach((el,i)=>{const model=document.createElement('a-entity');model.setAttribute('gltf-model','assets/6-walker-ready.glb');model.setAttribute('rotation','0 180 0');model.setAttribute('v5-person',{seated:!!el.__parts.seated,color:['#c4d3e8','#b2b7c1','#c5d8c5','#dfc3af','#bfccdf','#cfc7de','#a8c5c0'][i]});
   model.addEventListener('model-loaded',()=>{[...el.children].filter(c=>c!==model).forEach(c=>c.object3D.visible=false);});el.appendChild(model);
  });
 }
 function hand(side){
  const group=new T.Group(),m=new T.MeshPhysicalMaterial({color:'#6dccf1',transparent:true,opacity:.58,roughness:.32,metalness:.25,emissive:'#17658c',emissiveIntensity:.3});
  let arm=mesh(group,new T.CylinderGeometry(.035,.055,.34,16),m,0,-.13,.10);arm.rotation.x=-.55;
  let palm=mesh(group,new T.SphereGeometry(.055,16,12),m,0,.025,-.025);palm.scale.set(.8,.42,1.22);
  for(let i=0;i<4;i++){let x=(i-1.5)*.023;let f=mesh(group,new T.CapsuleGeometry(.011,.062-(i===3?.018:0),4,8),m,x,.027,-.105);f.rotation.x=-1.45;}
  let thumb=mesh(group,new T.CapsuleGeometry(.014,.045,4,8),m,side*.058,.01,-.04);thumb.rotation.z=side*.8;thumb.rotation.x=-.9;
  group.position.set(side*.22,-.33,-.40);group.rotation.y=-side*.15;return group;
 }
 AFRAME.registerComponent('v5-hands',{
  init(){this.hands=[hand(-1),hand(1)];this.hands.forEach(h=>this.el.object3D.add(h));this.tap=0;window.addEventListener('hand-target',e=>{this.tap=performance.now();this.target=Classroom.state.calTargets[e.detail].group.object3D;});window.addEventListener('pointerdown',()=>this.tap=performance.now());},
  tick(t){this.hands.forEach((h,i)=>{h.visible=document.body.classList.contains('playing')&&!document.querySelector('a-scene').is('vr-mode');h.position.y=-.33+Math.sin(t*.0018+i)*.006;h.position.z=-.40-(i===1?Math.max(0,1-(performance.now()-this.tap)/450)*.12:0);});}
 });
 window.addEventListener('load',()=>{const poll=setInterval(()=>{if(!Classroom.state.people.teacher)return;clearInterval(poll);softenRoom();replacePeople();document.querySelector('#cam').setAttribute('v5-hands','');},120);});
})();
