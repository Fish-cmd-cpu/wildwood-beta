import * as THREE from 'three';
import {BLOCKS,B} from '../world/Blocks.js';
import {mulberry32} from '../world/Noise.js';
/** Runtime 16px texture atlas, with a duplicated one-pixel gutter. */
export class TextureAtlas{
 /** Draw every texture without loading any external image assets. */
 constructor(){this.canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(144,72):Object.assign(document.createElement('canvas'),{width:144,height:72});const ctx=this.canvas.getContext('2d'),rng=mulberry32(9812);for(let tile=0;tile<24;tile++){const tx=(tile%8)*18+1,ty=Math.floor(tile/8)*18+1;const base=tile===22?BLOCKS[B.DIRT].color:tile===23?'#b99860':BLOCKS[tile]?.color||'#777e63';
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){let color=base,noise=(rng()-.5)*.19,alpha=1;
 if(tile===B.GRASS)noise=(rng()-.5)*.2;if(tile===22&&y<3+((x*13)%3))color=BLOCKS[B.GRASS].color;
 if(tile===B.LOG){noise+=(x%5===0?-.24:x%5===1?.06:0);if(y%9===x%7)noise-=.15;}
 if(tile===23){const ring=Math.max(Math.abs(x-7.5),Math.abs(y-7.5));noise+=Math.floor(ring)%3===0?-.2:.06;}
 if(tile===B.PLANKS||tile===B.WORKBENCH){if(y%4===0)noise-=.2;if(x===((Math.floor(y/4)*7)%16))noise-=.15;if(tile===B.WORKBENCH&&(x===3||x===12))noise-=.28;}
 if(tile===B.BRICKS||tile===B.COBBLE){if(y% (tile===B.BRICKS?5:7)===0||(x+Math.floor(y/5)*7)%9===0)noise-=.28;}
 if(tile===B.COAL&&rng()>.7)color='#35403a';if(tile===B.IRON&&rng()>.72)color='#b49372';
 if(tile===B.WATER){noise=(rng()-.5)*.065;alpha=.69;if(y%7===0&&x%5<3)noise+=.1;}
 if(tile===B.LEAVES){noise=(rng()-.5)*.3;if(rng()>.95)alpha=.2;}
 if(tile===B.GLASS){alpha=.22;if(x===0||y===0||x===15||y===15){color='#d5ece1';alpha=.6;}else if(x+y===12||x+y===13){color='#e1f0e8';alpha=.6;}}
 if(tile===B.TORCH){color=y<5?'#ffca62':'#805d35';if(y<2)color='#ffe6a2';}
 const c=new THREE.Color(color);c.multiplyScalar(1+noise).convertLinearToSRGB();ctx.fillStyle=`rgba(${Math.min(255,c.r*255)|0},${Math.min(255,c.g*255)|0},${Math.min(255,c.b*255)|0},${alpha})`;ctx.fillRect(tx+x,ty+y,1,1);}
 ctx.drawImage(this.canvas,tx,ty,16,1,tx,ty-1,16,1);ctx.drawImage(this.canvas,tx,ty+15,16,1,tx,ty+16,16,1);ctx.drawImage(this.canvas,tx,ty-1,1,18,tx-1,ty-1,1,18);ctx.drawImage(this.canvas,tx+15,ty-1,1,18,tx+16,ty-1,1,18);}
 this.texture=new THREE.CanvasTexture(this.canvas);this.texture.magFilter=THREE.NearestFilter;this.texture.minFilter=THREE.NearestFilter;this.texture.generateMipmaps=false;this.texture.colorSpace=THREE.SRGBColorSpace;
 this.materials={opaque:new THREE.MeshLambertMaterial({map:this.texture,vertexColors:true}),transparent:new THREE.MeshLambertMaterial({map:this.texture,vertexColors:true,transparent:true,alphaTest:.05,depthWrite:false})};}
}
