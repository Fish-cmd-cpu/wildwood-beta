/** Local recovery cache using browser localStorage. */
export class SaveManager{
 /** Read the immediate browser cache before the renderer starts. */
 constructor(){this.key='wildwood.world.v1';this.cached=null;this.status='Ready to explore';this.onStatus=()=>{};try{const value=JSON.parse(localStorage.getItem(this.key)||'null');if(this.valid(value))this.cached=value;}catch{}}
 /** Validate the shape and finite coordinates before using a saved spawn. */
 valid(value){return value?.version===1&&typeof value.seed==='string'&&Array.isArray(value.inventory)&&value.inventory.length===36&&value.player&&Array.isArray(value.player.position)&&value.player.position.length===3&&value.player.position.every(Number.isFinite)&&value.diffs&&typeof value.diffs==='object';}
 /** Fetch the durable copy from browser storage. */
 async load(){return this.cached;}
 /** Cache immediately to browser localStorage. */
 save(snapshot){snapshot.version=1;snapshot.updatedAt=Date.now();this.cached=snapshot;const serialized=JSON.stringify(snapshot);try{localStorage.setItem(this.key,serialized);this.setStatus('Saved on this device');}catch{this.setStatus('Browser storage full');}}
 /** Notify the status bar without exposing internal service details. */
 setStatus(text){this.status=text;this.onStatus(text);}
}
