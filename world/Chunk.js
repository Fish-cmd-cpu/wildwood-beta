import * as THREE from 'three';
/** Owns voxel data and exactly two GPU meshes for one chunk. */
export class Chunk{
 /** @param {number} x @param {number} z */
 constructor(x,z){this.x=x;this.z=z;this.blocks=null;this.opaque=null;this.transparent=null;this.revision=0;this.pending=false;this.biome='Wilderness';this.count=0;}
 /** Upload interleaved worker geometry. Replaced GPU buffers are disposed. */
 upload(scene,materials,blocks,opaque,transparent,biome,count){this.blocks=new Uint8Array(blocks);this.biome=biome;this.count=count;for(const[name,buffer,material]of[['opaque',opaque,materials.opaque],['transparent',transparent,materials.transparent]]){if(this[name]){scene.remove(this[name]);this[name].geometry.dispose();this[name]=null;}if(!buffer.byteLength)continue;const geometry=new THREE.BufferGeometry(),interleaved=new THREE.InterleavedBuffer(new Float32Array(buffer),11);geometry.setAttribute('position',new THREE.InterleavedBufferAttribute(interleaved,3,0));geometry.setAttribute('normal',new THREE.InterleavedBufferAttribute(interleaved,3,3));geometry.setAttribute('uv',new THREE.InterleavedBufferAttribute(interleaved,2,6));geometry.setAttribute('color',new THREE.InterleavedBufferAttribute(interleaved,3,8));geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,material);mesh.position.set(this.x*16,0,this.z*16);mesh.matrixAutoUpdate=false;mesh.updateMatrix();mesh.frustumCulled=true;scene.add(mesh);this[name]=mesh;}}
 /** Release all GPU resources when the chunk leaves the retention radius. */
 dispose(scene){for(const mesh of[this.opaque,this.transparent])if(mesh){scene.remove(mesh);mesh.geometry.dispose();}this.opaque=null;this.transparent=null;this.blocks=null;}
}
