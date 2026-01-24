import * as THREE from 'three';


// **** Proudly made without the use of generative AI ****


const progress_popup = document.getElementById("progress_popup");
const progress_text = document.getElementById("progress_text");
const progress_bar = document.getElementById("progress_bar");

export async function updateProgress(task_name, unit_name, progress, total) {
    progress_text.innerText = `${task_name} | ${progress}/${total} ${unit_name}`

    let percentage = (progress/total)*100
    progress_bar.style.width = `${percentage}%`

    if (total <= progress) {
        progress_popup.hidden = true
    } else {
        progress_popup.hidden = false
    }

    // Prevents heavy tasks from freezing the page
    await sleep(0)
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}





// 50% compression ratio quantization values from JPEG standard
const QUANTIZATION_VALUES = [
    [16,11,10,16,24,40,51,61],
    [12,12,14,19,26,58,60,55],
    [14,13,16,24,40,57,69,56],
    [14,17,22,29,51,87,80,62],
    [18,22,37,56,68,109,103,77],
    [24,35,55,64,81,104,113,92],
    [49,64,78,87,103,121,120,101],
    [72,92,95,98,112,100,103,99]
]



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



// A simple object for handling byte arrays byte by byte, chunk by chunk
class ByteHandler {
    constructor(data_arr) {
        this.data_arr = data_arr
        this.scroll = 0
    }

    next_byte() {
        this.scroll++
        return this.data_arr[this.scroll-1]
    }

    next_bytes(len) {
        this.scroll += len
        return this.data_arr.slice(this.scroll-len, this.scroll)
    }
}


export class World {
    constructor(mode='editor') {
        this.mode = mode;
    }

