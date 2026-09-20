import {B,BLOCKS,HEIGHT,tileFor,occludes,voxelIndex} from '../world/Blocks.js';
// Counter-clockwise faces viewed from outside: +X, -X, +Y, -Y, +Z, -Z.
const FACES=[
 {n:[1,0,0],u:[0,0,-1],v:[0,1,0]}, {n:[-1,0,0],u:[0,0,1],v:[0,1,0]},
 {n:[0,1,0],u:[1,0,0],v:[0,0,-1]}, {n:[0,-1,0],u:[1,0,0],v:[0,0,1]},
 {n:[0,0,1],u:[1,0,0],v:[0,1,0]}, {n:[0,0,-1],u:[-1,0,0],v:[0,1,0]}
];
const CORNERS=[[-1,-1],[1,-1],[1,1],[-1,1]],ORDER=[0,1,2,0,2,3];
/** Build only exposed faces, with four-corner ambient occlusion and light. */
export function meshChunk(data,width,pad,lights){const opaque=[],transparent=[];const sample=(x,y,z)=>y<0?B.BEDROCK:y>=HEIGHT?0:x<0||z<0||x>=width||z>=width?0:data[voxelIndex(x,y,z,width)];const lit=(field,x,y,z)=>y>=HEIGHT?15:y<0||x<0||z<0||x>=width||z>=width?0:field[voxelIndex(x,y,z,width)];
 for(let y=0;y<HEIGHT;y++)for(let z=pad;z<pad+16;z++)for(let x=pad;x<pad+16;x++){const id=sample(x,y,z);if(!id)continue;const definition=BLOCKS[id],out=definition.transparent?transparent:opaque;
 for(let f=0;f<6;f++){const{n,u,v}=FACES[f],nx=x+n[0],ny=y+n[1],nz=z+n[2],adj=sample(nx,ny,nz);if(id!==B.TORCH&&(occludes(adj)||(adj===id&&definition.transparent)))continue;
 const tile=tileFor(id,f),tx=tile%8,ty=Math.floor(tile/8);const vertices=[];for(let k=0;k<4;k++){const[a,b]=CORNERS[k],ux=u[0]*a,uy=u[1]*a,uz=u[2]*a,vx=v[0]*b,vy=v[1]*b,vz=v[2]*b;
 const s1=+occludes(sample(nx+ux,ny+uy,nz+uz)),s2=+occludes(sample(nx+vx,ny+vy,nz+vz)),corner=+occludes(sample(nx+ux+vx,ny+uy+vy,nz+uz+vz));const ao=s1&&s2 ? .46 : 1-(s1+s2+corner)*.16;
 const sky=Math.max(lit(lights.sky,nx,ny,nz),lit(lights.sky,x,y,z))/15;const torch=Math.max(lit(lights.block,nx,ny,nz),lit(lights.block,x,y,z))/14;const light=Math.max(.13,sky*.97,torch*.96)*ao;let px=x-pad+.5+n[0]*.5+(ux+vx)*.5,py=y+.5+n[1]*.5+(uy+vy)*.5,pz=z-pad+.5+n[2]*.5+(uz+vz)*.5;
 if(id===B.TORCH){px=x-pad+.5+(px-x+pad-.5)*.19;pz=z-pad+.5+(pz-z+pad-.5)*.19;py=y+(py-y)*.72;}if(id===B.WATER&&sample(x,y+1,z)!==B.WATER&&py===y+1)py-=.13;
 const shade=[.88,.78,1,.61,.91,.75][f];const red=light*shade,green=red*(1-torch*.16*(1-sky)),blue=red*(1-torch*.4*(1-sky));vertices.push([px,py,pz,n[0],n[1],n[2],(tx*18+1.5+(a+1)*7.5)/144,1-(ty*18+1.5+(1-b)*7.5)/72,red,green,blue]);}
 const order=(vertices[0][8]+vertices[2][8]>vertices[1][8]+vertices[3][8])?[0,1,3,1,2,3]:ORDER;for(const k of order)out.push(...vertices[k]);}}
 return{opaque:new Float32Array(opaque),transparent:new Float32Array(transparent)};}
