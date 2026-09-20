/** Shared block registry. IDs are stable save-file identifiers. */
export const B = Object.freeze({ AIR:0, BEDROCK:1, STONE:2, COBBLE:3, DIRT:4, GRASS:5, SAND:6, GRAVEL:7, WATER:8, LOG:9, LEAVES:10, PLANKS:11, GLASS:12, COAL:13, IRON:14, TORCH:15, BRICKS:16, SNOW:17, WORKBENCH:18, BERRY:19, PICKAXE:20, INGOT:21 });
const define = (name,color,hardness,options={}) => ({name,color,hardness,solid:true,transparent:false,placeable:true,...options});
export const BLOCKS = [
 define('Air','#ffffff',0,{solid:false,transparent:true,placeable:false}),
 define('Bedrock','#3d4041',Infinity), define('Stone','#929a99',1.8),
 define('Cobblestone','#777f7c',1.5), define('Dirt','#8b6544',.5),
 define('Grass block','#779446',.6), define('Sand','#d6c593',.45),
 define('Gravel','#989586',.6), define('Water','#548f9c',0,{solid:false,transparent:true}),
 define('Oak log','#76603a',1.1), define('Oak leaves','#4f803e',.25,{transparent:true}),
 define('Oak planks','#b99561',.8), define('Glass','#b7d6cc',.3,{transparent:true}),
 define('Coal ore','#7d8581',2.1), define('Iron ore','#9a8a7e',2.6),
 define('Torch','#e8af56',.1,{solid:false,transparent:true,emission:14}),
 define('Stone bricks','#999e93',1.8), define('Snow','#e6e9de',.4),
 define('Workbench','#a07a4c',1), define('Wild berries','#b85a4d',0,{solid:false,placeable:false,food:5}),
 define('Stone pickaxe','#9eaa9a',0,{solid:false,placeable:false,tool:3.5}),
 define('Iron ingot','#c9c7b8',0,{solid:false,placeable:false})
];
export const CHUNK=16, HEIGHT=128, SEA=62;
/** Return an offset in a Y-major voxel buffer. */
export const voxelIndex=(x,y,z,width=16)=>(y*width+z)*width+x;
/** Floor division remains correct west and south of the origin. */
export const chunkCoord=n=>Math.floor(n/CHUNK);
/** Return a local coordinate in [0, 15], including negative world coordinates. */
export const localCoord=n=>((n%16)+16)%16;
/** True for light-blocking cubes. */
export const occludes=id=>id!==0 && !BLOCKS[id].transparent;
/** Select a 16px atlas tile for a block and face. */
export function tileFor(id,face){ if(id===B.GRASS)return face===2?5:face===3?4:22; if(id===B.LOG)return face===2||face===3?23:9; return id; }
