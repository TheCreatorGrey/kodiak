import * as THREE from 'three';

//export const defaultWorld = "eyJwYXJ0cyI6W3sicG9zaXRpb24iOlszLjEyNSwxLjg3NSwwLjVdLCJzY2FsZSI6WzAuMjUsMy4yNSw1LjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDAuMjUsMC41XSwic2NhbGUiOls2LDAuNSw1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZV8yIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMC42MjUsMC41XSwic2NhbGUiOls2LDAuMjUsNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6InJhd19wbGFua193YWxsIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDEwLDEwXX0seyJwb3NpdGlvbiI6WzIuODc1LDIuMTI1LDAuNV0sInNjYWxlIjpbMC4yNSwyLjc1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJlaWdlX3dhbGxfMDAxIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzIwMCwyMDAsMjAwXX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwzLjI1LDIuODc1XSwic2NhbGUiOlsxLjI1LDAuNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCw0LjM3NSwwLjVdLCJzY2FsZSI6WzUuNSwwLjI1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImdyZXlfcm9vZl90aWxlc18wMiIsInR5cGUiOiJjdWJlIiwiY29sb3IiOls1MCwwLDBdfSx7InBvc2l0aW9uIjpbMC44NzUsMi4xMjUsMi44NzVdLCJzY2FsZSI6WzQuMjUsMi43NSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCwyLjEyNSwtMS44NzVdLCJzY2FsZSI6WzYsMi43NSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTIuNzUsMi4xMjUsMi44NzVdLCJzY2FsZSI6WzAuNSwyLjc1LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJiZWlnZV93YWxsXzAwMSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyMDAsMjAwLDIwMF19LHsicG9zaXRpb24iOlstMi44NzUsMi4xMjUsMC41XSwic2NhbGUiOlswLjI1LDIuNzUsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTMuMTI1LDEuODc1LDAuNV0sInNjYWxlIjpbMC4yNSwzLjI1LDUuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMS44NzUsLTIuMTI1XSwic2NhbGUiOls2LDMuMjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAuODc1LDEuODc1LDMuMTI1XSwic2NhbGUiOls0LjI1LDMuMjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0yLjc1LDEuODc1LDMuMTI1XSwic2NhbGUiOlswLjUsMy4yNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJpY2tfd2FsbF8wMDUiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbLTEuODc1LDMuMjUsMy4xMjVdLCJzY2FsZSI6WzEuMjUsMC41LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstMS44NzUsMC4xMjUsMy42MjVdLCJzY2FsZSI6WzEuMjUsMC4yNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDMuMzc1LDAuNV0sInNjYWxlIjpbNS41LDAuMjUsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbMCwzLjYyNSwwLjVdLCJzY2FsZSI6WzcsMC4yNSw2XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZ3JleV9yb29mX3RpbGVzXzAyIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDAsMF19LHsicG9zaXRpb24iOlswLDMuODc1LDAuNV0sInNjYWxlIjpbNi41LDAuMjUsNS41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZ3JleV9yb29mX3RpbGVzXzAyIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDAsMF19LHsicG9zaXRpb24iOlswLDQuMTI1LDAuNV0sInNjYWxlIjpbNiwwLjI1LDVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJncmV5X3Jvb2ZfdGlsZXNfMDIiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbNTAsMCwwXX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwwLjM3NSwzLjEyNV0sInNjYWxlIjpbMS4yNSwwLjc1LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicnVzaGVkX2NvbmNyZXRlIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwwLjI1LDMuMzc1XSwic2NhbGUiOlsxLjI1LDAuNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDMuMTI1LDAuNV0sInNjYWxlIjpbMSwwLjI1LDFdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJkb3VibGVfYnJpY2tfZmxvb3IiLCJ0eXBlIjoiY3lsaW5kZXIiLCJjb2xvciI6WzI1NSwyNTUsMjU1XSwiZW1pc3NpdmUiOnRydWUsImVtaXNzaW9uSW50ZW5zaXR5IjozLCJlbWlzc2lvblJhbmdlIjoxMH0seyJwb3NpdGlvbiI6WzAsLTAuMTI1LDMuNV0sInNjYWxlIjpbMTMuNSwwLjI1LDE4XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJvd25fbXVkX2xlYXZlc18wMSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDEuMjUsMTIuMzc1XSwic2NhbGUiOlsxMywyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOls2LjYyNSwxLjI1LDMuNV0sInNjYWxlIjpbMC4yNSwyLjUsMThdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicm93bl9wbGFua3NfMDMiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbLTYuNjI1LDEuMjUsMy41XSwic2NhbGUiOlswLjI1LDIuNSwxOF0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDEuMjUsLTUuMzc1XSwic2NhbGUiOlsxMywyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstNC4yNSwxLjUsOS42MjVdLCJzY2FsZSI6WzEsMSwxXSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmx1ZV9wYWludGVkX3BsYW5rcyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstNC43NSwwLjUsMTAuMjVdLCJzY2FsZSI6WzEsMSwxXSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZG91YmxlX2JyaWNrX2Zsb29yIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy00Ljc1LDAuNSw5XSwic2NhbGUiOlsxLDEsMV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJhcmtfd2lsbG93IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0zLjUsMC41LDkuNjI1XSwic2NhbGUiOlsxLDEsMV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJsdWVfZmxvb3JfdGlsZXNfMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfV0sInNjcmlwdHMiOlt7InN5bnRheCI6ImxvZyBzdHI6SGVsbG8hIiwibmFtZSI6Ik1haW4ifV19";



