import * as THREE from 'three';

//export const defaultWorld = "eyJwYXJ0cyI6W3sicG9zaXRpb24iOlszLjEyNSwxLjg3NSwwLjVdLCJzY2FsZSI6WzAuMjUsMy4yNSw1LjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDAuMjUsMC41XSwic2NhbGUiOls2LDAuNSw1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZV8yIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMC42MjUsMC41XSwic2NhbGUiOls2LDAuMjUsNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6InJhd19wbGFua193YWxsIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDEwLDEwXX0seyJwb3NpdGlvbiI6WzIuODc1LDIuMTI1LDAuNV0sInNjYWxlIjpbMC4yNSwyLjc1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJlaWdlX3dhbGxfMDAxIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzIwMCwyMDAsMjAwXX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwzLjI1LDIuODc1XSwic2NhbGUiOlsxLjI1LDAuNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCw0LjM3NSwwLjVdLCJzY2FsZSI6WzUuNSwwLjI1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImdyZXlfcm9vZl90aWxlc18wMiIsInR5cGUiOiJjdWJlIiwiY29sb3IiOls1MCwwLDBdfSx7InBvc2l0aW9uIjpbMC44NzUsMi4xMjUsMi44NzVdLCJzY2FsZSI6WzQuMjUsMi43NSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCwyLjEyNSwtMS44NzVdLCJzY2FsZSI6WzYsMi43NSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTIuNzUsMi4xMjUsMi44NzVdLCJzY2FsZSI6WzAuNSwyLjc1LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJiZWlnZV93YWxsXzAwMSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyMDAsMjAwLDIwMF19LHsicG9zaXRpb24iOlstMi44NzUsMi4xMjUsMC41XSwic2NhbGUiOlswLjI1LDIuNzUsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTMuMTI1LDEuODc1LDAuNV0sInNjYWxlIjpbMC4yNSwzLjI1LDUuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMS44NzUsLTIuMTI1XSwic2NhbGUiOls2LDMuMjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAuODc1LDEuODc1LDMuMTI1XSwic2NhbGUiOls0LjI1LDMuMjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0yLjc1LDEuODc1LDMuMTI1XSwic2NhbGUiOlswLjUsMy4yNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJpY2tfd2FsbF8wMDUiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbLTEuODc1LDMuMjUsMy4xMjVdLCJzY2FsZSI6WzEuMjUsMC41LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstMS44NzUsMC4xMjUsMy42MjVdLCJzY2FsZSI6WzEuMjUsMC4yNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDMuMzc1LDAuNV0sInNjYWxlIjpbNS41LDAuMjUsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbMCwzLjYyNSwwLjVdLCJzY2FsZSI6WzcsMC4yNSw2XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZ3JleV9yb29mX3RpbGVzXzAyIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDAsMF19LHsicG9zaXRpb24iOlswLDMuODc1LDAuNV0sInNjYWxlIjpbNi41LDAuMjUsNS41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZ3JleV9yb29mX3RpbGVzXzAyIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDAsMF19LHsicG9zaXRpb24iOlswLDQuMTI1LDAuNV0sInNjYWxlIjpbNiwwLjI1LDVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJncmV5X3Jvb2ZfdGlsZXNfMDIiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbNTAsMCwwXX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwwLjM3NSwzLjEyNV0sInNjYWxlIjpbMS4yNSwwLjc1LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicnVzaGVkX2NvbmNyZXRlIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0xLjg3NSwwLjI1LDMuMzc1XSwic2NhbGUiOlsxLjI1LDAuNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDMuMTI1LDAuNV0sInNjYWxlIjpbMSwwLjI1LDFdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJkb3VibGVfYnJpY2tfZmxvb3IiLCJ0eXBlIjoiY3lsaW5kZXIiLCJjb2xvciI6WzI1NSwyNTUsMjU1XSwiZW1pc3NpdmUiOnRydWUsImVtaXNzaW9uSW50ZW5zaXR5IjozLCJlbWlzc2lvblJhbmdlIjoxMH0seyJwb3NpdGlvbiI6WzAsLTAuMTI1LDMuNV0sInNjYWxlIjpbMTMuNSwwLjI1LDE4XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJvd25fbXVkX2xlYXZlc18wMSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDEuMjUsMTIuMzc1XSwic2NhbGUiOlsxMywyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOls2LjYyNSwxLjI1LDMuNV0sInNjYWxlIjpbMC4yNSwyLjUsMThdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicm93bl9wbGFua3NfMDMiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbLTYuNjI1LDEuMjUsMy41XSwic2NhbGUiOlswLjI1LDIuNSwxOF0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDEuMjUsLTUuMzc1XSwic2NhbGUiOlsxMywyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyb3duX3BsYW5rc18wMyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstNC4yNSwxLjUsOS42MjVdLCJzY2FsZSI6WzEsMSwxXSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmx1ZV9wYWludGVkX3BsYW5rcyIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstNC43NSwwLjUsMTAuMjVdLCJzY2FsZSI6WzEsMSwxXSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZG91YmxlX2JyaWNrX2Zsb29yIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy00Ljc1LDAuNSw5XSwic2NhbGUiOlsxLDEsMV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJhcmtfd2lsbG93IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0zLjUsMC41LDkuNjI1XSwic2NhbGUiOlsxLDEsMV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJsdWVfZmxvb3JfdGlsZXNfMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfV0sInNjcmlwdHMiOlt7InN5bnRheCI6ImxvZyBzdHI6SGVsbG8hIiwibmFtZSI6Ik1haW4ifV19";


