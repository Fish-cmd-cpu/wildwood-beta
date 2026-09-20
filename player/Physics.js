import {BLOCKS} from '../world/Blocks.js';
export const HALF=.3,PLAYER_HEIGHT=1.8;
/** Check a proposed solid block against a player's exact AABB. */
export function overlapsPlayer(x,y,z,position,height=PLAYER_HEIGHT){return position.x+HALF>x&&position.x-HALF<x+1&&position.y+height>y&&position.y<y+1&&position.z+HALF>z&&position.z-HALF<z+1;}
/** Swept, per-axis voxel collision. High velocities never tunnel across blocks. */
export function sweep(position,velocity,dt,world,height=PLAYER_HEIGHT){let grounded=false;const hit={x:false,y:false,z:false};for(const axis of['x','z','y']){let delta=velocity[axis]*dt;if(!delta)continue;const min={x:position.x-HALF,y:position.y,z:position.z-HALF},max={x:position.x+HALF,y:position.y+height,z:position.z+HALF};const lo={...min},hi={...max};if(delta>0)hi[axis]+=delta;else lo[axis]+=delta;
 for(let y=Math.floor(lo.y+.00001);y<=Math.floor(hi.y-.00001);y++)for(let z=Math.floor(lo.z+.00001);z<=Math.floor(hi.z-.00001);z++)for(let x=Math.floor(lo.x+.00001);x<=Math.floor(hi.x-.00001);x++){if(!BLOCKS[world.getBlock(x,y,z)].solid)continue;const cell={x,y,z};const others=axis==='x'?['y','z']:axis==='y'?['x','z']:['x','y'];if(others.some(a=>max[a]<=cell[a]+.00001||min[a]>=cell[a]+1-.00001))continue;const distance=delta>0?cell[axis]-max[axis]:cell[axis]+1-min[axis];if(delta>0&&distance>=-.0001&&distance<delta){delta=Math.max(0,distance);hit[axis]=true;}else if(delta<0&&distance<=.0001&&distance>delta){delta=Math.min(0,distance);hit[axis]=true;}}
 position[axis]+=delta;if(hit[axis]){if(axis==='y'&&velocity.y<0)grounded=true;velocity[axis]=0;}}
 return{grounded,hit};}
/** True when an entire player volume is clear and ready. */
export function canStand(position,world,height=PLAYER_HEIGHT){if(!world.isLoaded(position.x,position.z))return false;for(let y=Math.floor(position.y+.001);y<=Math.floor(position.y+height-.001);y++)for(let z=Math.floor(position.z-HALF+.001);z<=Math.floor(position.z+HALF-.001);z++)for(let x=Math.floor(position.x-HALF+.001);x<=Math.floor(position.x+HALF-.001);x++)if(BLOCKS[world.getBlock(x,y,z)].solid)return false;return true;}
