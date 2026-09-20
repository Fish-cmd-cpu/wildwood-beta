/** Deterministic 32-bit seed derived from a human-readable world name. */
export function seedHash(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
/** Mulberry32 PRNG, returning values in [0,1). */
export function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const fade=t=>t*t*t*(t*(t*6-15)+10),mix=(a,b,t)=>a+(b-a)*t;
export class Noise{
 /** Create a seeded lattice noise generator. @param {number} seed */
 constructor(seed){this.seed=seed;const rng=mulberry32(seed);this.salt=(rng()*0xffffffff)|0;}
 /** Hash a lattice point without dependence on generation order. */
 hash(x,y,z=0){let h=this.salt^Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,1442695041);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;}
 /** Smooth two-dimensional value noise in [-1,1]. */
 n2(x,z){const a=Math.floor(x),b=Math.floor(z),u=fade(x-a),v=fade(z-b);return mix(mix(this.hash(a,b),this.hash(a+1,b),u),mix(this.hash(a,b+1),this.hash(a+1,b+1),u),v)*2-1;}
 /** Smooth three-dimensional value noise in [-1,1]. */
 n3(x,y,z){const a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),u=fade(x-a),v=fade(y-b),w=fade(z-c);return mix(mix(mix(this.hash(a,b,c),this.hash(a+1,b,c),u),mix(this.hash(a,b+1,c),this.hash(a+1,b+1,c),u),v),mix(mix(this.hash(a,b,c+1),this.hash(a+1,b,c+1),u),mix(this.hash(a,b+1,c+1),this.hash(a+1,b+1,c+1),u),v),w)*2-1;}
 /** Fractal terrain noise. */
 fbm(x,z,octaves=4){let sum=0,amp=.57;for(let i=0;i<octaves;i++){sum+=this.n2(x,z)*amp;x=x*2.03+17;z=z*2.03-9;amp*=.48;}return sum;}
}
