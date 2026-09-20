/** User preferences are cached independently from world state. */
export class Settings{
 /** Restore bounded preference values. */
 constructor(){let saved={};try{saved=JSON.parse(localStorage.getItem('wildwood.settings')||'{}');}catch{}this.sensitivity=Math.min(2,Math.max(.15,Number(saved.sensitivity)||.65));this.distance=Math.min(12,Math.max(3,Number(saved.distance)||8));this.fov=Math.min(100,Math.max(55,Number(saved.fov)||72));this.sound=saved.sound!==false;}
 /** Persist changed settings without interrupting play if storage is full. */
 save(){try{localStorage.setItem('wildwood.settings',JSON.stringify(this));}catch{}}
}
