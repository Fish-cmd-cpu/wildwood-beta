import {B,BLOCKS} from '../world/Blocks.js';
/** Small asset-free isometric inventory illustrations. */
export function blockIcon(id){const color=BLOCKS[id]?.color||'#819365';let art='';if(id===B.PICKAXE)art='<path d="m10 32 14-22 4 3-14 22z" fill="#927443"/><path d="m8 8 5-5 15 8 4 10-5-1-4-7-11-5-3 3z" fill="#959f90"/><path d="m12 3 16 8-3 3-15-7z" fill="#bdc6b0"/>';else if(id===B.BERRY)art='<path d="m17 12-2-8 7 3-4 6 8-2-5 7z" fill="#718e4a"/><path d="m7 15 8-3 8 4 3 9-5 9-12-2-5-9z" fill="#a85247"/><path d="m8 16 5-2 2 5-6 4z" fill="#c87a61"/>';else if(id===B.TORCH)art='<path d="m13 14 9 1-3 22-7-2z" fill="#896d42"/><path d="m14 14 2 2-2 18-2-1z" fill="#c29e60"/><path d="m13 16-4-7 7-9 7 6-1 11z" fill="#e5af56"/><path d="m14 12-1-5 4-5 3 6-2 5z" fill="#fff0ac"/>';else if(id===B.INGOT)art='<path d="m8 15 18-5 6 13-18 9-12-7z" fill="#b2b7a7"/><path d="m8 15 18-5 6 13-17 5z" fill="#d5d9c8"/><path d="m15 28 17-5v5l-17 9z" fill="#959c8d"/>';else{
 const top=id===B.LOG?'#bd9c61':id===B.GRASS?'#8ca760':color,side=id===B.GRASS?'#927345':color;
 art=`<path d="m18 2 16 9-16 9-16-9z" fill="${top}"/><path d="m2 11 16 9v18L2 29z" fill="${side}"/><path d="m18 20 16-9v18l-16 9z" fill="${side}"/><path d="m18 20 16-9v18l-16 9z" fill="#263d29" opacity=".23"/><path d="m2 11 16 9v18L2 29z" fill="#263229" opacity=".08"/>`;
 if(id===B.GRASS)art+='<path d="m2 11 16 9v5l-4-2-3 1v-4l-4-1-2-4-3-1zm16 9 16-9v5l-3 2v-2l-5 4v3l-5 1-3 3z" fill="#708d49"/>';
 for(let i=0;i<7;i++){const x=4+(i*7%12),y=15+(i*3%12);art+=`<path d="m${x} ${y} 3 1.7v2l-3-1.7z" fill="${i%2?'#f7eed0':'#263b26'}" opacity=".13"/>`;}
 if(id===B.LOG)art+='<path d="m6 16 2 1v13l-2-1zm6 4 2 1v13l-2-1m12-2 2-1V18l-2 1z" fill="#3c3927" opacity=".4"/>';if(id===B.GLASS)art+='<path d="m3 12 14 8v16L3 28zm16 8 14-8v16l-14 8z" fill="none" stroke="#e8f6e5" stroke-width="1.5"/><path d="m5 17 9 12m8-4 6-9" stroke="#e8f6e5" stroke-width="2"/>';}
 return`<svg class="block-icon" viewBox="0 0 36 40" aria-hidden="true">${art}</svg>`;}