export function generateRandomID(length=8) {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let generated_id = "";

    for (let i=0; i<length; i++) {
        let char = chars[Math.floor(Math.random()*(chars.length-1))];
        generated_id += char
    }

    return generated_id
}



export async function importObj(file) {
    // Each line in an OBJ beginning with an f contains 3 sets of 3 numbers
    // Each set represents a point in a face
    // In each set, the first number is an index to the list of points
    // defined by the lines beginning with v
    // the second is an index to the list of uv coordinates or vt
    // the third is for vertex normals

    let request = await fetch(file);
    let raw = await request.text();

    let object = {"tris":[]};

    let points = [];
    let uv_coords = [];
    let norms = [];

    for (let line of raw.split("\n")) {
        let segments = line.split(" ");
        let line_type = segments[0];
        if (line_type == "v") {
            points.push([
                parseFloat(segments[1]), 
                parseFloat(segments[2]), 
                parseFloat(segments[3])
            ])
        } 
        
        if (line_type == "vn") {
            norms.push([
                parseFloat(segments[1]), 
                parseFloat(segments[2]), 
                parseFloat(segments[3])
            ])
        }

        if (line_type == "vt") {
            uv_coords.push([
                parseFloat(segments[1]), 
                parseFloat(segments[2])
            ])
        }

        if (line_type == "f") { // By the time a face line is found, the other components should be loaded
            let p1_indices = segments[1].split("/");
            let p2_indices = segments[2].split("/");
            let p3_indices = segments[3].split("/");

            object.tris.push(
                [
                    [points[parseInt(p1_indices[0])-1], norms[parseInt(p1_indices[2])-1], uv_coords[parseInt(p1_indices[1])-1]],
                    [points[parseInt(p2_indices[0])-1], norms[parseInt(p2_indices[2])-1], uv_coords[parseInt(p2_indices[1])-1]],
                    [points[parseInt(p3_indices[0])-1], norms[parseInt(p3_indices[2])-1], uv_coords[parseInt(p3_indices[1])-1]]
                ]
            )
        }
    }

    console.log(`Obj ${file} loaded`)

    return object
}


export class World {
    constructor(mode='studio') {
        this.mode = mode;
    }

