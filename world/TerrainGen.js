import {Noise,seedHash} from './Noise.js';
import {B,HEIGHT,SEA,voxelIndex} from './Blocks.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class TerrainGen{
 /** Set the seed. Terrain generation runs exclusively in workers. */
 constructor(seed){this.noise=new Noise(seedHash(seed));}
 /** Describe a column without allocating voxel geometry. */
 column(x,z){const n=this.noise;const continent=n.fbm(x*.0035,z*.0035);const erosion=n.fbm(x*.017+130,z*.017-70,3);const temp=n.n2(x*.002+400,z*.002-300);const humid=n.n2(x*.004-200,z*.004+150);const ridge=Math.max(0,n.fbm(x*.007-77,z*.007+21)+.14);let h=67+continent*17+erosion*7+ridge*40;
 const river=Math.abs(z+18-Math.sin(x*.012)*15-n.n2(x*.004+17,z*.004)*22);const riverMix=clamp((river-7)/11,0,1);h=58+(h-58)*riverMix;
 const clearing=Math.hypot(x-8,z-26),blend=clamp((clearing-6)/21,0,1);h=68+(h-68)*blend;
 h=clamp(Math.floor(h),34,112);const biome=h>85?'Highlands':h<64?'Riverbank':clearing<42?'Oak forest':temp>.38&&humid<.15?'Desert':humid>-.24?'Oak forest':'Meadow';return{height:h,biome,river,humid};}
 /** Generate a padded chunk, including trees originating across its boundaries. */
 generate(cx,cz,pad=1){const width=16+pad*2, data=new Uint8Array(width*width*HEIGHT);const ox=cx*16-pad,oz=cz*16-pad;let count=0;const n=this.noise;
 for(let z=0;z<width;z++)for(let x=0;x<width;x++){const wx=ox+x,wz=oz+z,c=this.column(wx,wz),h=c.height;const desert=c.biome==='Desert',beach=h<64;for(let y=0;y<=Math.max(h,SEA);y++){let id=B.AIR;if(y===0)id=B.BEDROCK;else if(y>h)id=y<=SEA?B.WATER:B.AIR;else{
 id=y===h?(h>100?B.SNOW:desert||beach?B.SAND:h>88?B.STONE:B.GRASS):y>h-4?(desert||beach?B.SAND:B.DIRT):B.STONE;
 if(y>4&&y<h-3){const cave=n.n3(wx*.061,y*.078,wz*.061);const tunnel=n.n3(wx*.039+73,y*.08-32,wz*.039);if(cave>.58||(Math.abs(tunnel)<.057&&y<45))id=B.AIR;else if(id===B.STONE&&y<57){const ore=n.n3(wx*.24+80,y*.28,wz*.24);if(ore>.59)id=B.COAL;else if(y<43&&ore<-.67)id=B.IRON;else if(y<55&&n.hash(wx,y,wz)>.985)id=B.GRAVEL;}}
 if(y>h-5&&y>70&&n.n3(wx*.075+250,y*.12,wz*.075)>.69)id=B.AIR;
 }data[voxelIndex(x,y,z,width)]=id;if(id)count++;}}
 for(let wz=oz-2;wz<oz+width+2;wz++)for(let wx=ox-2;wx<ox+width+2;wx++){const chance=n.hash(wx,999,wz);if(chance<.976||Math.hypot(wx-8,wz-26)<5)continue;const c=this.column(wx,wz);if(c.height<65||c.height>87||c.biome==='Desert'||c.river<15)continue;if(c.biome==='Meadow'&&chance<.996)continue;const trunk=4+Math.floor(n.hash(wx,17,wz)*3),top=c.height+trunk;
 for(let y=top-2;y<=top+1;y++)for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){if(y===top+1&&Math.abs(dx)+Math.abs(dz)>1)continue;if(Math.abs(dx)===2&&Math.abs(dz)===2&&(y===top-2||n.hash(wx+dx,y,wz+dz)>.45))continue;const lx=wx+dx-ox,lz=wz+dz-oz;if(lx<0||lz<0||lx>=width||lz>=width)continue;const index=voxelIndex(lx,y,lz,width);if(data[index]===B.AIR)data[index]=B.LEAVES;}
 for(let y=c.height+1;y<=top;y++){const lx=wx-ox,lz=wz-oz;if(lx>=0&&lz>=0&&lx<width&&lz<width)data[voxelIndex(lx,y,lz,width)]=B.LOG;}}
 return{data,width,pad,count,biome:this.column(cx*16+8,cz*16+8).biome};}
}
