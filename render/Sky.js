import * as THREE from 'three';
import {mulberry32} from '../world/Noise.js';
/** Ten-minute solar cycle, fog, and procedural block clouds. */
export class Sky{
 /** @param {THREE.Scene} scene */
 constructor(scene){this.scene=scene;this.day=new THREE.Color('#b6d3d4');this.dusk=new THREE.Color('#cfb3a0');this.night=new THREE.Color('#172a3b');this.sun=new THREE.DirectionalLight(0xfff0d1,2);this.ambient=new THREE.HemisphereLight(0xdceceb,0x829071,2);scene.add(this.sun,this.ambient);
 this.sunDisc=new THREE.Mesh(new THREE.BoxGeometry(9,9,1),new THREE.MeshBasicMaterial({color:0xfff6cb,fog:false}));scene.add(this.sunDisc);
 const rng=mulberry32(42),count=65,geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshLambertMaterial({color:0xfaf9ec,transparent:true,opacity:.88});this.clouds=new THREE.InstancedMesh(geometry,material,count);this.clouds.frustumCulled=false;const dummy=new THREE.Object3D();for(let i=0;i<count;i++){dummy.position.set((rng()-.5)*550,121+rng()*14,(rng()-.5)*550);dummy.scale.set(12+rng()*30,2+rng()*3,8+rng()*18);dummy.updateMatrix();this.clouds.setMatrixAt(i,dummy.matrix);}scene.add(this.clouds);this.time=100;this.daylight=1;}
 /** Advance time and position atmospheric geometry relative to the camera. */
 update(dt,position,distance){this.time+=dt;const angle=this.time/600*Math.PI*2,elevation=Math.sin(angle),day=Math.max(0,Math.min(1,(elevation+.15)/.55));this.daylight=day;const color=this.night.clone().lerp(this.dusk,Math.max(0,Math.min(1,(elevation+.25)*3))).lerp(this.day,Math.max(0,Math.min(1,elevation*2)));this.scene.background.copy(color);this.scene.fog.color.copy(color);this.scene.fog.near=distance*16*.53;this.scene.fog.far=distance*16*.94;this.sun.position.set(Math.cos(angle)*100,elevation*150,70);this.sun.intensity=.15+day*1.75;this.ambient.intensity=.19+day*1.55;this.sunDisc.position.set(position.x+Math.cos(angle)*125,position.y+elevation*145,position.z-130);this.sunDisc.lookAt(position);this.clouds.position.x=Math.floor(position.x/240)*240+Math.sin(this.time*.001)*20;this.clouds.position.z=Math.floor(position.z/240)*240;}
 /** Describe the current phase for the DOM clock. */
 label(){const t=this.time%600;return t<240?'Daylight':t<300?'Golden hour':t<540?'Nightfall':'First light';}
}