    async load(file) {
        this.canvas = document.getElementById('canvas');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(100, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000000);
        this.textureLoader = new THREE.TextureLoader();
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false,
            canvas: this.canvas
        });

        let light = new THREE.DirectionalLight(0xFFFFFF, 2);
        light.position.set(0, 1000, 0);
        light.target.position.set(600, 0, 0);
        this.scene.add(light);
        this.scene.add(light.target);

        let amb = new THREE.AmbientLight(0xFFFFFF, 1);
        this.scene.add(amb);

        const resolution = 1;
        this.renderer.setSize(this.canvas.clientWidth / resolution, this.canvas.clientHeight / resolution);
        //this.renderer.domElement.style.width = (this.renderer.domElement.width * resolution) + 'px';
        //this.renderer.domElement.style.height = (this.renderer.domElement.height * resolution) + 'px';
        document.body.appendChild(this.renderer.domElement);

        this.camera.position.y = 2;
        this.camera.fov = 70;
        this.camera.updateProjectionMatrix();

        window.addEventListener("resize", (event) => {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        });



        this.parts = [];
        this.materials = {};

        // Cache of THREE.js materials representing Kodiak materials in data.assets.materials
        this.three_material_cache = {};

        // Dictionary of THREE.js objects representing parts. The key of any object 
        // in this array should match the key of the corresponding part in data.space.parts
        // Are they called dictionaries or objects in JavaScript? I don't know
        this.three_part_objects = {};


        let request = await fetch(file);
        this.data = await request.json()

        this.materials = this.data.assets.materials;
        this.models = this.data.assets.models;

        //console.log(this.materials)

        // Preload primitives
        this.data.assets.models["box"] = await importObj("/kodiak/assets/models/primitives/box.obj")
        this.data.assets.models["wedge"] = await importObj("/kodiak/assets/models/primitives/wedge.obj")
        this.data.assets.models["pyramid"] = await importObj("/kodiak/assets/models/primitives/pyramid.obj")
        this.data.assets.models["plane"] = await importObj("/kodiak/assets/models/primitives/plane.obj")
        this.data.assets.models["sphere"] = await importObj("/kodiak/assets/models/primitives/sphere.obj")
        this.data.assets.models["cylinder"] = await importObj("/kodiak/assets/models/primitives/cylinder.obj")
        this.data.assets.models["cone"] = await importObj("/kodiak/assets/models/primitives/cone.obj")
        this.data.assets.models["circle"] = await importObj("/kodiak/assets/models/primitives/circle.obj")

        this.data.assets.models["donut"] = await importObj("/kodiak/assets/models/special/donut.obj")
        this.data.assets.models["skybox"] = await importObj("/kodiak/assets/models/special/skybox.obj")
        this.data.assets.models["terrain"] = await importObj("/kodiak/assets/models/special/terrain.obj")

        for (let part_id in this.data.space.parts) {
            this.manifest(part_id)
        }
    }

    setMaterialTexture(material_id, texture_type, location) {
        this.materials[material_id].textures[texture_type] = location;
        let three_material = this.three_material_cache[material_id];

        let new_texture = this.textureLoader.load(location);
        new_texture.wrapS = THREE.RepeatWrapping;
        new_texture.wrapT = THREE.RepeatWrapping;
        new_texture.colorSpace = THREE.SRGBColorSpace;
        
        three_material.map = new_texture;
    }

    setMaterial(part_id, material_id) {
        let part = this.data.space.parts[part_id]
        if (part) {
            let object = this.getPartObjectByID(part_id);

            let material = this.materials[material_id]; // Kodiak material object

            let three_material; // THREE.js material object

            if (material_id in this.three_material_cache) { // Use cached material if it exists
                three_material = this.three_material_cache[material_id]
            } else { // If not, cache it
                let diffuse = this.textureLoader.load(material.textures.diffuse);
                
                diffuse.wrapS = THREE.RepeatWrapping;
                diffuse.wrapT = THREE.RepeatWrapping;
                diffuse.colorSpace = THREE.SRGBColorSpace; // So the textures dont look washed out
        
                three_material = new THREE.MeshLambertMaterial({
                    map: diffuse,
                    transparent: true,
                    depthTest: true,
                    alphaTest: 0.5,
                    color:new THREE.Color(material.tint[0]/255, material.tint[1]/255, material.tint[2]/255)
                });

                this.three_material_cache[material_id] = three_material
            }

            object.material = three_material;
            part.material = material_id

            this.updateUVs(part_id)
        } else {
            console.warn("Did not set material because no part was given or found")
        }
    }


    setModel(part_id, model_id) {
        let part = this.data.space.parts[part_id]
        if (part) {
            let object = this.getPartObjectByID(part_id);

            let model = this.models[model_id]; // Kodiak model object

            // Every part has a model property which refers to mesh data stored in
            // the file. This mesh data is in JSON format like the rest of the file

            let geometry = new THREE.BufferGeometry();

            let vertices = [];
            let norms = [];
            let uvs = [];

            for (let tri of model.tris) {
                for (let index of tri) {
                    //console.log(index)
                    vertices.push(...index[0])
                    norms.push(...index[1])
                    uvs.push(...index[2])
                }
            }

            //console.log(vertices)

            geometry.setAttribute('position',
                new THREE.BufferAttribute(
                    new Float32Array(vertices),
                    3
                )
            );
        
            geometry.setAttribute('normal',
                new THREE.BufferAttribute(
                    new Float32Array(norms),
                    3
                )
            );
        
            geometry.setAttribute('uv',
                new THREE.BufferAttribute(
                    new Float32Array(uvs),
                    2
                )
            );

            
            object.geometry = geometry;
            part.model = model_id; // update metadata so uv update works
            console.log("Set model")
        } else {
            console.warn("Did not set model because no part was given or found")
        }
    }


    manifest(part_id) {
        let object;
        let part = this.data.space.parts[part_id];
        if (! (part_id in this.three_part_objects)) {

            object = new THREE.Mesh();
            object.geometry = new THREE.BoxGeometry();
            object.is_part = true;
            object.part_id = part_id;
            this.scene.add(object);

            this.three_part_objects[part_id] = object;

            // This must be after the previous lines otherwise there will be a recursion error
            this.setModel(part_id, part.model)
        }

        object = this.three_part_objects[part_id];

        // Apply part attributes to the THREE.js object / mesh

        object.position.x = part.position[0];
        object.position.y = part.position[1];
        object.position.z = part.position[2];

        object.rotation.x = part.rotation[0];
        object.rotation.y = part.rotation[1];
        object.rotation.z = part.rotation[2];

        object.scale.x = part.scale[0];
        object.scale.y = part.scale[1];
        object.scale.z = part.scale[2];

        this.setMaterial(part_id, part.material);
        this.updateUVs(part_id);
    }


    getPartObjectByID(part_id) {
        if (! (part_id in this.three_part_objects)) {
            this.manifest(part_id)
        }

        return this.three_part_objects[part_id]
    }

    getPartByID(part_id) {
        return this.data.space.parts[part_id]
    }



    // Creates a part in data.space.parts and returns the ID
    newPart(position=[0, .5, 0], scale=[1, 1, 1], rotation=[0, 0, 0], materialID="default") {
        let new_part = {"position":[0, 0, 0], "scale":[1, 1, 1], "rotation":[0, 0, 0], "material":"dirt", "model":"box"};
        let part_id = generateRandomID();

        this.data.space.parts[part_id] = new_part;
        return part_id
    }

    newMaterial(name) {
        let new_material = {
            "textures":{
                "diffuse":"/assets/textures/dark_brick.png"
            },

            "tint":[255, 255, 255],
            "stretch":false,
            "scale":1
        }

        this.data.assets.materials[name] = new_material;
        return this.data.assets.materials[name]
    }


    async clonePart(part_id) {
        let part = this.getPartByID(part_id);

        console.log(generateRandomID())

        if (part) {
            let clone_id = generateRandomID();
            this.data.space.parts[clone_id] = structuredClone(part);
            this.manifest(clone_id);
        } else {
            console.warn("[Clone Part] No part was supplied or found.")
        }
    }

    async delPart(part_id) {
        let part = this.getPartByID(part_id);

        if (part) {
            let object = this.getPartObjectByID(part_id);

            this.scene.remove(object);
            delete this.data.space.parts[part_id];
            delete this.three_part_objects[part_id];

        } else {
            console.warn("[!] Action (delete) was not performed; No part was supplied or found.")
        }
    }

    // Stretches the UVs of a cube to match its scale
    async updateUVs(part_id) {
        let part = this.getPartByID(part_id);
        if (part) {
            let object = this.getPartObjectByID(part_id);            
            let part_material = this.materials[part.material];
            let part_model = this.data.assets.models[part.model]

            console.log(part.model)


            // NEW SYSTEM: vertex normals will be used to determine whether uvs for that vertex should be moved
            
            if (!part_material.stretch) {
                let vert_index = 0;
                for (let tri of part_model.tris) {
                    for (let vert of tri) {
                        let norm = vert[1];
                        let uv = vert[2];

                        let max_norm = Math.max( // With this we can find the most "extreme" value, or the direction the normal most closely faces
                            Math.abs(norm[0]), 
                            Math.abs(norm[1]), 
                            Math.abs(norm[2])
                        )

                        if (Math.abs(norm[1]) === max_norm) { // If the vertex normal is non-zero on the y axis, we can assume it is upward / downward facing and can be scaled on the x and z axes
                            //console.log(vert_index, part.scale[0])
                            object.geometry.attributes.uv.array[vert_index*2] = uv[0] * (part.scale[0]/part_material.scale)
                            object.geometry.attributes.uv.array[(vert_index*2)+1] = uv[1] * (part.scale[2]/part_material.scale)
                        }
                        if (Math.abs(norm[0]) === max_norm) { //
                            //console.log(vert_index, part.scale[0])
                            object.geometry.attributes.uv.array[vert_index*2] = uv[0] * (part.scale[1]/part_material.scale)
                            object.geometry.attributes.uv.array[(vert_index*2)+1] = uv[1] * (part.scale[2]/part_material.scale)
                        }
                        if (Math.abs(norm[2]) === max_norm) { //
                            //console.log(vert_index, part.scale[0])
                            object.geometry.attributes.uv.array[vert_index*2] = uv[0] * (part.scale[1]/part_material.scale)
                            object.geometry.attributes.uv.array[(vert_index*2)+1] = uv[1] * (part.scale[0]/part_material.scale)
                        }
    
    
                        vert_index++;
                    }
                }
            }

            // /\/\/\/\/\/\/\/\




            // These are the indices of vertices whose UVs should be scaled to the axes
            // of the scale of the part. I tried my best to explain. Sorry
            let x_scaled = [
                18, 22, 26, 30, 34, 38, 42, 46
            ]

            let y_scaled = [
                1, 3, 9, 11, 33, 35, 41, 43
            ]

            let z_scaled = [
                2, 6, 10, 14, 17, 19, 25, 27,
            ]


            let update_vertex_uv = (index, part_scale_on_axis) => {
                // If the material is not repeated, calling this will set the uv back to 1
                // which is how it should be if the material does not repeat.
                object.geometry.attributes.uv.array[index] = 1;

                // If the material is set to not stretch, it should scale with the part.
                // Setting the uv to the part's scale on the appropriate axis will make
                // the texture scale with the part
                if (!part_material.stretch) {
                    object.geometry.attributes.uv.array[index] = part_scale_on_axis
                }
                
                // Scale UVs by material texture scale
                // Since the texture will appear smaller the greater the UV values are,
                // the value should be divided, not multiplied by the scale
                object.geometry.attributes.uv.array[index] /= part_material.scale
            }


            for (let i of x_scaled) {
                //update_vertex_uv(i, part.scale[0])
            }

            for (let i of y_scaled) {
                //update_vertex_uv(i, part.scale[1])
            }

            for (let i of z_scaled) {
                //update_vertex_uv(i, part.scale[2])
            }

            object.geometry.attributes.uv.needsUpdate = true;
        } else {
            console.warn("[Update UVs] No part was supplied or found.")
        }

        console.log("Finished UV update")
    }

    export() {
        return this.data; //{parts: saveParts, materials: [{diffuse:"https://thecreatorgrey.com/assets/characters/apple.png", stretch:true, size_x:0, size_y:0}]};
    }
}