// **** Proudly made without the use of generative AI ****


export function generateRandomID(length=8) {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let generated_id = "";

    for (let i=0; i<length; i++) {
        let char = chars[Math.floor(Math.random()*(chars.length-1))];
        generated_id += char
    }

    return generated_id
}

const utf8decoder = new TextDecoder();
const utf8encoder = new TextEncoder();



export class World {
    constructor(mode='editor') {
        this.mode = mode;
    }

    async load(data) {
        this.LIMIT = Math.pow(255, 2);

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



        this.objects = [];
        this.materials = {};

        // Cache of THREE.js materials representing Kodiak materials in data.assets.materials
        this.three_material_cache = {};

        // Dictionary of THREE.js meshes representing objects. The key of any threejs mesh
        // in this array should match the key of the corresponding object in data.space.objects
        // Are they called dictionaries or objects in JavaScript? I don't know
        this.three_object_meshes = {};

        this.data = data;

        this.materials = this.data.assets.materials;
        this.models = this.data.assets.models;

        //console.log(this.materials)

        // Preload primitives
        await this.importModelByURL("/kodiak/assets/models/primitives/box.obj", "Box");
        if (true) {
            await this.importModelByURL("/kodiak/assets/models/primitives/wedge.obj", "Wedge");
            await this.importModelByURL("/kodiak/assets/models/primitives/pyramid.obj", "Pyramid");
            await this.importModelByURL("/kodiak/assets/models/primitives/plane.obj", "Plane");
            await this.importModelByURL("/kodiak/assets/models/primitives/sphere.obj", "Sphere");
            await this.importModelByURL("/kodiak/assets/models/primitives/cylinder.obj", "Cylinder");
            await this.importModelByURL("/kodiak/assets/models/primitives/cone.obj", "Cone");
            await this.importModelByURL("/kodiak/assets/models/primitives/circle.obj", "Circle");
    
            await this.importModelByURL("/kodiak/assets/models/special/donut.obj", "Donut");
            await this.importModelByURL("/kodiak/assets/models/special/skybox.obj", "Skybox");
            await this.importModelByURL("/kodiak/assets/models/special/decimated.obj", "Terrain");
        }

        // Preload default textures (remove later)
        await this.importMaterialByURL("/kodiak/assets/textures/sky.png", "Sky");
        this.materials[0].stretch = true
        this.materials[0].shading = false
        await this.importMaterialByURL("/kodiak/assets/textures/plain_color_tile.png", "PlainColorTile");
        await this.importMaterialByURL("/kodiak/assets/textures/alpha_test.png", "AlphaTest");

        for (let object_id in this.data.space.objects) {
            this.manifest(object_id)
        }
    }

