/* STRIKE 5 V6: original procedural 3D tactical operator and gun inspection, with 2D fallback */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const outfit={
arjun:["#344238","#142530","#d45660","ASSAULT PLATES"],
meher:["#365943","#1c322a","#bad7a5","MARKSMAN HOOD"],
kabir:["#2d415e","#152f48","#69add5","HEAVY BALLISTIC"],
aanya:["#c1cec9","#587d7c","#50edcc","FIELD MEDIC"],
veer:["#252d33","#152027","#6b8884","STEALTH RIG"],
tara:["#753646","#332530","#ed7589","RUSH HARNESS"],
ishaan:["#a18a69","#575544","#f4d498","RECON KIT"],
naira:["#596e7c","#284653","#a2cee9","AREA CONTROL"],
rudra:["#5b6367","#303c43","#ffad72","ENGINEER TOOLS"],
zoya:["#5d694a","#414b38","#e5d0a0","AMMO SUPPLY"],
lakshya:["#273448","#1b2d40","#488ff3","FLANKER SUIT"],
kiara:["#27263b","#141a2d","#ad7de4","TECH VISOR"]
};
let mode="operator", engine=null,scene=null,preview=null,context2d=null,rotation=0,lastKey="",pointer=null,lastX=0,animatedParts=[],idleClock=0;
const selection=()=>window.STRIKE5ReadOnly?.getSelection?.()||{character:{id:"arjun",name:"Arjun Rathore",role:"Assault",skill:"RAPID CHARGE"},weapon:{id:"surya",name:"Surya-7",type:"AR",damage:28,mag:30},helmet:1,vest:1};
const visible=()=>!document.hidden&&!$("lobby").classList.contains("hide");
const material=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.specularColor=new BABYLON.Color3(.15,.15,.15);return m;};
// Deterministic painted textile camouflage: generated locally, no paid texture service.
function fabric(name,base,accent,seed){
 const m=material(name,base);
 const texture=new BABYLON.DynamicTexture(name+"-fabric",{width:128,height:128},scene,false);
 const ctx=texture.getContext();
 ctx.fillStyle=base;ctx.fillRect(0,0,128,128);
 let n=seed*839+17;
 const rand=()=>{n=(Math.imul(n,1664525)+1013904223)|0;return (n>>>0)/4294967296};
 const colors=[accent,"#253a3c","#657467",base];
 for(let i=0;i<95;i++){
  const x=rand()*130,y=rand()*130;
  ctx.fillStyle=colors[Math.floor(rand()*colors.length)];
  ctx.beginPath();ctx.ellipse(x,y,2+rand()*9,1+rand()*4,rand()*6,0,Math.PI*2);ctx.fill();
 }
 ctx.strokeStyle="#d1e0d018";ctx.lineWidth=.6;
 for(let y=2;y<128;y+=8){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y+1);ctx.stroke()}
 texture.update();m.diffuseTexture=texture;m.specularColor=new BABYLON.Color3(.055,.075,.08);
 return m;
}
const box=(name,parent,x,y,z,w,h,d,mat)=>{const a=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);a.parent=parent;a.position.set(x,y,z);a.material=mat;a.isPickable=false;return a};
const tube=(name,parent,x,y,z,h,diam,mat)=>{const a=BABYLON.MeshBuilder.CreateCylinder(name,{height:h,diameter:diam,tessellation:8},scene);a.parent=parent;a.position.set(x,y,z);a.material=mat;a.isPickable=false;return a};
const sphere=(name,parent,x,y,z,size,mat)=>{const a=BABYLON.MeshBuilder.CreateSphere(name,{diameter:size,segments:8},scene);a.parent=parent;a.position.set(x,y,z);a.material=mat;a.isPickable=false;return a};
function draw3d(s){
 if(!scene)return;
 if(preview)preview.dispose(false,true);
 animatedParts=[];
 preview=new BABYLON.TransformNode("previewRoot",scene);
 const char=s.character||{}, weapon=s.weapon||{};
 const [color,armorColor,accentColor,gear]=outfit[char.id]||outfit.arjun;
 const uniform=fabric("uniform-"+char.id,color,accentColor,char.id.length+char.name?.length||7), armor=material("armor",armorColor), accent=material("accent",accentColor),black=material("black","#0e1b23"),face=material("skin","#a97f65"),straps=material("webbing","#24333a"),metal=material("hardware","#647881");
 if(mode==="operator"){
   for(const sign of [-1,1]){
     const leg=tube("leg",preview,sign*.18,.52,0,.82,.22,uniform);animatedParts.push({mesh:leg,sign,kind:"leg"});
     box("boot",preview,sign*.18,.12,.08,.29,.18,.41,black);
     box("kneepad",preview,sign*.18,.40,.15,.24,.17,.13,armor);
     const arm=tube("arm",preview,sign*.41,1.40,.01,.63,.22,uniform);animatedParts.push({mesh:arm,sign,kind:"arm"});
     box("glove",preview,sign*.42,1.03,.08,.24,.19,.22,black);
     box("shoulder",preview,sign*.42,1.65,.10,.21,.13,.24,accent);
   }
   tube("torso",preview,0,1.36,0,.79,.60,uniform);
   box("plate vest",preview,0,1.38,.19,.68,.58,.33,armor);
   box("front ceramic",preview,0,1.46,.37,.49,.29,.06,black);
   // Layered MOLLE webbing, two shoulder harnesses, radio and load-bearing belt.
   for(const x of [-.27,.27]){box("shoulder strap",preview,x,1.57,.34,.115,.55,.105,straps);box("armor buckle",preview,x,1.56,.40,.105,.07,.035,metal)}
   for(const y of [1.28,1.40])for(const x of [-.22,-.07,.08,.23])box("webbing loop",preview,x,y,.413,.12,.037,.025,straps);
   box("radio",preview,-.36,1.40,.12,.15,.30,.15,black);
   tube("radio antenna",preview,-.38,1.64,.11,.25,.025,metal);
   box("belt",preview,0,1.04,.18,.72,.09,.37,straps);
   box("belt buckle",preview,0,1.04,.39,.13,.08,.035,metal);
   for(const x of [-.26,.26])box("side armor",preview,x,1.32,.02,.13,.36,.30,armor);
   
   box("waist",preview,0,1.02,.10,.63,.15,.34,armor);
   box("pack",preview,0,1.36,-.30,.48,.53,.24,armor);
   for(const x of [-.23,0,.23])box("utility pouch",preview,x,1.06,.33,.18,.20,.16,black);
   tube("neck",preview,0,1.90,0,.15,.22,face);
   sphere("head",preview,0,2.10,0,.46,face);
   let helmet=sphere("ballistic helmet",preview,0,2.28,-.015,.50+(s.helmet||1)*.014,armor);helmet.scaling.y=.47;
   box("helmet visor",preview,0,2.15,.19,.45,.10,.13,black);
   box("visor reflection",preview,0,2.17,.257,.34,.018,.022,metal);
   for(const x of [-.26,.26]){box("ear comms",preview,x,2.12,.02,.095,.18,.13,black);box("helmet rail",preview,x,2.29,-.02,.07,.06,.24,metal)}
   box("chin strap",preview,0,1.97,.16,.27,.045,.10,straps);
   
   box("team patch",preview,.4,1.59,.18,.12,.12,.06,accent);
   if(char.id==="aanya"){box("medic cross vertical",preview,0,1.45,.42,.11,.28,.04,accent);box("medic cross horizontal",preview,0,1.45,.44,.26,.11,.04,accent);}
   if(char.id==="meher"){const hood=tube("sniper hood",preview,0,2.25,-.10,.42,.62,uniform);hood.scaling.z=.8;}
   if(char.id==="kabir"){for(const x of [-.47,.47])box("heavy shoulder",preview,x,1.64,0,.32,.24,.43,armor);}
   if(char.id==="kiara"){box("sensor visor",preview,0,2.13,.27,.39,.07,.06,accent);box("wrist detector",preview,.44,1.1,.18,.20,.12,.18,accent);}
   if(char.id==="veer"){box("face wrap",preview,0,2.04,.22,.39,.12,.08,black);}
   if(char.id==="tara"){box("light knee shield",preview,-.18,.41,.20,.25,.13,.12,accent);}
   if(char.id==="lakshya"){box("shoulder badge",preview,.43,1.56,.20,.15,.14,.05,accent);}
   
   if(char.id==="ishaan")box("drone case",preview,0,1.40,-.44,.48,.30,.19,black);
   if(char.id==="rudra")box("tool kit",preview,-.41,1.13,-.11,.27,.31,.29,accent);
   if(char.id==="zoya")for(const x of [-.23,.23])box("ammo pouch",preview,x,1.29,.44,.17,.26,.09,accent);
   if(char.id==="naira")for(const x of [-.3,.3])tube("control grenade",preview,x,1.10,.31,.30,.14,accent);
   if(char.id==="tara"||char.id==="lakshya"||char.id==="veer")box("light harness",preview,-.16,1.39,.42,.12,.43,.09,accent).rotation.z=-.45;
 }else{
   const type=weapon.type||"AR",pistol=type==="PISTOL",sniper=type==="SNIPER",heavy=type==="LMG",smg=type==="SMG",shotgun=type==="SHOTGUN";
   const len=pistol?.7:sniper?1.85:heavy?1.65:shotgun?1.50:smg?1.02:1.42;
   box("receiver",preview,0,1.25,-.1,.29,.25,len*.47,armor);
   for(const side of [-1,1])for(const dz of [-.12,.03,.18])box("receiver grooves",preview,side*.152,1.27,dz,.017,.09,.045,metal);
   box("bolt housing",preview,0,1.43,-len*.04,.17,.055,.37,uniform);
   const barrel=tube("barrel",preview,0,1.28,len*.37,len*.62,.10,black);barrel.rotation.x=Math.PI/2;
   box("rail",preview,0,1.38,len*.04,.19,.06,len*.36,uniform);
   box("stock",preview,0,1.20,-len*.34,.25,.23,len*.24,black);
   box("grip",preview,0,1.0,-.11,.16,.30,.19,black).rotation.x=-.2;
   if(!pistol)box("magazine",preview,0,.94,.1,heavy?.31:.18,.37,heavy?.31:.21,black);
   if(sniper){const scope=tube("scope",preview,0,1.52,0,.60,.17,black);scope.rotation.x=Math.PI/2;}
   else if(!shotgun)box("optic",preview,0,1.49,-.09,.15,.13,.17,accent);
   if(shotgun)box("pump",preview,0,1.19,len*.24,.27,.19,.29,uniform);
   if(heavy)box("ammo box",preview,.25,1.1,-.02,.26,.31,.29,black);
   const muzzle=tube("muzzle",preview,0,1.28,len*.69,.16,.16,accent);muzzle.rotation.x=Math.PI/2;
   if(!pistol){for(const dz of [.13,.26,.39])box("handguard vent",preview,.165,1.33,dz,.012,.085,.045,black);}
   if(sniper)box("scope lens",preview,0,1.52,.31,.17,.17,.018,accent);
   if(heavy)for(const side of [-1,1]){const bipod=tube("folded bipod",preview,side*.19,1.06,len*.44,.42,.027,metal);bipod.rotation.z=side*.22;}
   
 }
 preview.rotation.y=rotation;
}
function render2d(s){
 if(!context2d)return;
 const canvas=$("inspectCanvas"),ctx=context2d,rect=canvas.getBoundingClientRect();
 canvas.width=Math.max(200,Math.round(rect.width*1.25));canvas.height=Math.max(120,Math.round(rect.height*1.25));
 const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
 const grad=ctx.createRadialGradient(w/2,h/2,5,w/2,h/2,w*.6);grad.addColorStop(0,"#185268");grad.addColorStop(1,"#071622");ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(w/2,h*.85);ctx.scale(Math.min(h/175,w/235),Math.min(h/175,w/235));
 const char=s.character||{},gun=s.weapon||{};const [cloth,armor,accent]=outfit[char.id]||outfit.arjun;
 const r=(x,y,a,b,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,a,b)};
 if(mode==="operator"){
  r(-18,-57,15,56,cloth);r(3,-57,15,56,cloth);r(-21,-13,21,11,"#0c1a22");r(1,-13,21,11,"#0c1a22");
  r(-37,-114,74,61,armor);r(-44,-104,11,48,cloth);r(33,-104,11,48,cloth);
  ctx.fillStyle="#ae8669";ctx.beginPath();ctx.ellipse(0,-128,20,23,0,0,7);ctx.fill();
  r(-24,-150,48,13,armor);r(-20,-139,40,8,"#101e27");r(-28,-108,56,5,accent);
  r(-25,-91,20,21,"#273c49");r(5,-91,20,21,"#273c49");
  if(char.id==="aanya"){r(-5,-111,10,30,accent);r(-17,-101,34,9,accent);}
  if(char.id==="kiara")r(-18,-140,36,9,accent);
 } else {
  const type=gun.type||"AR",len=type==="PISTOL"?100:type==="SNIPER"?180:155;
  ctx.translate(0,-85);ctx.rotate(Math.sin(rotation)*.09);
  r(-len*.45,-15,len*.70,25,armor);r(len*.10,-8,len*.46,10,"#101b26");
  r(-len*.60,-9,len*.16,18,"#142631");r(-20,10,19,40,"#1b2f3b");r(5,10,16,35,"#1b2f3b");
  r(-20,-25,40,10,accent);r(len*.54,-12,10,18,accent);
 }
 ctx.restore();
}
function refresh(force=false){
 const s=selection(),ch=s.character||{},g=s.weapon||{},o=outfit[ch.id]||outfit.arjun;
 const key=[mode,ch.id,g.id,s.helmet,s.vest].join(":");
 if(key===lastKey&&!force)return;
 lastKey=key;rotation=0;
 if(mode==="operator"){
   $("inspectorTitle").textContent=ch.name||"Operator";
   $("inspectorDetail").textContent=(ch.role||"Assault").toUpperCase()+" · "+o[3]+" · "+(ch.skill||"");
   $("inspectorSpec").textContent="Helmet L"+(s.helmet||1)+" · Vest L"+(s.vest||1)+" · "+(scene?"Rotating procedural 3D uniform":"2D fallback · WebGL unavailable");
 }else{
   $("inspectorTitle").textContent=g.name||"Weapon";
   $("inspectorDetail").textContent=(g.type||"AR")+" · "+(g.damage||28)+" damage · "+(g.mag||30)+" magazine";
   $("inspectorSpec").textContent=scene?"Interactive procedural 3D inspection":"2D fallback · WebGL unavailable";
 }
 if(scene)draw3d(s);else render2d(s);
}
function boot(){
 if(!$("inspectCanvas"))return;
 const canvas=$("inspectCanvas");
 if(window.BABYLON){
  try{
   engine=new BABYLON.Engine(canvas,true,{stencil:false,antialias:false,powerPreference:"low-power"});
   engine.setHardwareScalingLevel(Math.max(1.75,Math.min(2.6,window.devicePixelRatio||2)));
   scene=new BABYLON.Scene(engine);scene.clearColor=new BABYLON.Color4(.035,.09,.13,1);
   const camera=new BABYLON.ArcRotateCamera("inspectCam",-Math.PI/2,1.1,4.6,new BABYLON.Vector3(0,1.25,0),scene);
   camera.minZ=.01;scene.activeCamera=camera;
   const hemi=new BABYLON.HemisphericLight("inspectLight",new BABYLON.Vector3(0,1,0),scene);hemi.intensity=1.05;
   const sun=new BABYLON.DirectionalLight("inspectRim",new BABYLON.Vector3(-.4,-1,.5),scene);sun.intensity=.75;
   const platformMat=material("platform","#12384c");
   const platform=tube("platform",null,0,-.1,0,.2,2.5,platformMat);
  }catch(e){console.warn("3D preview unavailable; switching to 2D fallback",e?.message);scene=null;engine=null;}
 }
 if(!scene)context2d=canvas.getContext("2d");
 $("inspectOperator").onclick=()=>{mode="operator";$("inspectOperator").classList.add("selected");$("inspectWeapon").classList.remove("selected");refresh(true)};
 $("inspectWeapon").onclick=()=>{mode="weapon";$("inspectWeapon").classList.add("selected");$("inspectOperator").classList.remove("selected");refresh(true)};
 canvas.addEventListener("pointerdown",e=>{pointer=e.pointerId;lastX=e.clientX;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener("pointermove",e=>{if(pointer!==e.pointerId)return;rotation+=(e.clientX-lastX)*.012;lastX=e.clientX;if(preview)preview.rotation.y=rotation;else render2d(selection())});
 for(const event of ["pointercancel","pointerup"])canvas.addEventListener(event,e=>{if(pointer===e.pointerId)pointer=null});
 window.addEventListener("strike5:loadout",()=>refresh());
 window.addEventListener("resize",()=>{if(engine)engine.resize();else render2d(selection())});
 const obs=new MutationObserver(()=>{if(visible()){if(engine)engine.resize();refresh(true)}});
 obs.observe($("lobby"),{attributes:true,attributeFilter:["class"]});
 refresh(true);let previous=0;
 const draw=()=>{if(!visible())return;const now=performance.now();if(now-previous<33)return;previous=now;rotation+=.008;idleClock+=.033;
  if(preview){preview.rotation.y=rotation;preview.position.y=mode==="operator"?Math.sin(idleClock*1.7)*.018:Math.sin(idleClock*1.1)*.009;
   if(mode==="operator")for(const part of animatedParts){part.mesh.rotation.x=part.sign*Math.sin(idleClock*1.65)*(part.kind==="arm"?.055:.025);}
  }
  if(scene)scene.render();else render2d(selection());
 };
 if(engine)engine.runRenderLoop(draw);else{const loop=()=>{draw();requestAnimationFrame(loop)};requestAnimationFrame(loop);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
