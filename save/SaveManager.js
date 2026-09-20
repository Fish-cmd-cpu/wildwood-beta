/** Local recovery cache backed by the site's anonymous Netlify Database slot. */
export class SaveManager{
 /** Read the immediate browser cache before the renderer starts. */
 constructor(){this.key='wildwood.world.v1';this.cached=null;this.status='Ready to explore';this.busy=false;this.pending=null;this.hasCloud=!['localhost','127.0.0.1',''].includes(location.hostname);try{const value=JSON.parse(localStorage.getItem(this.key)||'null');if(this.valid(value))this.cached=value;}catch{}this.onStatus=()=>{};}
 /** Validate the shape and finite coordinates before using a saved spawn. */
 valid(value){return value?.version===1&&typeof value.seed==='string'&&Array.isArray(value.inventory)&&value.inventory.length===36&&value.player&&Array.isArray(value.player.position)&&value.player.position.length===3&&value.player.position.every(Number.isFinite)&&value.diffs&&typeof value.diffs==='object';}
 /** Fetch the durable copy, preferring the more recent browser recovery cache. */
 async load(){if(!this.hasCloud)return this.cached;try{const response=await fetch('/api/world',{signal:AbortSignal.timeout(3500)});if(response.ok){const{save}=await response.json();if(this.valid(save)&&(!this.cached||save.updatedAt>this.cached.updatedAt)){this.cached=save;try{localStorage.setItem(this.key,JSON.stringify(save));}catch{}}}}catch{}return this.cached;}
 /** Cache immediately, then serialize cloud writes to avoid stale overwrite races. */
 save(snapshot){snapshot.version=1;snapshot.updatedAt=Date.now();this.cached=snapshot;const serialized=JSON.stringify(snapshot);try{localStorage.setItem(this.key,serialized);this.setStatus('Saved on this device');}catch{this.setStatus('Browser storage full · syncing');}if(this.hasCloud){this.pending=serialized;this.flush();}}
 /** Flush the latest pending snapshot and coalesce intermediate saves. */
 async flush(){if(this.busy||!this.pending)return;this.busy=true;const body=this.pending;this.pending=null;try{const response=await fetch('/api/world',{method:'PUT',headers:{'Content-Type':'application/json'},body,keepalive:body.length<60000});if(!response.ok)throw new Error('Save unavailable');this.setStatus('World saved');}catch{this.setStatus('Saved on this device · cloud offline');}finally{this.busy=false;if(this.pending)this.flush();}}
 /** Notify the status bar without exposing internal service details. */
 setStatus(text){this.status=text;this.onStatus(text);}
}