    // Creates a new Kodiak model (not threejs mesh/object) from an imported OBJ
    importModel(data, model_name="Untitled Model") {
        // Accepts .OBJ models

        // Each line in an OBJ beginning with an f contains 3 sets of 3 numbers
        // Each set represents a point in a face
        // In each set, the first number is an index to the list of points
        // defined by the lines beginning with v
        // the second is an index to the list of uv coordinates or vt
        // the third is for vertex normals

        //let request = await fetch(filename);
        //let raw = await request.text();

        console.log(data)

        let raw = utf8decoder.decode(data)

        console.log(raw)

        let object = {"name":model_name, "tris":[]};

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

        console.log(`Obj model "${model_name}" loaded`)

        this.data.assets.models.push(object)
    }

    async importModelByURL(filename, model_name) {
        let request = await fetch(filename);
        let raw = await request.bytes();

        this.importModel(raw, model_name)
    }

    // Gets the first model with the specified name
    getModelIDByName(name) {
        for (let model_id in this.models) {
            if (this.models[model_id].name.toLowerCase() === name.toLowerCase()) {
                return model_id
            }
        }
    }

    // Creates a new Kodiak material (not threejs material) from an imported image file
    async importMaterial(data, material_name="Untitled Model") {
        // Accepts common image files

        // I have to convert the data to base 64 so the browser can take it and convert it back into binary. So fucking stupid.
        let base64 = URL.createObjectURL(
            new Blob([data], {type: 'application/octet-binary'})
        );

        let image_obj = new Image();
        image_obj.src = base64;
        await image_obj.decode();

        // Create canvas because there is no better way that I know of
        let img_canvas = document.createElement("canvas");
        img_canvas.width = image_obj.width;
        img_canvas.height = image_obj.height;
        document.body.appendChild(img_canvas)
        let img_ctx = img_canvas.getContext("2d");
        img_ctx.drawImage(image_obj, 0, 0);
        
        // Ok now that I have the image on a canvas I can get the raw pixel data
        let img_data = img_ctx.getImageData(0, 0, image_obj.width, image_obj.height)

        // Now make the actual Kodiak material object
        this.materials.push(
            {
                "name":material_name,
                "textures":{
                    "diffuse":img_data.data
                },
                "texture_width":image_obj.width,
                "texture_height":image_obj.height,
                "tint": [
                    255,
                    255,
                    255
                ],
                "stretch": false,
                "scale": [1, 1],
                "shading":true
            }
        )
    }

    async importMaterialByURL(filename, material_name) {
        let request = await fetch(filename);
        let raw = await request.bytes();

        await this.importMaterial(raw, material_name)
    }


    // To be replaced
    setMaterialTexture(material_id, texture_type, data) {
        this.materials[material_id].textures[texture_type] = data;
        let three_material = this.three_material_cache[material_id];

        let blob = new Blob([data]);
        let url =  window.URL.createObjectURL(blob);

        let new_texture = this.textureLoader.load(url);
        //new THREE.DataTexture(data)
        new_texture.wrapS = THREE.RepeatWrapping;
        new_texture.wrapT = THREE.RepeatWrapping;
        new_texture.colorSpace = THREE.SRGBColorSpace;
        
        three_material.map = new_texture;
    }

    setMaterial(object_id, material_id) {
        let object = this.data.space.objects[object_id]
        if (object) {
            let three_mesh = this.getThreeMesh(object_id);

            let material = this.materials[material_id]; // Kodiak material object

            let three_material; // THREE.js material object

            if (material_id in this.three_material_cache) { // Use cached material if it exists
                three_material = this.three_material_cache[material_id]
            } else { // If not, cache it
                console.log(material.textures.diffuse, material.texture_width, material.texture_height)
                let diffuse = new THREE.DataTexture(material.textures.diffuse, material.texture_width, material.texture_height, THREE.RGBAFormat);
                diffuse.flipY = true;
                diffuse.needsUpdate = true;

                console.log(diffuse)
                
                diffuse.wrapS = THREE.RepeatWrapping;
                diffuse.wrapT = THREE.RepeatWrapping;
                diffuse.colorSpace = THREE.SRGBColorSpace; // So the textures dont look washed out

                if (material.shading) {
                    three_material = new THREE.MeshLambertMaterial({
                        map: diffuse,
                        transparent: true,
                        depthTest: true,
                        alphaTest: 0.5,
                        color:new THREE.Color(material.tint[0]/255, material.tint[1]/255, material.tint[2]/255)
                    });
                } else {
                    three_material = new THREE.MeshBasicMaterial({
                        map: diffuse,
                        transparent: true,
                        depthTest: true,
                        alphaTest: 0.5,
                        color:new THREE.Color(material.tint[0]/255, material.tint[1]/255, material.tint[2]/255)
                    });
                }

                this.three_material_cache[material_id] = three_material
            }

            three_mesh.material = three_material;
            object.material = material_id

            this.updateUVs(object_id)
        } else {
            console.warn("Did not set material because no object was given or found")
        }
    }


