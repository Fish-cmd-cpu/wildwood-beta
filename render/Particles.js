import * as THREE from 'three';
import {BLOCKS} from '../world/Blocks.js';
/** Bounded, pooled block fragments and recoverable dropped inventory items. */
export class Particles{
 /** @param {THREE.Scene} scene */
 constructor(scene){this.scene=scene;this.fragments=[];this.drops=[];this.positions=new Float32Array(600*3);this.colors=new Float32Array(600*3);this.geometry=new THREE.BufferGeometry();this.geometry.setAttribute('position',new THREE.BufferAttribute(this.positions,3));this.geometry.setAttribute('color',new THREE.BufferAttribute(this.colors,3));this.points=new THREE.Points(this.geometry,new THREE.PointsMaterial({size:.085,vertexColors:true}));this.points.frustumCulled=false;this.geometry.setDrawRange(0,0);scene.add(this.points);this.dropGeometry=new THREE.BoxGeometry(.23,.23,.23);}
 /** Scatter a small burst in the broken block's color. */
 burst(x,y,z,id){for(let i=0;i<18;i++){if(this.fragments.length>=600)this.fragments.shift();this.fragments.push({x:x+.5,y:y+.5,z:z+.5,vx:(Math.random()-.5)*3,vy:Math.random()*3,vz:(Math.random()-.5)*3,life:.5+Math.random()*.35,color:new THREE.Color(BLOCKS[id].color)});}}
 /** Drop an item that becomes collectible after a short grace period. */
 drop(x,y,z,id,count=1){if(this.drops.length>100){const old=this.drops.shift();this.scene.remove(old.mesh);old.mesh.material.dispose();}const mesh=new THREE.Mesh(this.dropGeometry,new THREE.MeshLambertMaterial({color:BLOCKS[id].color}));mesh.position.set(x,y,z);this.scene.add(mesh);this.drops.push({mesh,id,count,age:0,y,vy:1});}
 /** Animate debris, collide dropped items, and collect nearby items. */
 update(dt,player,inventory,world){this.fragments=this.fragments.filter(p=>{p.life-=dt;p.vy-=12*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;return p.life>0;});this.fragments.forEach((p,i)=>{this.positions.set([p.x,p.y,p.z],i*3);this.colors.set([p.color.r,p.color.g,p.color.b],i*3);});this.geometry.setDrawRange(0,this.fragments.length);this.geometry.attributes.position.needsUpdate=true;this.geometry.attributes.color.needsUpdate=true;
 this.drops=this.drops.filter(d=>{d.age+=dt;d.mesh.rotation.y+=dt;if(world.isLoaded(d.mesh.position.x,d.mesh.position.z)){d.vy-=12*dt;const next=d.y+d.vy*dt;if(BLOCKS[world.getBlock(d.mesh.position.x,next-.15,d.mesh.position.z)].solid){d.vy=0;d.y=Math.floor(next-.15)+1.17;}else d.y=next;}d.mesh.position.y=d.y+Math.sin(d.age*3)*.045;if(d.age>1&&d.mesh.position.distanceTo(player.position.clone().add(new THREE.Vector3(0,.8,0)))<1.65&&inventory.add(d.id,d.count)){this.scene.remove(d.mesh);d.mesh.material.dispose();return false;}if(d.age>300){this.scene.remove(d.mesh);d.mesh.material.dispose();return false;}return true;});}
}
