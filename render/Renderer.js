import * as THREE from 'three';
/** Owns the WebGL canvas, camera, viewport, and shared selection geometry. */
export class Renderer{
 /** @param {HTMLElement} container */
 constructor(container){this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#b4d3d4');this.scene.fog=new THREE.Fog('#b4d3d4',70,135);this.camera=new THREE.PerspectiveCamera(72,1,.06,360);this.camera.rotation.order='YXZ';this.gl=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.gl.setPixelRatio(Math.min(window.devicePixelRatio,1.65));this.gl.outputColorSpace=THREE.SRGBColorSpace;this.gl.setClearColor('#b4d3d4');container.appendChild(this.gl.domElement);this.container=container;this.gl.domElement.id='world-canvas';this.gl.domElement.setAttribute('aria-label','Interactive Wildwood voxel world');
 const edges=new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006,1.006,1.006));this.highlight=new THREE.LineSegments(edges,new THREE.LineBasicMaterial({color:0xfff5d4,transparent:true,opacity:.8}));this.highlight.visible=false;this.scene.add(this.highlight);this.crack=new THREE.Mesh(new THREE.BoxGeometry(1.009,1.009,1.009),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,color:0x342c23,wireframe:true}));this.scene.add(this.crack);
 this.resize=()=>{const{width,height}=container.getBoundingClientRect();this.gl.setSize(width,height);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();};window.addEventListener('resize',this.resize);this.resize();}
 /** Highlight a DDA hit and update the discrete mining stage. */
 select(hit,progress=0){this.highlight.visible=!!hit;this.crack.visible=!!hit&&progress>0;if(hit){this.highlight.position.set(hit.x+.5,hit.y+.5,hit.z+.5);this.crack.position.copy(this.highlight.position);this.crack.material.opacity=Math.ceil(progress*5)/5*.65;this.highlight.material.color.set(progress>0?'#eac078':'#fff5d4');}}
 /** Draw the current scene. */
 draw(){this.gl.render(this.scene,this.camera);}
}
