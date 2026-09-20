import {Chunk} from './Chunk.js';
import {B,HEIGHT,chunkCoord,localCoord,voxelIndex} from './Blocks.js';
/** Streams worker-generated chunks and maintains only sparse player edits. */
export class World{
 /** @param {import('three').Scene} scene @param {object} materials @param {string} seed @param {object} diffs */
 constructor(scene,materials,seed,diffs={}){this.scene=scene;this.materials=materials;this.seed=seed;this.diffs=diffs;this.chunks=new Map();this.queue=[];this.uploads=[];this.workers=[];this.task=0;this.loaded=0;this.centerX=Infinity;this.centerZ=Infinity;this.distance=8;this.error='';this.onEdit=()=>{};
 // Workers are created on demand; the upper bound follows hardware concurrency.
 this.poolSize=Math.max(2,(navigator.hardwareConcurrency||4)-1);this.maxConcurrent=this.poolSize;
 }
 /** Lazily start a worker; large-core machines do not allocate idle workers. */
 createWorker(){const worker=new Worker(new URL('../workers/chunkWorker.js',import.meta.url),{type:'module'});const entry={worker,busy:false,key:null};worker.onmessage=({data})=>{entry.busy=false;const meta=new Int32Array(data[0]);const key=`${meta[1]},${meta[2]}`,chunk=this.chunks.get(key);if(meta[0]===-1){this.error='A chunk could not load. Move away and return to retry.';if(chunk){chunk.pending=false;this.chunks.delete(key);}return;}if(chunk){if(meta[3]!==chunk.revision){chunk.pending=false;this.enqueue(chunk,true);}else this.uploads.push(data);}this.pump();};worker.onerror=()=>{entry.busy=false;this.error='World worker unavailable. Reload to reconnect.';};this.workers.push(entry);return entry;}
 /** Schedule a chunk exactly once until its current job finishes. */
 enqueue(chunk,urgent=false){if(chunk.pending)return;chunk.pending=true;if(urgent)this.queue.unshift(chunk);else this.queue.push(chunk);}
 /** Dispatch compact, transferable edit buffers to idle workers. */
 pump(){while(this.queue.length){let entry=this.workers.find(w=>!w.busy);if(!entry&&this.workers.length<this.maxConcurrent)entry=this.createWorker();if(!entry)break;const chunk=this.queue.shift();if(!this.chunks.has(`${chunk.x},${chunk.z}`))continue;const edits=[];for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const cx=chunk.x+dx,cz=chunk.z+dz,changes=this.diffs[`${cx},${cz}`];if(!changes)continue;for(const[index,id]of Object.entries(changes)){const i=Number(index),x=i%16,z=Math.floor(i/16)%16,y=Math.floor(i/256);edits.push(cx*16+x,y,cz*16+z,id);}}
 const job=new Int32Array([++this.task,chunk.x,chunk.z,chunk.revision,...edits]);entry.busy=true;entry.key=`${chunk.x},${chunk.z}`;entry.worker.postMessage([this.seed,job.buffer],[job.buffer]);}}
 /** Stream near the player and cap GPU uploads by both count and elapsed time. */
 update(x,z,distance){const cx=chunkCoord(x),cz=chunkCoord(z);if(cx!==this.centerX||cz!==this.centerZ||distance!==this.distance){this.centerX=cx;this.centerZ=cz;this.distance=distance;const wanted=[];for(let dz=-distance;dz<=distance;dz++)for(let dx=-distance;dx<=distance;dx++){if(dx*dx+dz*dz>(distance+.5)**2)continue;wanted.push([cx+dx,cz+dz,dx*dx+dz*dz]);}wanted.sort((a,b)=>a[2]-b[2]);for(const[a,b]of wanted){const key=`${a},${b}`;if(!this.chunks.has(key)){const chunk=new Chunk(a,b);this.chunks.set(key,chunk);this.enqueue(chunk);}}for(const[key,chunk]of this.chunks){if(Math.hypot(chunk.x-cx,chunk.z-cz)>distance+2){chunk.dispose(this.scene);this.chunks.delete(key);}}this.queue=this.queue.filter(c=>this.chunks.get(`${c.x},${c.z}`)===c);this.queue.sort((a,b)=>(a.x-cx)**2+(a.z-cz)**2-((b.x-cx)**2+(b.z-cz)**2));}
 const start=performance.now();let uploads=0;while(this.uploads.length&&uploads<2&&performance.now()-start<4){const data=this.uploads.shift(),meta=new Int32Array(data[0]),chunk=this.chunks.get(`${meta[1]},${meta[2]}`);if(!chunk)continue;chunk.pending=false;if(chunk.revision!==meta[3]){this.enqueue(chunk,true);continue;}chunk.upload(this.scene,this.materials,data[1],data[2],data[3],data[4],meta[4]);this.loaded++;uploads++;}this.pump();}
 /** Unloaded terrain is a solid safety boundary, never a hole in collision. */
 getBlock(x,y,z){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);if(y<0)return B.BEDROCK;if(y>=HEIGHT)return B.AIR;const chunk=this.chunks.get(`${chunkCoord(x)},${chunkCoord(z)}`);return chunk?.blocks?chunk.blocks[voxelIndex(localCoord(x),y,localCoord(z))]:B.BEDROCK;}
 /** Report whether collision data for a world column is available. */
 isLoaded(x,z){return!!this.chunks.get(`${chunkCoord(x)},${chunkCoord(z)}`)?.blocks;}
 /** Apply an edit immediately to collision, then rebuild the affected lighting neighborhood. */
 setBlock(x,y,z,id){if(y<=0||y>=HEIGHT||!this.isLoaded(x,z))return false;const cx=chunkCoord(x),cz=chunkCoord(z),key=`${cx},${cz}`,chunk=this.chunks.get(key),index=voxelIndex(localCoord(x),y,localCoord(z));if(chunk.blocks[index]===B.BEDROCK)return false;chunk.blocks[index]=id;(this.diffs[key]??={})[index]=id;
 for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const neighbor=this.chunks.get(`${cx+dx},${cz+dz}`);if(neighbor){neighbor.revision++;this.enqueue(neighbor,true);}}this.onEdit();this.pump();return true;}
 /** Return the highest standable, dry surface in a loaded column. */
 surface(x,z){if(!this.isLoaded(x,z))return null;for(let y=HEIGHT-4;y>0;y--){const id=this.getBlock(x,y,z);if(id!==B.AIR&&id!==B.LEAVES&&id!==B.LOG&&id!==B.WATER&&this.getBlock(x,y+1,z)===B.AIR&&this.getBlock(x,y+2,z)===B.AIR)return y+1.01;}return null;}
 /** Current biome from the generated chunk. */
 biomeAt(x,z){return this.chunks.get(`${chunkCoord(x)},${chunkCoord(z)}`)?.biome||'Wilderness';}
 /** Release every worker and chunk, for world replacement. */
 dispose(){for(const{worker}of this.workers)worker.terminate();for(const chunk of this.chunks.values())chunk.dispose(this.scene);this.workers.length=0;this.chunks.clear();this.queue.length=0;this.uploads.length=0;}
}
