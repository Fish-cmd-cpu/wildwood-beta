import {TerrainGen} from '../world/TerrainGen.js';
import {computeLighting} from '../world/Lighting.js';
import {meshChunk} from '../render/ChunkMesher.js';
import {HEIGHT,voxelIndex,B} from '../world/Blocks.js';
let generator=null,activeSeed='';
/** Packed protocol: [task, cx, cz, revision, ...world-coordinate edit quadruples]. */
self.onmessage=({data:message})=>{const [seed,buffer]=message,job=new Int32Array(buffer),[task,cx,cz,revision]=job;
 try{if(seed!==activeSeed){activeSeed=seed;generator=new TerrainGen(seed);}let pad=1;for(let i=4;i<job.length;i+=4)if(job[i+3]===B.TORCH&&job[i]>=cx*16-14&&job[i]<cx*16+30&&job[i+2]>=cz*16-14&&job[i+2]<cz*16+30){pad=14;break;}
 const terrain=generator.generate(cx,cz,pad),{data,width}=terrain;for(let i=4;i<job.length;i+=4){const x=job[i]-cx*16+pad,y=job[i+1],z=job[i+2]-cz*16+pad;if(x>=0&&x<width&&z>=0&&z<width&&y>=0&&y<HEIGHT)data[voxelIndex(x,y,z,width)]=job[i+3];}
 const lights=computeLighting(data,width),mesh=meshChunk(data,width,pad,lights),blocks=new Uint8Array(16*16*HEIGHT);for(let y=0;y<HEIGHT;y++)for(let z=0;z<16;z++)blocks.set(data.subarray(voxelIndex(pad,y,z+pad,width),voxelIndex(pad,y,z+pad,width)+16),voxelIndex(0,y,z));
 const meta=new Int32Array([task,cx,cz,revision,terrain.count]);self.postMessage([meta.buffer,blocks.buffer,mesh.opaque.buffer,mesh.transparent.buffer,terrain.biome],[meta.buffer,blocks.buffer,mesh.opaque.buffer,mesh.transparent.buffer]);
 }catch(error){const meta=new Int32Array([-1,cx,cz,revision]);self.postMessage([meta.buffer,String(error.message)],[meta.buffer]);}};