export const RECIPES=[
 {name:'Oak planks',out:B.PLANKS,amount:4,needs:[[B.LOG,1]]},
 {name:'Workbench',out:B.WORKBENCH,amount:1,needs:[[B.PLANKS,4]]},
 {name:'Torches',out:B.TORCH,amount:4,needs:[[B.LOG,1],[B.COAL,1]]},
 {name:'Stone pickaxe',out:B.PICKAXE,amount:1,needs:[[B.COBBLE,3],[B.PLANKS,2]],bench:true},
 {name:'Glass',out:B.GLASS,amount:4,needs:[[B.SAND,4],[B.COAL,1]],bench:true},
 {name:'Stone bricks',out:B.BRICKS,amount:4,needs:[[B.COBBLE,4]],bench:true},
 {name:'Iron ingot',out:B.INGOT,amount:1,needs:[[B.IRON,1],[B.COAL,1]],bench:true}
];
/** Stack storage, recipe transactions, drag-and-drop, and DOM slot rendering. */
export class Inventory{
 /** @param {Array<{id:number,count:number}|null>|null} saved */
 constructor(saved=null){this.slots=Array.from({length:36},(_,i)=>{const s=saved?.[i];return s&&Number.isInteger(s.id)&&s.id>0&&s.id<BLOCKS.length&&s.count>0?{id:s.id,count:Math.min(64,Math.floor(s.count))}:null;});if(!saved){[ [B.LOG,8],[B.DIRT,24],[B.COBBLE,16],[B.PLANKS,16],[B.LEAVES,12],[B.GLASS,8],[B.TORCH,8],[B.PICKAXE,1],[B.BERRY,6] ].forEach(([id,count],i)=>this.slots[i]={id,count});this.slots[9]={id:B.COAL,count:4};this.slots[10]={id:B.SAND,count:12};}this.selected=0;this.creative=false;this.held=null;this.onChange=()=>{};this.onCraft=()=>{};this.toast=()=>{};this.nearBench=()=>false;this.render();}
 /** Current hotbar item. */
 get current(){return this.slots[this.selected];}
 /** Select a hotbar slot, wrapping for wheel input. */
 select(index){this.selected=(index+9)%9;this.render();}
 /** Count an item across all stacks. */
 count(id){return this.slots.reduce((n,s)=>n+(s?.id===id?s.count:0),0);}
 /** Atomically add a stack; false means nothing was changed. */
 add(id,count=1){const max=id===B.PICKAXE?1:64;const capacity=this.slots.reduce((n,s)=>n+(s===null?max:s.id===id?max-s.count:0),0);if(capacity<count)return false;for(let i=0;i<36&&count;i++){const s=this.slots[i];if(s?.id===id&&s.count<max){const n=Math.min(count,max-s.count);s.count+=n;count-=n;}}for(let i=0;i<36&&count;i++)if(!this.slots[i]){const n=Math.min(count,max);this.slots[i]={id,count:n};count-=n;}this.changed();return true;}
 /** Remove a known quantity. */
 remove(id,count){if(this.count(id)<count)return false;for(let i=0;i<36&&count;i++){const s=this.slots[i];if(s?.id===id){const n=Math.min(count,s.count);s.count-=n;count-=n;if(!s.count)this.slots[i]=null;}}return true;}
 /** Consume the selected item only in survival mode. */
 consume(){if(this.creative)return;const item=this.current;if(item&&--item.count<=0)this.slots[this.selected]=null;this.changed();}
 /** Select an existing block or materialize a creative stack. */
 pick(id){let index=this.slots.findIndex(s=>s?.id===id);if(index<0&&this.creative){this.slots[this.selected]={id,count:64};this.changed();return;}if(index<0){this.toast('Gather this block to add it to your satchel.');return;}if(index<9)this.select(index);else{[this.slots[index],this.slots[this.selected]]=[this.slots[this.selected],this.slots[index]];this.changed();}}
 /** Check ingredients and access to an owned or nearby workbench. */
 canCraft(recipe){return this.creative||recipe.needs.every(([id,n])=>this.count(id)>=n)&&(!recipe.bench||this.count(B.WORKBENCH)>0||this.nearBench());}
 /** Craft atomically, restoring all ingredients if the output cannot fit. */
 craft(recipe){if(!this.canCraft(recipe))return;const before=this.slots.map(s=>s?{...s}:null);if(!this.creative)for(const[id,n]of recipe.needs)this.remove(id,n);if(!this.add(recipe.out,recipe.amount)){this.slots=before;this.toast('Make a little room in your satchel first.');this.render();return;}this.onCraft(recipe);this.toast(`Made ${recipe.amount} ${recipe.name.toLowerCase()}`);this.changed();}
 /** Notify persistence and update all linked slot views. */
 changed(){this.render();this.onChange();}
 /** Create an accessible, draggable stack button. */
 slotElement(index,hotbar=false){const item=this.slots[index],button=document.createElement('button');button.className=`slot${index===this.selected&&index<9?' selected':''}`;button.draggable=!!item;button.dataset.index=String(index);button.title=item?`${BLOCKS[item.id].name} · ${item.count}`:'Empty slot';button.setAttribute('aria-label',button.title);button.innerHTML=`${index<9?`<span class="slot-number">${index+1}</span>`:''}${item?blockIcon(item.id)+`<span class="slot-count">${this.creative?'∞':item.count}</span>`:''}`;
 button.onclick=()=>{if(hotbar){this.select(index);return;}if(this.held===null){this.held=index;button.classList.add('drag-over');document.getElementById('inventory-description').textContent=item?`${BLOCKS[item.id].name} selected. Click another slot to swap.`:'Choose a filled slot to move an item.';}else{[this.slots[index],this.slots[this.held]]=[this.slots[this.held],this.slots[index]];this.held=null;this.changed();}};button.ondragstart=e=>{e.dataTransfer.setData('text/plain',String(index));e.dataTransfer.effectAllowed='move';this.held=null;};button.ondragover=e=>{e.preventDefault();button.classList.add('drag-over');};button.ondragleave=()=>button.classList.remove('drag-over');button.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/plain');if(!/^\d+$/.test(raw))return;const from=Number(raw);if(from<0||from>=36)return;[this.slots[from],this.slots[index]]=[this.slots[index],this.slots[from]];this.changed();};return button;}
 /** Render DOM inventory only when selection or contents change. */
 render(){for(const[id,start,end,hotbar]of[['hotbar',0,9,true],['inventory-grid',9,36,false],['inventory-hotbar',0,9,false]]){const container=document.getElementById(id);container.replaceChildren(...Array.from({length:end-start},(_,i)=>this.slotElement(start+i,hotbar)));}document.getElementById('selected-name').textContent=this.current?BLOCKS[this.current.id].name:'Empty hand';const recipes=document.getElementById('recipes');recipes.replaceChildren(...RECIPES.map(r=>{const button=document.createElement('button');button.className='recipe';button.disabled=!this.canCraft(r);const needs=r.needs.map(([id,n])=>`${n} ${BLOCKS[id].name.toLowerCase()}`).join(' + ');button.title=`${needs}${r.bench?' · workbench required':''}`;button.innerHTML=`${blockIcon(r.out)}<div><strong>${r.name} <span>×${r.amount}</span></strong><small>${needs}${r.bench?' · bench':''}</small></div><span>+</span>`;button.onclick=()=>this.craft(r);return button;}));document.getElementById('creative-catalog').hidden=!this.creative;if(this.creative){document.getElementById('catalog-grid').replaceChildren(...BLOCKS.map((b,id)=>({b,id})).filter(({b,id})=>id>1&&(b.placeable||id===B.BERRY)).map(({b,id})=>{const button=document.createElement('button');button.className='slot';button.title=b.name;button.setAttribute('aria-label',`Add ${b.name}`);button.innerHTML=blockIcon(id);button.onclick=()=>{this.slots[this.selected]={id,count:64};this.changed();};return button;}));}}
}