    setModel(object_id, model_id) {
        let object = this.data.space.objects[object_id]
        if (object) {
            let three_mesh = this.getThreeMesh(object_id);

            let model = this.data.assets.models[model_id]; // Kodiak model object

            // Every object has a model property which refers to model data stored in
            // the file. This model data is in JSON format like the rest of the file

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

            
            three_mesh.geometry = geometry;
            object.model = model_id; // update metadata so uv update works
            console.log("Set model")
        } else {
            console.warn("Did not set model because no object was given or found")
        }
    }


    manifest(object_id) {
        let three_mesh;
        let object = this.data.space.objects[object_id];
        if (! (object_id in this.three_object_meshes)) {

            three_mesh = new THREE.Mesh();
            three_mesh.geometry = new THREE.BoxGeometry();
            three_mesh.is_object = true;
            three_mesh.object_id = object_id;
            this.scene.add(three_mesh);

            this.three_object_meshes[object_id] = three_mesh;

            // This must be after the previous lines otherwise there will be a recursion error
            this.setModel(object_id, object.model)
        }

        three_mesh = this.three_object_meshes[object_id];

        // Apply object attributes to the THREE.js mesh

        three_mesh.position.x = object.position[0];
        three_mesh.position.y = object.position[1];
        three_mesh.position.z = object.position[2];

        three_mesh.rotation.x = object.rotation[0];
        three_mesh.rotation.y = object.rotation[1];
        three_mesh.rotation.z = object.rotation[2];

        three_mesh.scale.x = object.scale[0];
        three_mesh.scale.y = object.scale[1];
        three_mesh.scale.z = object.scale[2];

        this.setMaterial(object_id, object.material);
        this.updateUVs(object_id);
    }

    // Gets the Three.js mesh associated with an object
    getThreeMesh(object_id) {
        if (! (object_id in this.three_object_meshes)) {
            this.manifest(object_id)
        }

        return this.three_object_meshes[object_id]
    }

    getObjectByID(object_id) {
        return this.data.space.objects[object_id]
    }



