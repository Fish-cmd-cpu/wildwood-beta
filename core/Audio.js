/** Tiny synthesized soundscape, activated only after a user gesture. */
export class GameAudio{
 /** @param {import('./Settings.js').Settings} settings */
 constructor(settings){this.settings=settings;this.context=null;this.master=null;this.ambient=null;}
 /** Create a quiet, filtered wind loop without an audio asset. */
 start(){if(!this.context){const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;this.context=new Context();this.master=this.context.createGain();this.master.gain.value=this.settings.sound ? .2 : 0;this.master.connect(this.context.destination);const length=this.context.sampleRate*4,buffer=this.context.createBuffer(1,length,this.context.sampleRate),channel=buffer.getChannelData(0);let last=0;for(let i=0;i<length;i++){last=(last+(Math.random()*2-1)*.025)/1.025;channel[i]=last;}const source=this.context.createBufferSource();source.buffer=buffer;source.loop=true;const filter=this.context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;const gain=this.context.createGain();gain.gain.value=.25;source.connect(filter).connect(gain).connect(this.master);source.start();this.ambient=source;}this.context.resume().catch(()=>{});}
 /** Mute or restore all synthesized sound. */
 toggle(){this.settings.sound=!this.settings.sound;this.settings.save();if(this.master)this.master.gain.setTargetAtTime(this.settings.sound ? .2 : 0,this.context.currentTime,.1);return this.settings.sound;}
 /** Play a short material or interface cue. */
 play(kind='break'){if(!this.context||!this.settings.sound)return;const osc=this.context.createOscillator(),gain=this.context.createGain(),time=this.context.currentTime;osc.type=kind==='craft'?'sine':'triangle';const pitch=kind==='craft'?660:kind==='place'?180:kind==='eat'?450:kind==='step'?75:110;osc.frequency.setValueAtTime(pitch,time);osc.frequency.exponentialRampToValueAtTime(pitch*.5,time+.12);gain.gain.setValueAtTime(kind==='step' ? .07 : .23,time);gain.gain.exponentialRampToValueAtTime(.001,time+.16);osc.connect(gain).connect(this.master);osc.start(time);osc.stop(time+.17);osc.onended=()=>{osc.disconnect();gain.disconnect();};}
}