    async load(data) {
        this.LIMIT = Math.pow(255, 2);

        this.canvas = document.getElementById('canvas');

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(100, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000000);
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
            await this.manifest(object_id)
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

        let lines_iterated = 0;
        let lines = raw.split("\n");
        for (let line of lines) {
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

            lines_iterated++;
            updateProgress("Importing OBJ", "lines", lines_iterated, lines.length)
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
        let img_ctx = img_canvas.getContext("2d");
        img_ctx.drawImage(image_obj, 0, 0);
        
        // Ok now that I have the image on a canvas I can get the raw pixel data
        let img_data = img_ctx.getImageData(0, 0, image_obj.width, image_obj.height)

        // Now make the actual Kodiak material object
        let material = {
            "name":material_name,
            "textures":{
                "diffuse":await this.compressTexture(img_data.data, image_obj.width, image_obj.height)
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

        this.materials.push(material)

        return this.materials.length-1
    }

    async importMaterialByURL(filename, material_name) {
        let request = await fetch(filename);
        let raw = await request.bytes();

        return await this.importMaterial(raw, material_name)
    }

    // Gets the first material with the specified name
    getMaterialIDByName(name) {
        for (let mat_id in this.materials) {
            if (this.materials[mat_id].name.toLowerCase() === name.toLowerCase()) {
                return mat_id
            }
        }
    }

    async setMaterial(object_id, material_id) {
        let object = this.data.space.objects[object_id]
        if (object) {
            let three_mesh = await this.getThreeMesh(object_id);

            let material = this.materials[material_id]; // Kodiak material object

            let three_material; // THREE.js material object

            if (material_id in this.three_material_cache) { // Use cached material if it exists
                three_material = this.three_material_cache[material_id]
            } else { // If not, cache it
                //console.log(material.textures.diffuse, material.texture_width, material.texture_height)
                let diffuse = new THREE.DataTexture(
                    await this.decompressTexture(
                        material.textures.diffuse, 
                        material.texture_width, 
                        material.texture_height
                    ), 
                    material.texture_width, 
                    material.texture_height, 
                    THREE.RGBAFormat
                );

                diffuse.flipY = true;
                diffuse.wrapS = THREE.RepeatWrapping;
                diffuse.wrapT = THREE.RepeatWrapping;
                diffuse.colorSpace = THREE.SRGBColorSpace; // So the textures dont look washed out
                diffuse.minFilter = THREE.LinearMipmapLinearFilter;
                diffuse.magFilter = THREE.LinearFilter;

                diffuse.needsUpdate = true;

                console.log(diffuse)

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

            await this.updateUVs(object_id)
        } else {
            console.warn("Did not set material because no object was given or found")
        }
    }


    async setModel(object_id, model_id) {
        let object = this.data.space.objects[object_id]
        if (object) {
            let three_mesh = await this.getThreeMesh(object_id);

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


    async manifest(object_id) {
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
            await this.setModel(object_id, object.model)
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

        await this.setMaterial(object_id, object.material);
        await this.updateUVs(object_id);
    }

    // Gets the Three.js mesh associated with an object
    async getThreeMesh(object_id) {
        if (! (object_id in this.three_object_meshes)) {
            await this.manifest(object_id)
        }

        return this.three_object_meshes[object_id]
    }

    getObjectByID(object_id) {
        return this.data.space.objects[object_id]
    }



    // Creates an object in data.space.objects and returns the ID
    newPart() {
        let new_object = {"position":[0, 0, 0], "scale":[1, 1, 1], "rotation":[0, 0, 0], "material":0, "model":0};
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
            let three_mesh = await this.getThreeMesh(object_id);

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
            let three_mesh = await this.getThreeMesh(object_id);            
            let object_material = this.data.assets.materials[object.material];
            let object_model = this.data.assets.models[object.model]

            //console.log(object.model)

            // NEW SYSTEM: vertex normals will be used to determine whether uvs for that vertex should be moved

            let vert_index = 0;

            for (let tri of object_model.tris) {
                for (let vert of tri) {
                    let norm = vert[1];
                    let uv = vert[2];

                    if (!object_material.stretch) {        
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
                    } else {
                        three_mesh.geometry.attributes.uv.array[vert_index*2] = uv[0] * object_material.scale[0]
                        three_mesh.geometry.attributes.uv.array[(vert_index*2)+1] = uv[1] * object_material.scale[1]
                    }

                    vert_index++;
                }
            }

            three_mesh.geometry.attributes.uv.needsUpdate = true;
        } else {
            console.warn("[Update UVs] No object was supplied or found.")
        }

        //console.log("Finished UV update")
    }

    // Compresses a raw texture stored in an array to a compressed texture stored in an array
    async compressTexture(raw, width, height) {

        function compressDCT(block, chunk_width=8, chunk_height=8) {
            let coefficients = new Array(chunk_width*chunk_height).fill(0)
        
            // !!! LOOK OUT! SCARY DCT ALGORITHM BELOW!!!
        
            // Ok look I'm a highschool student but I'm gonna try my best to explain something I don't fully understand
        
            // Here goes
        
            // If you're unfamiliar with DCT, its the idea that any wave can be broken down and reconstructed using cosine waves of different frequencies and amplitudes
            // A row of pixels can be thought of as a wave, and a 2D grid of pixels can be thought of as multiple waves stacked on top of eachother.
            // We can compare an 8x8 grid of pixels to a bunch of 2D DCT basis functions (which can also be represented by a grid of 8x8) with different 
            // frequencies of cos waves and find which ones contribute to the chunk of pixels and how much. Numbers (coefficients) referring to the amount 
            // that a basis function contrubutes to a given chunk of pixels is enough to reconstruct it.
        
            // The 2D DCT basis functions can be represented by grids of 8x8 within a larger 8x8 grid of 64 basis functions.
            // The values in the grids of each function are sampled from cosine waves. The frequency of those waves are
            // higher depending on the position of the function grid within the larger basis function table.
            // If you've ever seen a table of DCT basis functions, you can imagine this as iterating through each of the squares representing the frequencies
        
            // !! The basis functions are not actually stored as grids !!, but can be imagined as such. The values in the "grid" of a function can be found using math.
            // Hopefully my explanation didn't make it more confusing
            // If my explanation sucks, consult Mr. Wikipedia https://en.wikipedia.org/wiki/Discrete_cosine_transform

            // This iterates through an 8x8 grid which can represent the 64 2D DCT basis functions, each with progressively higher cosine frequencies on each axis
            for (let i=0; i<chunk_width; i++) {
                for (let j=0; j<chunk_height; j++) {
                    // The sum, which is how much the DCT basis function contributes to the block of pixels
                    let sum = 0.0
        
                    // The sum is scaled by these values
                    // For some reason the functions at i=0 and j=0 are scaled differently, I don't know why
                    let ci, cj;
                    if (i === 0) {
                        ci = 1 / Math.sqrt(chunk_width)
                    } else {
                        ci = Math.sqrt(2) / Math.sqrt(chunk_width)
                    }
                    if (j === 0) {
                        cj = 1 / Math.sqrt(chunk_height)
                    } else {
                        cj = Math.sqrt(2) / Math.sqrt(chunk_height)
                    }      
        
                    // Compare each pixel in the block with the values of the DCT function based on i and j
                    for (let x=0; x<chunk_width; x++) {
                        for (let y=0; y<chunk_height; y++) {
                            // The original pixel value (minus 128 so that it is centered around zero, ranging from -128 to 128 for a 0-255 original value)
                            let term = block[(y*chunk_width)+x]-128
        
                            // Cos ranges from -1 to 1
        
                            // k = the x position of the pixel in the image chunk
                            // l = the y position of the pixel in the image chunk
                            // i = the x frequency of the function / where the basis function would be on the x axis if it was on a table
                            // j = the y frequency of the function / where the basis function would be on the y axis if it was on a table
                            // chunk_width and chunk_height are the width and height of the size of a chunk of pixels
        
                            // The pixel value is multiplied by a point on the 2D DCT base function on each axis
                            term *= Math.cos(((2 * x + 1) * i * Math.PI) / (2 * chunk_width))
                            term *= Math.cos(((2 * y + 1) * j * Math.PI) / (2 * chunk_height))
        
                            // More pixel values that align with the points on the functions they are compared to means
                            // that the function contributes more to the chunk of pixels
                            sum += term
                        }
                    }
        
        
                    let coefficient = ci * cj * sum
                    //console.log(sum)
        
                    let quantized = Math.round(coefficient / QUANTIZATION_VALUES[i][j])
        
                    // Quantized are rarely above 64 or below -64, but clamp just in case
                    if (64 < quantized) {
                        quantized = 64
                    } else if (quantized < -64) {
                        quantized = -64
                    }
        
                    coefficients[(j*chunk_width)+i] = quantized
                }
            }
        
            // Now we have a 2D array of coefficients
        
            return coefficients
        }

        // Takes an array of coefficients from the DCT algorithm and compresses it using a simple algorithm
        function compressCoefficients(coefficients) {
            let output = [];
            let zero_run = 0;

            for (let c of coefficients) {
                if (c === 0) { // Coefficient is zero, the most common. BEWARE OF NEGATIVE ZEROES.
                    zero_run++
                } else {
                    if (0 < zero_run) { // If there is a run of zeroes, seal it off and reset
                        output.push(zero_run+64)
                        zero_run = 0
                    }

                    if (c < 0) { // Coefficient ranges from -64 to -1
                        output.push(c+64)
                    } else if (0 < c) { // Coefficient ranges from 1 to 64
                        output.push(c+127)
                    }
                }
            }
            
            // Any runs of zeroes at the end of the array will not be stored since the else condition would not be activated
            // This is fine because the de-compressor assumes any information that is not filled in is zero, this also makes
            // the system slightly more efficient because it saves one byte for every block with a run of zeroes at the end 
            // of its array

            return output
        }


        let data_arr = [];

        // Gets the value of a channel (R,G,B,A..., 0,1,2,3...) from a pixel in the flat array representing the texture
        function getPixelChannelFromFlattened(x, y, width, channel, channels=4) {
            let start = (y*(width*channels))+(x*channels)
            return raw[start+channel]
        }

        const startTime = performance.now()

        let blocks_iterated = 0;
        for (let channel=0; channel<4; channel++) {

            for (let chunk_x=0; chunk_x<width; chunk_x+=8) {
                for (let chunk_y=0; chunk_y<height; chunk_y+=8) {

                    // Make temporary 8x8 2d array to represent chunk
                    let chunk_data = Array(8*8).fill(0);

                    for (let chunk_px_x=0; chunk_px_x<8; chunk_px_x++) {
                        for (let chunk_px_y=0; chunk_px_y<8; chunk_px_y++) {
                            // The texture data is flattened, so find from x and y
                            let channel_val = getPixelChannelFromFlattened(
                                chunk_x+chunk_px_x, 
                                chunk_y+chunk_px_y, 
                                width,
                                channel,
                                4
                            );

                            chunk_data[(chunk_px_x*8)+chunk_px_y] = channel_val
                        }
                    }

                    // Now compress the chunk with Discrete Cosine Transform (DCT)
                    let dct = compressDCT(chunk_data, 8, 8)
                    // The prevous step doesn't actually compress the data, it just makes this next step easier
                    let compressed_coeffs = compressCoefficients(dct);

                    // Length of compressed chunk
                    data_arr.push(compressed_coeffs.length)

                    // Write compressed chunk data
                    for (let b of compressed_coeffs) {
                        data_arr.push(b)
                    }

                    blocks_iterated++
                }

                if ((chunk_x/256) == Math.round(chunk_x/256)) {
                    await updateProgress("Compressing texture", "blocks", blocks_iterated, ((width/8)*(height/8))*4)
                }
            }
            
        }

        const endTime = performance.now()
        console.log(`Texture compression ${endTime - startTime} ms`)

        // 25366-25601-28395 before
        // 22263 after

        return data_arr
    }

    async decompressTexture(compressed, width, height) {

        // Takes a flattened compressed array of coefficients and decompresses it into an array of pixels
        function decompressDCT(compressed, chunk_width=8, chunk_height=8) {
            let decompressed = new Array(chunk_width*chunk_height).fill(0)

            for (let k=0; k<chunk_width; k++) {
                for (let l=0; l<chunk_height; l++) {

                    let sum = 0.0;

                    // Apply function and amount
                    for (let i=0; i<chunk_height; i++) {
                        for (let j=0; j<chunk_width; j++) {
                            let ci, cj;
                            if (i === 0) {
                                ci = 1 / Math.sqrt(chunk_width)
                            } else {
                                ci = Math.sqrt(2) / Math.sqrt(chunk_width)
                            }
                            if (j === 0) {
                                cj = 1 / Math.sqrt(chunk_height)
                            } else {
                                cj = Math.sqrt(2) / Math.sqrt(chunk_height)
                            }
                                        // Compressed array is flat, so index is found from i and j (x and y)
                            let term = compressed[(j*chunk_width)+i] * QUANTIZATION_VALUES[i][j] * ci * cj
                            term *= Math.cos(((2 * k + 1) * i * Math.PI) / (2 * chunk_width))
                            term *= Math.cos(((2 * l + 1) * j * Math.PI) / (2 * chunk_height))

                            sum += term
                        }
                    }

                    // Sometimes the decompressed value will be slightly over 255 or below 0, so it needs to be clamped

                    let value = Math.round(sum+128)

                    if (255 < value) {
                        value = 255
                    } else if (value < 0) {
                        value = 0
                    }

                    // Should be close to the pixel before it was compressed
                    // The decompressed array should be flat, so k and l (x and y) should be converted to an index
                    decompressed[(k*chunk_width)+l] = value
                }
            }

            return decompressed
        }

        // Reverse of compressCoefficients
        function decompressCoefficients(compressed) {
            let coefficients = [];

            for (let byte of compressed) {
                if (byte < 64) {
                    coefficients.push(byte-64)
                }

                if (64 <= byte && byte < 128) {
                    let zero_run_length = byte-64
                    for (let r=0; r<zero_run_length; r++) {
                        coefficients.push(0)
                    }
                }

                if (128 <= byte && byte < 192) {
                    coefficients.push(byte-127)
                }
            }

            // As mentioned in the compressor, runs of zeros at the ends of arrays of coefficients are not stored
            // because the decompressor (this) will fill any missing data with zeroes anyways
            let missing_coeffs = 64-coefficients.length;
            for (let i=0; i<missing_coeffs; i++) {
                coefficients.push(0)
            }

            return coefficients
        }


        let bh = new ByteHandler(compressed)

        // Texture data (split into compressed blocks)
        let texture_data = new Uint8Array(new ArrayBuffer(width*height*4))

        // Sets the value of a channel (R,G,B,A..., 0,1,2,3...) of a pixel in a flattened array representing a texture
        function setPixelChannelFromFlattened(value, x, y, width, channel, channels=4) {
            let start = (y*(width*channels))+(x*channels)
            texture_data[start+channel] = value
        }

        let channels = 4;

        let blocks_iterated = 0;
        for (let channel=0; channel<4; channel++) {
            for (let block_x=0; block_x<width; block_x+=8) {
                for (let block_y=0; block_y<height; block_y+=8) {

                    let block_len = bh.next_byte();
                    let decompressed_coeffs = decompressCoefficients(bh.next_bytes(block_len));
                    let decompressed_block = decompressDCT(decompressed_coeffs);
                    //console.log(decompressed_block)
                    for (let b=0; b<decompressed_block.length; b++) {
                        let block_px_x = b % 8;
                        let block_px_y = Math.floor(b/8);

                        texture_data[
                            (
                                (block_y+block_px_y)*
                                (width*channels)
                            )+(
                                (block_x+block_px_x)
                                *channels
                            )+channel
                        ] = decompressed_block[b]
                    }

                    blocks_iterated++
                }

                await updateProgress("Decompressing texture", "blocks", blocks_iterated, ((width/8)*(height/8))*4)
            }

        }

        return texture_data
    }

    // Encodes the world data to binary
    serialize() {
        // I just love working with binary man its so cool

        // Encode an unsigned (positive) integer to an array of integers that can be easily converted to bytes
        // The range supported depends on the number of bytes it is allowed to use, equal to 255 to the power of the allowed bytes
        // Basically it converts a positive integer to base 255
        function encode_uint(bytes, integer) {
            // Start with an array of 0s so that unfilled places will be 0
            let encoded = Array(bytes).fill(0);

            let int_div = Math.round(integer) // Im struggling to come up with variable names here

            for (let b=0; b<bytes; b++) {
                // Get the floor of the integer / 255 and the remainder
                // the remainder will fit in the 0-255 range, so insert it
                // the floored quotient will go through the process again
                // until it fits

                let remainder = int_div % 255
                int_div = Math.floor(int_div / 255)
    
                encoded[b] = remainder

                // If the floored quotient fits in the 0-255 range, insert it, and stop the loop
                if (int_div < 256) {
                    encoded[b+1] = int_div

                    break
                }
            }

            // What you get is an array of integers which can be converted to bytes
            // The sum of the numbers times 255 to the power of their index in the array will be equal to the original

            // If the integer is too large to be represented by the bytes allowed, it will simply be capped off to the
            // maximum of the range that can be represented

            return encoded
        }

        // Encodes a number within a specified range. Precision equal to (most-least)/(255^2)
        function encode_custom_range(num, least, most, allowed_bytes=2) {
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

            // Expand to the range supported by the number of bytes allowed, or 255 to the power of the number of allowed bytes
            value *= (Math.pow(255, allowed_bytes) / from_zero_maximum)

            // Any unsupported precision is rounded off
            // For this, whole number encoding is used which takes two bytes and can encode any whole number from 0 to 255^2
            // I could have decided to use the 4 byte encode num which supports even more precision, but this would be excessive
            // since even a range of 0 to 100 would have a precision of 100/255^2 or ~0.0015. Seems like plenty to me
            return encode_uint(allowed_bytes, Math.round(value))
        }

        // Encodes a nonnegative floating value from 0 and 255^2 with a precision of 1/(255^2). Returns four bytes
        function encode_num(num) {
            let whole = Math.floor(num)
            let frac = num - whole

            console.log(Math.round(frac * Math.pow(255, 2)))

            return [
                ...encode_uint(2, whole),
                ...encode_uint(2, Math.round(frac * Math.pow(255, 2)))
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

        // Where to place the camera if loaded in an editor
        data_arr.push(...encode_num(this.camera.position.x+(this.LIMIT/2)))
        data_arr.push(...encode_num(this.camera.position.y+(this.LIMIT/2)))
        data_arr.push(...encode_num(this.camera.position.z+(this.LIMIT/2)))

        // Where to place the camera if loaded in an viewer or game
        data_arr.push(...encode_num(0))
        data_arr.push(...encode_num(0))
        data_arr.push(...encode_num(0))


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
            data_arr.push(...encode_uint(2, model.tris.length))
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
            data_arr.push(...encode_uint(2, material.texture_width))
            data_arr.push(...encode_uint(2, material.texture_height))

            // Pixel channel ranges
            // 1 channel = greyscale
            // 3 channels = RGB
            // 4 channels = RGBA
            // 5 channels = RGBA with roughness map
            // 6 channels = RGBA with rough map and bump/height map
            data_arr.push(4)
            
            // The textures are pre-compressed, so they can just be added to the file as is

            // Total length of texture in bytes
            data_arr.push(...encode_uint(3, material.textures.diffuse.length))
            // The texture data itself (too many elements to push)
            data_arr = data_arr.concat(material.textures.diffuse)
        }


        console.log(data_arr.length, "num obj", Object.keys(this.data.space.objects).length)


        // Number of objects (maximum count of 255^2, 2 bytes)
        data_arr.push(...encode_uint(2, Object.keys(this.data.space.objects).length));

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

    async fromSerial(raw) {
        let bh = new ByteHandler(new Uint8Array(raw))

        // Reverse of encode_int. Takes an array of integers from 0-255 representing bytes returned from encode_int
        // and turns it back into the original unsigned integer
        function decode_uint(byte_array) {
            let decoded = 0;

            let byte_index = 0
            for (let byte of byte_array) {
                decoded += byte * Math.pow(255, byte_index)
                byte_index++
            }

            return decoded
        }

        // Decodes a number within a specified range
        function decode_custom_range(byte_pair, least, most) {
            let value = decode_uint(byte_pair)
            
            let from_zero_maximum = most-least // The maximum value if the range is offset to be above zero

            // Encoded value is still within the supported range of 255^2
            // Crunch it back down to the original range
            value /= (Math.pow(255, 2) / from_zero_maximum)

            value += least // Offset value back to the original minumum

            return value
        }

        // Decodes a nonnegative floating value from four bytes
        function decode_num(byte_array) {
            let whole = decode_uint([byte_array[0], byte_array[1]])
            let frac = decode_uint([byte_array[2], byte_array[3]]) / Math.pow(255, 2)

            return whole + frac
        }


        


        // Title, obviously
        let title_size = bh.next_byte();
        this.data.title = utf8decoder.decode(bh.next_bytes(title_size));
        console.log(this.data.title)

        // Version number
        this.data.version = bh.next_byte(); // Hopefully by version 255 no further changes will be needed *shrug*
        console.log(this.data.version)


        // Apply saved position to editor camera
        this.camera.position.x = decode_num(bh.next_bytes(4))-(this.LIMIT/2)
        this.camera.position.y = decode_num(bh.next_bytes(4))-(this.LIMIT/2)
        this.camera.position.z = decode_num(bh.next_bytes(4))-(this.LIMIT/2)

        // The following 12 bytes tell where to place the camera if loaded in a viewer or game. Skipped because this is an editor, not a plain viewer or game
        bh.next_bytes(12)
        

        // Models

        let model_count = bh.next_byte();
        console.log(model_count)
        
        for (let model_id=0; model_id<model_count; model_id++) {
            let model_parsed = {"tris":[]}

            // Model name
            let model_name_size = bh.next_byte();
            model_parsed.name = utf8decoder.decode(bh.next_bytes(model_name_size));
            console.log(model_parsed.name)

            // Model tris
            let triangle_count = decode_uint(bh.next_bytes(2))
            console.log(triangle_count)
            for (let t=0; t<triangle_count; t++) {
                let triangle = [];

                // Triangle vertices
                for (let v=0; v<3; v++) {
                    triangle.push([
                        [
                            decode_custom_range(bh.next_bytes(2), -0.5, 0.5), // Vertex position
                            decode_custom_range(bh.next_bytes(2), -0.5, 0.5),
                            decode_custom_range(bh.next_bytes(2), -0.5, 0.5)
                        ],

                        [
                            decode_custom_range(bh.next_bytes(2), -1, 1), // Vertex norms
                            decode_custom_range(bh.next_bytes(2), -1, 1),
                            decode_custom_range(bh.next_bytes(2), -1, 1)
                        ],

                        [
                            decode_custom_range(bh.next_bytes(2), 0, 1), // Vertex UV coords
                            decode_custom_range(bh.next_bytes(2), 0, 1)
                        ]
                    ])
                }

                model_parsed.tris.push(triangle)
            }

            this.data.assets.models[model_id] = model_parsed
            console.log(model_parsed)
        }


        // Materials

        let material_count = bh.next_byte();
        console.log(material_count)
        
        for (let mat_id=0; mat_id<material_count; mat_id++) {
            let material_parsed = {}

            // Material name
            let material_name_size = bh.next_byte();
            material_parsed.name = utf8decoder.decode(bh.next_bytes(material_name_size));
            console.log(material_parsed.name)

            // Texture UV scale
            material_parsed["scale"] = [
                decode_num(bh.next_bytes(4)),
                decode_num(bh.next_bytes(4))
            ]

            // RGBA color tint
            material_parsed["tint"] = bh.next_bytes(4)

            // Other material settings

            if (bh.next_byte() === 255) { // Stretch
                material_parsed["stretch"] = true
            } else {
                material_parsed["stretch"] = false
            }

            if (bh.next_byte() === 255) { // Shading
                material_parsed["shading"] = true
            } else {
                material_parsed["shading"] = false
            }

            // Texrure resolution
            let tex_resolution_x = decode_uint(bh.next_bytes(2))
            let tex_resolution_y = decode_uint(bh.next_bytes(2))

            material_parsed["texture_width"] = tex_resolution_x;
            material_parsed["texture_height"] = tex_resolution_y;

            // Number of channels from 1 to 6, greyscale to RGBA with material maps (details in encoder)
            let num_channels = bh.next_byte()

            let texture_size = decode_uint(bh.next_bytes(3))

            // Texture data (decompressed later when texture is loaded)
            let texture_data = bh.next_bytes(texture_size)

            //for (let b=0; b<(tex_resolution_x*tex_resolution_y*4); b++) {
            //    texture_data[b] = bh.next_byte()
            //}

            material_parsed["textures"] = {"diffuse":texture_data}

            this.data.assets.materials[mat_id] = material_parsed
        }


        // Objects

        function decode_radians(byte_pair) {
            let squished = decode_custom_range(byte_pair, 0, 1)
            let degrees = squished * 360
            let radians = degrees * (Math.PI / 180)

            return radians
        }

        let object_count = decode_uint(bh.next_bytes(2))

        for (let i=0; i<object_count; i++) {
            let new_object_id = this.newPart();
            let new_object = this.getObjectByID(new_object_id);
    
            new_object.position[0] = decode_num(bh.next_bytes(4))-(this.LIMIT/2);
            new_object.position[1] = decode_num(bh.next_bytes(4))-(this.LIMIT/2);
            new_object.position[2] = decode_num(bh.next_bytes(4))-(this.LIMIT/2);
    
            new_object.scale[0] = decode_num(bh.next_bytes(4));
            new_object.scale[1] = decode_num(bh.next_bytes(4));
            new_object.scale[2] = decode_num(bh.next_bytes(4));
    
            new_object.rotation[0] = decode_radians(bh.next_bytes(2));
            new_object.rotation[1] = decode_radians(bh.next_bytes(2));
            new_object.rotation[2] = decode_radians(bh.next_bytes(2));

            new_object.model = bh.next_byte();
            new_object.material = bh.next_byte();

            console.log(new_object.position, new_object.scale, new_object.rotation)

            this.manifest(new_object_id);
        }
    }
}