    // Creates a object in data.space.objects and returns the ID
    newPart(position=[0, .5, 0], scale=[1, 1, 1], rotation=[0, 0, 0], materialID="default") {
        let new_object = {"position":[0, 0, 0], "scale":[1, 1, 1], "rotation":[0, 0, 0], "material":"testmat", "model":0};
        let object_id = generateRandomID();

        this.data.space.objects[object_id] = new_object;
        return object_id
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


    async clonePart(object_id) {
        let object = this.getObjectByID(object_id);

        console.log(generateRandomID())

        if (object) {
            let clone_id = generateRandomID();
            this.data.space.objects[clone_id] = structuredClone(object);
            this.manifest(clone_id);
        } else {
            console.warn("[Clone object] No object was supplied or found.")
        }
    }

    async delPart(object_id) {
        let object = this.getObjectByID(object_id);

        if (object) {
            let three_mesh = this.getThreeMesh(object_id);

            this.scene.remove(three_mesh);
            delete this.data.space.objects[object_id];
            delete this.three_object_meshes[object_id];

        } else {
            console.warn("[!] Action (delete) was not performed; No object was supplied or found.")
        }
    }

    // Stretches the UVs of a cube to match its scale
    async updateUVs(object_id) {
        let object = this.getObjectByID(object_id);
        if (object) {
            let three_mesh = this.getThreeMesh(object_id);            
            let object_material = this.materials[object.material];
            let object_model = this.data.assets.models[object.model]

            //console.log(object.model)

            // NEW SYSTEM: vertex normals will be used to determine whether uvs for that vertex should be moved
            
            if (!object_material.stretch) {
                let vert_index = 0;
                for (let tri of object_model.tris) {
                    for (let vert of tri) {
                        let norm = vert[1];
                        let uv = vert[2];

                        let max_norm = Math.max( // With this we can find the most "extreme" value, or the direction the normal most closely faces
                            Math.abs(norm[0]), 
                            Math.abs(norm[1]), 
                            Math.abs(norm[2])
                        )

                        if (Math.abs(norm[1]) === max_norm) { // If the vertex normal is non-zero on the y axis, we can assume it is upward / downward facing and can be scaled on the x and z axes
                            //console.log(vert_index, object.scale[0])
                            three_mesh.geometry.attributes.uv.array[vert_index*2] = uv[0] * (object.scale[0]/object_material.scale[0])
                            three_mesh.geometry.attributes.uv.array[(vert_index*2)+1] = uv[1] * (object.scale[2]/object_material.scale[1])
                        }
                        if (Math.abs(norm[0]) === max_norm) { //
                            //console.log(vert_index, object.scale[0])
                            three_mesh.geometry.attributes.uv.array[vert_index*2] = uv[0] * (object.scale[2]/object_material.scale[0])
                            three_mesh.geometry.attributes.uv.array[(vert_index*2)+1] = uv[1] * (object.scale[1]/object_material.scale[1])
                        }
                        if (Math.abs(norm[2]) === max_norm) { //
                            //console.log(vert_index, object.scale[0])
                            three_mesh.geometry.attributes.uv.array[vert_index*2] = uv[0] * (object.scale[0]/object_material.scale[0])
                            three_mesh.geometry.attributes.uv.array[(vert_index*2)+1] = uv[1] * (object.scale[1]/object_material.scale[1])
                        }
    
    
                        vert_index++;
                    }
                }
            }

            three_mesh.geometry.attributes.uv.needsUpdate = true;
        } else {
            console.warn("[Update UVs] No object was supplied or found.")
        }

        //console.log("Finished UV update")
    }

    export() {
        return this.data; //{parts: saveParts, materials: [{diffuse:"https://thecreatorgrey.com/assets/characters/apple.png", stretch:true, size_x:0, size_y:0}]};
    }

    // Encodes the world data to binary
    serialize() {
        // I just love working with binary man its so cool
        
        // Encodes a nonnegative whole number between 0 and 255^2. Returns two bytes
        function encode_whole_number(num) {
            let byte1 = Math.floor(num / 255);
            let byte2 = num % 255

            return [byte1, byte2]
        }

        // Encodes a number within a specified range. Precision equal to (most-least)/(255^2)
        function encode_custom_range(num, least, most) {
            let value = num

            // Clamp values
            if (value < (least)) {
                console.log(`Value ${value} is below minumum ${least}`)
                value = least
            }
            if (value > (most)) {
                console.log(`Value ${value} is above maximum ${most}`)
                value = most
            }

            value -= least // Will offset the value so it will not be below zero (if the value is actually in range)
            let from_zero_maximum = most-least // The new maximum value after being offset

            // Expand to the supported range of 255^2
            value *= (Math.pow(255, 2) / from_zero_maximum)

            // Any unsupported precision is rounded off
            // For this, whole number encoding is used which takes two bytes and can encode any whole number from 0 to 255^2
            // I could have decided to use the 4 byte encode num which supports even more precision, but this would be excessive
            // since even a range of 0 to 100 would have a precision of 100/255^2 or ~0.0015. Seems like plenty to me
            return encode_whole_number(Math.round(value))
        }

        // Encodes a nonnegative floating value from 0 and 255^2 with a precision of 1/(255^2). Returns four bytes
        function encode_num(num) {
            let whole = Math.floor(num)
            let frac = num - whole

            console.log(Math.round(frac * Math.pow(255, 2)))

            return [
                ...encode_whole_number(whole),
                ...encode_whole_number(Math.round(frac * Math.pow(255, 2)))
            ]
        }

        // Returns a byte equal to the number of bytes following containing utf-8 format text
        // Text is only used to organize materials, meshes and objects. It isn't critical to the function to be able to perfectly decode it.
        function encode_utf8(string, limit=255) {
            return utf8encoder.encode(string).slice(0, limit); // Anything past the limit will simply be sliced off
        }

        let data_arr = [];

        // Each object is represented by n bytes:
        // 4 bytes each (12 in total) for the position on the x, y and z axes
        // 4 bytes each (12 in total) for the scale on the x, y and z axes
        // 2 bytes each (6 in total) for the rotation on the x, y and z axes
        // 1 byte for model id (a single file can have 256 different models)
        // 1 byte for material id (a single file can have 256 different materials)

        function encode_radians(rad) {
            let degrees = rad * (180 / Math.PI) // Convert to deg
            let squished = degrees / 360 // Squish down to a supported range of 0 to 1
            squished = squished - Math.floor(squished) // Angles outside of range (like 1.1) will get wrapped around (to 0.1 for example)

            return encode_custom_range(squished, 0, 1)
        }


        // Title
        let title_encoded = encode_utf8(this.data.title)
        data_arr.push(title_encoded.length)
        data_arr.push(...title_encoded);

        console.log(this.data, this.data.title, title_encoded, title_encoded.length)

        // Version number
        data_arr.push(this.data.version)


        // Models

        // Number of models (maximum number of models is 256)
        data_arr.push(this.models.length);

        for (let model_id in this.models) {
            let model = this.models[model_id];

            // Model name
            console.log(model.name)
            let model_name_encoded = encode_utf8(model.name)
            data_arr.push(model_name_encoded.length)
            data_arr.push(...model_name_encoded);

            if (this.LIMIT < model.tris.length) {
                console.warn("Too many triangles. Excess has been removed")
                model.tris.splice(this.LIMIT, model.tris.length-this.LIMIT) // Triangles over limit will be culled
            }

            // Number of triangles (maximum number of triangles is 255^2)
            data_arr.push(...encode_whole_number(model.tris.length))
            console.log(model.tris.length)

            // Each tri is 24 bytes (8 bytes per vertex)
            // Obviously each triangle has three vertices
            // Each vertex has 8 values (2 bytes each, 16 bytes total):
            // 3 for position (2 bytes each)
            // 3 for vertex normal (2 bytes each)
            // 2 for UV texture coordinates (2 bytes each)

            for (let triangle of model.tris) {
                // I am iterating 3 instead of iterating the triangle object itself
                // because a single "triangle" with multiple vertices could break the whole file
                for (let v=0; v<3; v++) {
                    let vertex = triangle[v];

                    // Vertex position
                    data_arr.push(...encode_custom_range(vertex[0][0], -0.5, 0.5))
                    data_arr.push(...encode_custom_range(vertex[0][1], -0.5, 0.5))
                    data_arr.push(...encode_custom_range(vertex[0][2], -0.5, 0.5))

                    // Vertex normal
                    data_arr.push(...encode_custom_range(vertex[1][0], -1, 1))
                    data_arr.push(...encode_custom_range(vertex[1][1], -1, 1))
                    data_arr.push(...encode_custom_range(vertex[1][2], -1, 1))

                    // Vertex UV texture coords
                    data_arr.push(...encode_custom_range(vertex[2][0], 0, 1))
                    data_arr.push(...encode_custom_range(vertex[2][1], 0, 1))
                }
            }
        }


        // Now for materials and their textures. These usually take up most of the file.

        // Number of materials (maximum number of materials is 256)
        data_arr.push(this.materials.length);

        for (let mat_id in this.materials) {
            let material = this.materials[mat_id];

            // Material name
            console.log(material.name)
            let material_name_encoded = encode_utf8(material.name)
            data_arr.push(material_name_encoded.length)
            data_arr.push(...material_name_encoded);

            // UV scale (up to 255^2 times the original to 1/255^2)
            data_arr.push(...encode_num(material.scale[0])) // u / x
            data_arr.push(...encode_num(material.scale[1])) // v / y

            // Material tint (RGBA, 0-255 each)
            data_arr.push(material.tint[0])
            data_arr.push(material.tint[1])
            data_arr.push(material.tint[2])
            data_arr.push(material.tint[3])

            // Other material settings

            if (material.stretch) { // 0 or 255 will be used for boolean values. Not efficent but we're dealing with uint8s, not bit by bit.
                data_arr.push(255)
            } else {
                data_arr.push(0)
            }

            if (material.shading) {
                data_arr.push(255)
            } else {
                data_arr.push(0)
            }

            // Resolution of textures (max res is a 65k by 65k image, which would be 16 gigabytes uncompressed... I wont even bother adding a resolution check because who the hell uploads a 16 GB texture?
            data_arr.push(...encode_whole_number(material.texture_width))
            data_arr.push(...encode_whole_number(material.texture_height))

            // Pixel channel ranges
            // 1 channel = greyscale
            // 3 channels = RGB
            // 4 channels = RGBA
            // 5 channels = RGBA with roughness map
            // 6 channels = RGBA with rough map and bump/height map
            data_arr.push(4)
            
            // The texture data itself
            for (let b of material.textures.diffuse) {
                data_arr.push(b)
            }
        }


        console.log(data_arr.length, "num obj", Object.keys(this.data.space.objects).length)


        // Number of objects (maximum count of 255^2, 2 bytes)
        data_arr.push(...encode_whole_number(Object.keys(this.data.space.objects).length));

        // Objects
        for (let object_id in this.data.space.objects) {
            let object = this.data.space.objects[object_id];

            //console.log(encode_num(object.position[1]), object.position[1])

            data_arr.push(...encode_num(object.position[0]+(this.LIMIT/2))); // Object position (12 bytes)
            data_arr.push(...encode_num(object.position[1]+(this.LIMIT/2)));
            data_arr.push(...encode_num(object.position[2]+(this.LIMIT/2)));

            data_arr.push(...encode_num(object.scale[0])); // Object scale (12 bytes)
            data_arr.push(...encode_num(object.scale[1]));
            data_arr.push(...encode_num(object.scale[2]));

            data_arr.push(...encode_radians(object.rotation[0])); // Object rotation (6 bytes)
            data_arr.push(...encode_radians(object.rotation[1]));
            data_arr.push(...encode_radians(object.rotation[2]));

            data_arr.push(object.model);
            data_arr.push(object.material);
        }


        let output = new Uint8Array(new ArrayBuffer(data_arr.length))
        let index = 0;
        for (let byte of data_arr) {
            output[index] = byte
            index++
        }

        console.log(output, data_arr)

        // Download
        var a = document.createElement("a");
        var file = new Blob([output], { type: 'application/octet-stream' });
        a.href = URL.createObjectURL(file);
        a.download = "export.kodiak2";
        a.click();
    }

    from_serial(raw) {
        let data_arr = new Uint8Array(raw)

        // Decodes a nonnegative whole number from two bytes
        function decode_whole_number(byte1, byte2) {
            return (byte1 * 255) + byte2
        }

        // Decodes a number within a specified range
        function decode_custom_range(byte_pair, least, most) {
            let value = decode_whole_number(byte_pair[0], byte_pair[1])
            
            let from_zero_maximum = most-least // The maximum value if the range is offset to be above zero

            // Encoded value is still within the supported range of 255^2
            // Crunch it back down to the original range
            value /= (Math.pow(255, 2) / from_zero_maximum)

            value += least // Offset value back to the original minumum

            return value
        }

        // Decodes a nonnegative floating value from four bytes
        function decode_num(byte1, byte2, byte3, byte4) {
            let whole = decode_whole_number(byte1, byte2)
            let frac = decode_whole_number(byte3, byte4) / Math.pow(255, 2)

            return whole + frac
        }


        // I designed the format so that the binary can be processed chunk by chunk
        let scroll = 0
        function next_chunk(len) {
            scroll += len
            return data_arr.slice(scroll-len, scroll)
        }

        // Similar to the above function except to take the next single chunk
        function single_chunk() {
            scroll += 1
            return data_arr[scroll-1]
        }


        // Title, obviously
        let title_size = single_chunk();
        this.data.title = utf8decoder.decode(next_chunk(title_size));
        console.log(this.data.title)

        // Version number
        this.data.version = single_chunk(); // Hopefully by version 255 no further changes will be needed *shrug*
        console.log(this.data.version)


        // Models

        let model_count = single_chunk();
        console.log(model_count)
        
        for (let model_id=0; model_id<model_count; model_id++) {
            let model_parsed = {"tris":[]}

            // Model name
            let model_name_size = single_chunk();
            model_parsed.name = utf8decoder.decode(next_chunk(model_name_size));
            console.log(model_parsed.name)

            // Model tris
            let triangle_count = decode_whole_number(...next_chunk(2))
            console.log(triangle_count)
            for (let t=0; t<triangle_count; t++) {
                let triangle = [];

                // Triangle vertices
                for (let v=0; v<3; v++) {
                    triangle.push([
                        [
                            decode_custom_range(next_chunk(2), -0.5, 0.5), // Vertex position
                            decode_custom_range(next_chunk(2), -0.5, 0.5),
                            decode_custom_range(next_chunk(2), -0.5, 0.5)
                        ],

                        [
                            decode_custom_range(next_chunk(2), -1, 1), // Vertex norms
                            decode_custom_range(next_chunk(2), -1, 1),
                            decode_custom_range(next_chunk(2), -1, 1)
                        ],

                        [
                            decode_custom_range(next_chunk(2), 0, 1), // Vertex UV coords
                            decode_custom_range(next_chunk(2), 0, 1)
                        ]
                    ])
                }

                model_parsed.tris.push(triangle)
            }

            console.log(scroll, "end of object")

            this.data.assets.models[model_id] = model_parsed
            console.log(model_parsed)
        }


        // Materials

        let material_count = single_chunk();
        console.log(material_count)
        
        for (let mat_id=0; mat_id<material_count; mat_id++) {
            let material_parsed = {}

            // Material name
            let material_name_size = single_chunk();
            material_parsed.name = utf8decoder.decode(next_chunk(material_name_size));
            console.log(material_parsed.name)

            // Texture UV scale
            material_parsed["scale"] = [
                decode_num(...next_chunk(4)),
                decode_num(...next_chunk(4))
            ]

            // RGBA color tint
            material_parsed["tint"] = next_chunk(4)

            // Other material settings

            if (single_chunk() === 255) { // Stretch
                material_parsed["stretch"] = true
            } else {
                material_parsed["stretch"] = false
            }

            if (single_chunk() === 255) { // Shading
                material_parsed["shading"] = true
            } else {
                material_parsed["shading"] = false
            }

            // Texrure resolution
            let tex_resolution_x = decode_whole_number(...next_chunk(2))
            let tex_resolution_y = decode_whole_number(...next_chunk(2))

            material_parsed["texture_width"] = tex_resolution_x;
            material_parsed["texture_height"] = tex_resolution_y;

            // Number of channels from 1 to 6, greyscale to RGBA with material maps (details in encoder)
            let num_channels = single_chunk()

            // Texture data
            let texture_data = new Uint8Array(new ArrayBuffer(tex_resolution_x*tex_resolution_y*4))
            for (let b=0; b<(tex_resolution_x*tex_resolution_y*4); b++) {
                texture_data[b] = single_chunk()
            }

            material_parsed["textures"] = {"diffuse":texture_data}

            this.data.assets.materials[mat_id] = material_parsed
        }


        // Objects

        function decode_radians(byte1, byte2) {
            let squished = decode_custom_range([byte1, byte2], 0, 1)
            let degrees = squished * 360
            let radians = degrees * (Math.PI / 180)

            return radians
        }

        let object_count = decode_whole_number(...next_chunk(2))
        console.log(object_count, scroll)

        for (let i=0; i<object_count; i++) {
            let new_object_id = this.newPart();
            let new_object = this.getObjectByID(new_object_id);
    
            new_object.position[0] = decode_num(...next_chunk(4))-(this.LIMIT/2);
            new_object.position[1] = decode_num(...next_chunk(4))-(this.LIMIT/2);
            new_object.position[2] = decode_num(...next_chunk(4))-(this.LIMIT/2);
    
            new_object.scale[0] = decode_num(...next_chunk(4));
            new_object.scale[1] = decode_num(...next_chunk(4));
            new_object.scale[2] = decode_num(...next_chunk(4));
    
            new_object.rotation[0] = decode_radians(...next_chunk(2));
            new_object.rotation[1] = decode_radians(...next_chunk(2));
            new_object.rotation[2] = decode_radians(...next_chunk(2));

            new_object.model = single_chunk();
            new_object.material = single_chunk();

            console.log(new_object.position, new_object.scale, new_object.rotation)

            this.manifest(new_object_id);
        }
    }
}