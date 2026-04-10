import * as THREE from 'three';
import { KScript } from './scripting.js';


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

export function closeProgressBar() {
    progress_popup.hidden = true
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



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



// A simple class for handling byte arrays byte by byte, chunk by chunk
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


// There's way too much code in this alone to put in the World class; hopefully separating it lessens confusion
export class DCTEncoder {
    constructor() {
        // Cos calculations needed for the DCT algorithm would slow down encoding, so pre-calculate and put into arrays instead (seriously it cuts the encoding time in half)
        this.enc_precalculate_x = Array.from(Array(8), () => new Array(8))
        for (let func_x=0; func_x<8; func_x++) {
            for (let px_x=0; px_x<8; px_x++) {
                this.enc_precalculate_x[func_x][px_x] = Math.cos(((2 * px_x + 1) * func_x * Math.PI) / (2 * 8))
            }
        }

        this.enc_precalculate_y = Array.from(Array(8), () => new Array(8))
        for (let func_y=0; func_y<8; func_y++) {
            for (let px_y=0; px_y<8; px_y++) {
                this.enc_precalculate_y[func_y][px_y] = Math.cos(((2 * px_y + 1) * func_y * Math.PI) / (2 * 8))
            }
        } 
        
        
        // 50% compression ratio quantization values from JPEG standard
        this.QUANTIZATION_VALUES = [
            [16,11,10,16,24,40,51,61],
            [12,12,14,19,26,58,60,55],
            [14,13,16,24,40,57,69,56],
            [14,17,22,29,51,87,80,62],
            [18,22,37,56,68,109,103,77],
            [24,35,55,64,81,104,113,92],
            [49,64,78,87,103,121,120,101],
            [72,92,95,98,112,100,103,99]
        ]
    }


    // Takes a block of 8x8 pixels and performs Discrete Cosine Transform (DCT)
    compressDCT(block, block_width=8, block_height=8) {
        let coefficients = new Array(block_width*block_height).fill(0)
    
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
        for (let func_x=0; func_x<block_width; func_x++) {
            for (let func_y=0; func_y<block_height; func_y++) {
                // The sum, which is how much the DCT basis function contributes to the block of pixels
                let sum = 0.0
    
                // The sum is scaled by these values
                // For some reason the functions at func_x=0 and func_y=0 are scaled differently, I don't know why
                let ci, cj;
                if (func_x === 0) {
                    ci = 1 / Math.sqrt(block_width)
                } else {
                    ci = Math.sqrt(2) / Math.sqrt(block_width)
                }
                if (func_y === 0) {
                    cj = 1 / Math.sqrt(block_height)
                } else {
                    cj = Math.sqrt(2) / Math.sqrt(block_height)
                }      
    
                // Compare each pixel in the block with the values of the DCT function based on i and j
                for (let px_x=0; px_x<block_width; px_x++) {
                    for (let px_y=0; px_y<block_height; px_y++) {
                        // The original pixel value (minus 128 so that it is centered around zero, ranging from -128 to 128 for a 0-255 original value)
                        let term = block[(px_y*block_width)+px_x]-128
    
                        // Cos ranges from -1 to 1
    
                        // px_x = the x position of the pixel in the image chunk
                        // px_y = the y position of the pixel in the image chunk
                        // func_x = the x frequency of the function / where the basis function would be on the x axis if it was on a table
                        // func_y = the y frequency of the function / where the basis function would be on the y axis if it was on a table
                        // block_width and block_height are the width and height of the size of a chunk of pixels
    
                        // The pixel value is multiplied by a point on the 2D DCT base function on each axis
                        // For optimization, this has already been calculated and put into arrays
                        term *= this.enc_precalculate_x[func_x][px_x] //Math.cos(((2 * px_x + 1) * func_x * Math.PI) / (2 * block_width))
                        term *= this.enc_precalculate_y[func_y][px_y] //Math.cos(((2 * px_y + 1) * func_y * Math.PI) / (2 * block_height))
    
                        // More pixel values that align with the points on the functions they are compared to means
                        // that the function contributes more to the chunk of pixels
                        sum += term
                    }
                }
    
    
                let coefficient = ci * cj * sum
                //console.log(sum)
    
                let quantized = Math.round(coefficient / this.QUANTIZATION_VALUES[func_x][func_y])
    
                // Quantized are rarely above 64 or below -64, but clamp just in case
                if (64 < quantized) {
                    quantized = 64
                } else if (quantized < -64) {
                    quantized = -64
                }
    
                coefficients[(func_y*block_width)+func_x] = quantized
            }
        }
    
        // Now we have a 2D array of coefficients
    
        return coefficients
    }

    // Compresses a raw texture stored in an array to a compressed texture stored in an array
    async compressTexture(raw, width, height) { 
        let output = [];

        // Using ycbcr instead of RBG makes the dct compression more efficient
        function RGBtoYCBCR(r, g, b) {
            let y = 16 + (0.257*r) + (0.504*g) + (0.098*b);
            let cb = 128 + (-0.148*r) + (-0.291*g) + (0.439*b);
            let cr = 128 + (0.439*r) + (-0.368*g) + (-0.071*b);
            return [
                Math.round(y),
                Math.round(cb),
                Math.round(cr)
            ]
        }

        // The raw channel data. The raw RGBA data will be converted to YCBCR and separated into channels and stored here
        let channels = [
            // Any of these can be replaced with null to omit the channel
            new Array(), // The Y (luminance) channel of YCBCR
            new Array(), // The Cb color channel of YCBCR
            new Array(), // The Cr color channel of YCBCR
            null // Transparency
        ]

        // Convert RGB(a) values to YCBCR and separate first
        for (let p=0; p<raw.length; p+=4) {
            let pixel_rgb = raw.slice(p, p+3); // Get RGB
            let alpha = p+4;
            let pixel_ycbcr = RGBtoYCBCR(...pixel_rgb);

            // If an individual channel is to be ignored or omitted, it will not appear in the channels object and will be excluded from the output

            if (channels[0] !== null) {
                channels[0].push(pixel_ycbcr[0])
            }

            if (channels[1] !== null) {
                channels[1].push(pixel_ycbcr[1])
            }

            if (channels[2] !== null) {
                channels[2].push(pixel_ycbcr[2])
            }

            if (channels[3] !== null) {
                channels[3].push(alpha)
            }
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

        const startTime = performance.now()

        console.log(channels)

        let blocks_iterated = 0;
        for (let channel=0; channel<4; channel++) {
            if (channels[channel] === null) {
                output.push(null)
                continue
            }

            output.push(new Array())

            for (let chunk_x=0; chunk_x<width; chunk_x+=8) {
                for (let chunk_y=0; chunk_y<height; chunk_y+=8) {

                    // Make temporary 8x8 2d array to represent chunk
                    let chunk_data = Array(8*8).fill(0);

                    for (let chunk_px_x=0; chunk_px_x<8; chunk_px_x++) {
                        for (let chunk_px_y=0; chunk_px_y<8; chunk_px_y++) {
                            // The channel data is flattened, so the index corresponding pixel location is calculated like this
                            let px = chunk_x+chunk_px_x;
                            let py = chunk_y+chunk_px_y;
                            let index = (py*width)+(px)                            

                            // Insert it into the chunk data
                            chunk_data[(chunk_px_x*8)+chunk_px_y] = channels[channel][index]
                        }
                    }

                    // Now compress the chunk with Discrete Cosine Transform (DCT)
                    let dct = this.compressDCT(chunk_data, 8, 8)
                    // The prevous step doesn't actually compress the data, it just makes this next step more efficient
                    let compressed_coeffs = compressCoefficients(dct);

                    // Length of compressed chunk
                    output[channel].push(compressed_coeffs.length)

                    // Write compressed chunk data
                    for (let b of compressed_coeffs) {
                        output[channel].push(b)
                    }

                    blocks_iterated++
                }

                // Update progress every 256 blocks
                if ((chunk_x/256) == Math.round(chunk_x/256)) {
                    await updateProgress("Compressing texture", "blocks", blocks_iterated, ((width/8)*(height/8))*4)
                }
            }
            
        }

        closeProgressBar()

        const endTime = performance.now()
        console.log(`Texture compression ${endTime - startTime} ms`)

        return output
    }



    // Takes a flattened compressed array of coefficients from DCT and decompresses it into an array of pixels
    decompressDCT(compressed, block_width=8, block_height=8) {
        let decompressed = new Array(block_width*block_height).fill(0)

        for (let px_x=0; px_x<block_width; px_x++) {
            for (let px_y=0; px_y<block_height; px_y++) {

                let sum = 0.0;

                // Apply function and amount
                for (let func_x=0; func_x<block_height; func_x++) {
                    for (let func_y=0; func_y<block_width; func_y++) {
                        let ci, cj;
                        if (func_x === 0) {
                            ci = 1 / Math.sqrt(block_width)
                        } else {
                            ci = Math.sqrt(2) / Math.sqrt(block_width)
                        }
                        if (func_y === 0) {
                            cj = 1 / Math.sqrt(block_height)
                        } else {
                            cj = Math.sqrt(2) / Math.sqrt(block_height)
                        }

                        let term = compressed[(func_y*block_width)+func_x] * this.QUANTIZATION_VALUES[func_x][func_y] * ci * cj
                        term *= this.enc_precalculate_x[func_x][px_x] //Math.cos(((2 * k + 1) * func_x * Math.PI) / (2 * block_width))
                        term *= this.enc_precalculate_y[func_y][px_y] //Math.cos(((2 * l + 1) * func_y * Math.PI) / (2 * block_height))

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
                decompressed[(px_x*block_width)+px_y] = value
            }
        }

        return decompressed
    }

    async decompressTexture(compressed_channels, width, height) {

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


        // Texture data (split into compressed blocks)
        let texture_data = new Uint8Array(new ArrayBuffer(width*height*4))

        let blocks_iterated = 0;
        let channel_index = 0;
        for (let channel=0; channel<4; channel++) {
            if (compressed_channels[channel] === null) {
                continue
            }

            console.log(compressed_channels)

            let bh = new ByteHandler(compressed_channels[channel])

            for (let block_x=0; block_x<width; block_x+=8) {
                for (let block_y=0; block_y<height; block_y+=8) {

                    let block_len = bh.next_byte();
                    let decompressed_coeffs = decompressCoefficients(bh.next_bytes(block_len));
                    let decompressed_block = this.decompressDCT(decompressed_coeffs);
                    //console.log(decompressed_block)
                    for (let b=0; b<decompressed_block.length; b++) {
                        // Calculate the location of the pixel within the block from the byte index like this
                        let block_px_x = b % 8;
                        let block_px_y = Math.floor(b/8);

                        // Pixel location within whole image, not just its block
                        let px = block_x+block_px_x;
                        let py = block_y+block_px_y;

                        let value = decompressed_block[b];

                        let start_index = (py*(width*4))+(px*4)
                        texture_data[start_index+channel_index] = value
                    }

                    blocks_iterated++
                }

                // Update progress every 256 blocks
                if ((block_x/256) == Math.round(block_x/256)) {
                    await updateProgress("Decompressing texture", "blocks", blocks_iterated, ((width/8)*(height/8))*4)
                }                
            }

            channel_index++
        }





        function YCBCRtoRGB(y, cb, cr) {
            let r = 1.164*(y-16) + 1.596*(cr-128)
            let g = 1.164*(y-16) + -0.392*(cb-128) + -0.812*(cr-128);
            let b = 1.164*(y-16) + 2.017*(cb-128)

            return [ // Clamp and round. Looks a tad shit innit
                Math.min(Math.max(Math.round(r), 0), 255),
                Math.min(Math.max(Math.round(g), 0), 255),
                Math.min(Math.max(Math.round(b), 0), 255)
            ]
        }

        //console.log(compressed_channels)
        let default_channel_values = [128, 128, 128, 255]

        // Convert YCBCR back to RGB
        for (let p=0; p<texture_data.length; p+=4) {
            let pixel = texture_data.slice(p, p+4);

            // Iterate over all color channels
            for (let c=0; c<4; c++) {
                if (compressed_channels[c] === null) { // If the channel is empty, use default value for that channel
                    pixel[c] = default_channel_values[c]
                }
            }

            let pixel_rgb = YCBCRtoRGB(pixel[0], pixel[1], pixel[2]);
            let alpha = pixel[3];
            

            //console.log(pixel)

            texture_data[p+0] = pixel_rgb[0]
            texture_data[p+1] = pixel_rgb[1]
            texture_data[p+2] = pixel_rgb[2]
            texture_data[p+3] = alpha
        }

        closeProgressBar()

        return texture_data
    }
}




export class World {
    constructor(mode='editor') {
        this.mode = mode;
    }

    async initialize() {
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

        window.addEventListener("resize", () => {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        });

        this.dct_encoder = new DCTEncoder()


        this.title = "Unnamed Kodiak Project"
        this.version = 2

        this.objects = {};
        this.materials = [];
        this.models = [];

        this.script = new KScript(this);

        //console.log(this.materials)

        if (true) {
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
                //await this.importModelByURL("/kodiak/assets/models/special/skybox.obj", "Skybox");
                //await this.importModelByURL("/kodiak/assets/models/special/decimated.obj", "Terrain");
            }

            // Preload default textures (remove later)
            //await this.importMaterialByURL("/kodiak/assets/textures/sunset.png", "Sky");
            //this.materials[0].stretch = true
            //this.materials[0].shading = false
            await this.importMaterialByURL("/kodiak/assets/textures/plain_color_tile.png", "PlainColorTile");
            await this.importMaterialByURL("/kodiak/assets/textures/alpha_test.png", "AlphaTest");
            await this.importMaterialByURL("/kodiak/assets/textures/color_test.png", "ColorTest");

            

            // Temporary stuff
            let terrain = this.newObject()
            await this.setModel(terrain.object_id, 0) // 10
            await this.setMaterial(terrain.object_id, 0)
            terrain.scale.x = 2048
            terrain.scale.y = 64
            terrain.scale.z = 2048
            terrain.position.y = -40 //
            this.updateUVs(terrain.object_id)
            console.log(terrain.object_id, this.objects)

            let person_size_ref = this.newObject()
            await this.setModel(person_size_ref.object_id, 0)
            await this.setMaterial(person_size_ref.object_id, 0)
            person_size_ref.scale.x = .8
            person_size_ref.scale.y = 1.8
            person_size_ref.scale.z = .8
            this.updateUVs(person_size_ref.object_id)
            console.log(person_size_ref.object_id, this.objects)
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

        // How far the furthest point is on each axis and direction
        let boundaries_positive = [0, 0, 0];
        let boundaries_negative = [0, 0, 0];

        let lines_iterated = 0;
        let lines = raw.split("\n");
        for (let line of lines) {
            let segments = line.split(" ");
            let line_type = segments[0];
            if (line_type == "v") {
                let position = [
                    parseFloat(segments[1]), 
                    parseFloat(segments[2]), 
                    parseFloat(segments[3])
                ]

                points.push(position)

                // If point is further than any previous point from the origin, update furthest
                for (let a=0; a<3; a++) {
                    if (boundaries_positive[a] < position[a]) {
                        boundaries_positive[a] = position[a]
                    }

                    if (boundaries_negative[a] > position[a]) {
                        boundaries_negative[a] = position[a]
                    }
                }
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

        // If there are points outside of the 1x1x1 area, the model may need to be scaled
        let scale = [];
        let offset = [];
        for (let a=0; a<3; a++) { // Calculate how much vertices should be scaled to stay in the 1x1x1 area
            let boundary_size = (boundaries_positive[a] - boundaries_negative[a]) // How much space between the furthest vertices in opposite directions on this axis
            let boundary_center = (boundaries_negative[a] + boundaries_positive[a]) / 2 // The average of the two will be the center on that axis. That's how much the mesh will be offset
            scale.push(1/boundary_size)
            offset.push(boundary_center)
        }

        // Scale vertices
        for (let a=0; a<3; a++) {
            for (let point of points) {
                point[a] -= offset[a]
                point[a] *= scale[a]
            }
        }

        console.log(`Obj model "${model_name}" loaded`)

        object.model_id = this.models.length

        this.models.push(object)
    }

    async importModelByURL(filename, model_name) {
        let request = await fetch(filename);
        let raw = await request.bytes();

        this.importModel(raw, model_name)
    }

    // Gets the first model with the specified name
    getModelIDByName(name) {
        for (let model of this.models) {
            let model_id = model.model_id;
            if (this.models[model_id].name.toLowerCase() === name.toLowerCase()) {
                return model_id
            }
        }
    }


    newMaterial(name) {
        let material = new THREE.MeshLambertMaterial({
            transparent: true,
            depthTest: true,
            alphaTest: 0.5
        });

        material.name = name
        material.material_id = this.materials.length;
        this.materials.push(material)

        return material
    }

    async setMaterialTexture(material, compressed, width, height) {
        let decompressed = await this.dct_encoder.decompressTexture(compressed, width, height)

        let diffuse = new THREE.DataTexture(
            decompressed,
            width, 
            height, 
            THREE.RGBAFormat
        );

        diffuse.flipY = true;
        diffuse.wrapS = THREE.RepeatWrapping;
        diffuse.wrapT = THREE.RepeatWrapping;
        diffuse.colorSpace = THREE.SRGBColorSpace; // So the textures dont look washed out
        diffuse.minFilter = THREE.LinearMipmapLinearFilter;
        diffuse.magFilter = THREE.LinearFilter;

        diffuse.needsUpdate = true;

        // Store pre-compressed for quick saving later
        diffuse.pre_compressed = compressed
        // Add resolution tags
        diffuse.width = width
        diffuse.height = height

        material.map = diffuse
    }

    // Creates a new material from an imported image file
    async importMaterial(data, material_name="Untitled Model", downres=1) {
        // Accepts common image files

        // I have to convert the data to base 64 so the browser can take it and convert it back into binary. So fucking stupid.
        let base64 = URL.createObjectURL(
            new Blob([data], {type: 'application/octet-binary'})
        );

        let image_obj = new Image();
        image_obj.src = base64;
        await image_obj.decode();

        // Create canvas like this because there is no better way that I know of
        let img_canvas = document.createElement("canvas");
        img_canvas.width = image_obj.width;
        img_canvas.height = image_obj.height;
        let img_ctx = img_canvas.getContext("2d");
        img_ctx.drawImage(image_obj, 0, 0, image_obj.width/downres, image_obj.height/downres);
        
        // Ok now that I have the image on a canvas I can get the raw pixel data
        let img_data = img_ctx.getImageData(0, 0, image_obj.width/downres, image_obj.height/downres)


        // I know this seems stupid because it'll just be decompressed later but pre-compressing makes 
        // it so that it doesnt take a long time to save to file
        // also textures will look the same as they would after importing the saved file
        let pre_compressed = await this.dct_encoder.compressTexture(img_data.data, image_obj.width/downres, image_obj.height/downres)

        let material = this.newMaterial(material_name)

        await this.setMaterialTexture(material, pre_compressed, image_obj.width/downres, image_obj.height/downres)

        return material
    }

    async importMaterialByURL(filename, material_name, downres=1) {
        let request = await fetch(filename);
        let raw = await request.bytes();

        return await this.importMaterial(raw, material_name, downres)
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
        let object = this.objects[object_id]
        if (object) {
            let material = this.materials[material_id];
            let mat_clone = material.clone() // Using a clone of the loaded material allows you to change attributes of the materials (such as tint/color) of individual objects without making whole separate materials for each object

            //mat_clone.color = new THREE.Color(object.tint[0]/255, object.tint[1]/255, object.tint[2]/255)

            object.material = mat_clone
            object.material_id = material_id

            await this.updateUVs(object_id)
        } else {
            console.warn("Did not set material because no object was given or found")
        }
    }


    async setModel(object_id, model_id) {
        let object = this.objects[object_id]
        console.log(object, this.objects, object_id, model_id)
        if (object) {
            let model = this.models[model_id]; // Kodiak model object

            console.log(model)

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

            
            object.geometry = geometry;
            object.model_id = model_id; // update metadata so uv update works

            object.geometry.needsUpdate = true
            console.log("Set model")
        } else {
            console.warn("Did not set model because no object was given or found")
        }
    }


    getObjectByID(object_id) {
        return this.objects[object_id]
    }


    // Creates an object and returns it
    newObject() {
        let object_id = 0;

        while (object_id in this.objects) {
            object_id++
        }

        let object = new THREE.Mesh();
        object.is_object = true;
        object.object_id = object_id;
        this.scene.add(object);

        // Kodiak tags
        object.model_id = 0
        object.uv_offset = [0, 0]
        object.uv_scale = [1, 1]
        object.auto_uv_scale = true

        this.objects[object_id] = object;

        return object
    }


    async cloneObject(object_id) {
        let object = this.getObjectByID(object_id);

        if (object) {
            let new_object = this.newObject()

            new_object.position.copy(object.position)
            new_object.rotation.copy(object.rotation)
            new_object.scale.copy(object.scale)

            await this.setModel(new_object.object_id, object.model_id)
            await this.setMaterial(new_object.object_id, object.material_id)
        } else {
            console.warn("[Clone object] No object was supplied or found.")
        }
    }

    async delObject(object_id) {
        let object = this.getObjectByID(object_id);

        if (object) {
            this.scene.remove(object);
            delete this.objects[object_id];

        } else {
            console.warn("[!] Action (delete) was not performed; No object was supplied or found.")
        }
    }

    // Updates UVs of mesh to either match the original UVs or scale them to match the scale of the object
    async updateUVs(object_id) {
        let object = this.objects[object_id];
        if (object) {
            let object_model = this.models[object.model_id]

            //console.log(object.model)

            // NEW SYSTEM: vertex normals will be used to determine whether uvs for that vertex should be moved

            let vert_index = 0;

            for (let tri of object_model.tris) {
                for (let vert of tri) {
                    let norm = vert[1];
                    let uv = vert[2];

                    let offset_uv_u = uv[0] + object.uv_offset[0]
                    let offset_uv_v = uv[1] + object.uv_offset[1]

                    if (object.auto_uv_scale) {        
                        let max_norm = Math.max( // With this we can find the most "extreme" value, or the direction the normal most closely faces
                            Math.abs(norm[0]), 
                            Math.abs(norm[1]), 
                            Math.abs(norm[2])
                        )
    
                        if (Math.abs(norm[1]) === max_norm) { // If the vertex normal is non-zero on the y axis, we can assume it is upward / downward facing and can be scaled on the x and z axes
                            //console.log(vert_index, object.scale[0])
                            object.geometry.attributes.uv.array[vert_index*2] = offset_uv_u * (object.scale.x/object.uv_scale[0])
                            object.geometry.attributes.uv.array[(vert_index*2)+1] = offset_uv_v * (object.scale.z/object.uv_scale[1])
                        }
                        if (Math.abs(norm[0]) === max_norm) { //
                            //console.log(vert_index, object.scale[0])
                            object.geometry.attributes.uv.array[vert_index*2] = offset_uv_u * (object.scale.z/object.uv_scale[0])
                            object.geometry.attributes.uv.array[(vert_index*2)+1] = offset_uv_v * (object.scale.y/object.uv_scale[1])
                        }
                        if (Math.abs(norm[2]) === max_norm) { //
                            //console.log(vert_index, object.scale[0])
                            object.geometry.attributes.uv.array[vert_index*2] = offset_uv_u * (object.scale.x/object.uv_scale[0])
                            object.geometry.attributes.uv.array[(vert_index*2)+1] = offset_uv_v * (object.scale.y/object.uv_scale[1])
                        }
                    } else {
                        object.geometry.attributes.uv.array[vert_index*2] = offset_uv_u * object.uv_scale[0]
                        object.geometry.attributes.uv.array[(vert_index*2)+1] = offset_uv_v * object.uv_scale[1]
                    }

                    vert_index++;
                }
            }

            object.geometry.attributes.uv.needsUpdate = true;
        } else {
            console.warn("[Update UVs] No object was supplied or found.")
        }

        //console.log("Finished UV update")
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
        let title_encoded = encode_utf8(this.title)
        data_arr.push(title_encoded.length)
        data_arr.push(...title_encoded);

        // Version number
        data_arr.push(this.version)

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

            // Resolution of textures (max res is a 65k by 65k image, which would be 16 gigabytes uncompressed... I wont even bother adding a resolution check because who the hell uploads a 16 GB texture?
            data_arr.push(...encode_uint(2, material.map.width))
            data_arr.push(...encode_uint(2, material.map.height))
            
            // The textures are pre-compressed and separated into their color channels (Y, Cb, Cr, Alpha (Not RGBA)) so they can just be added to the file as is
            for (let c=0; c<4; c++) {
                // The reader will expect a byte equal to the length of the compressed channel data. There will be 4 sections for each channel.
                // The byte should be 0 if the channel is not included in the texture (common for greyscale textures or textures without transparency)
                if (material.map.pre_compressed[c] === null) {
                    data_arr.push(...encode_uint(3, 0)) // This is inefficient and should probably be replaced at some point
                } else {
                    // Length of channel data in bytes
                    data_arr.push(...encode_uint(3, material.map.pre_compressed[c].length))
                    // If there is any, add the texture data itself (too much data to push)
                    data_arr = data_arr.concat(material.map.pre_compressed[c])
                }                
            }
        }


        console.log(data_arr.length, "num obj", Object.keys(this.objects).length)


        // Number of objects (maximum count of 255^2, 2 bytes)
        data_arr.push(...encode_uint(2, Object.keys(this.objects).length));

        // Objects
        for (let object_id in this.objects) {
            let object = this.objects[object_id];

            //console.log(encode_num(object.position[1]), object.position[1])

            data_arr.push(...encode_num(object.position.x+(this.LIMIT/2))); // Object position (12 bytes)
            data_arr.push(...encode_num(object.position.y+(this.LIMIT/2)));
            data_arr.push(...encode_num(object.position.z+(this.LIMIT/2)));

            data_arr.push(...encode_num(object.scale.x)); // Object scale (12 bytes)
            data_arr.push(...encode_num(object.scale.y));
            data_arr.push(...encode_num(object.scale.z));

            data_arr.push(...encode_radians(object.rotation.x)); // Object rotation (6 bytes)
            data_arr.push(...encode_radians(object.rotation.y));
            data_arr.push(...encode_radians(object.rotation.z));

            data_arr.push(object.model_id);
            data_arr.push(object.material_id);

            // UV offset (0 to 1 expanded to 0 to 255^2)
            data_arr.push(...encode_custom_range(object.uv_offset[0], 0, 1, 2)) // u / x
            data_arr.push(...encode_custom_range(object.uv_offset[0], 0, 1, 2)) // v / y

            // UV scale (up to 255^2 times the original to 1/255^2)
            data_arr.push(...encode_num(object.uv_scale[0])) // u / x
            data_arr.push(...encode_num(object.uv_scale[1])) // v / y

            // Tint / color (RGBA, 0-255 each)
            data_arr.push(Math.round(object.material.color.r*255))
            data_arr.push(Math.round(object.material.color.g*255))
            data_arr.push(Math.round(object.material.color.b*255))
            data_arr.push(255) // Add alpha later

            // UV auto scaling
            if (object.auto_uv_scale) { // 0 or 255 will be used for boolean values. Not efficent but we're dealing with uint8s, not bit by bit.
                data_arr.push(255)
            } else {
                data_arr.push(0)
            }
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


        // Clear everything first
        console.log(this.objects)
        for (let object_id in this.objects) {
            this.scene.remove(this.objects[object_id])
        }
        this.objects = {}
        this.materials = []
        this.models = []


        // Title, obviously
        let title_size = bh.next_byte();
        this.title = utf8decoder.decode(bh.next_bytes(title_size));
        console.log(this.title)

        // Version number
        this.version = bh.next_byte(); // Hopefully by version 255 no further changes will be needed *shrug*
        console.log(this.version)


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

            this.models[model_id] = model_parsed
            console.log(model_parsed)
        }


        // Materials

        let material_count = bh.next_byte();
        console.log(material_count)
        
        for (let mat_id=0; mat_id<material_count; mat_id++) {
            

            // Material name
            let material_name_size = bh.next_byte();
            let material_name = utf8decoder.decode(bh.next_bytes(material_name_size));
            console.log(material_name)

            let material = this.newMaterial(material_name)

            // Texrure resolution // I've decided to leave this typo here as an indicator that I am in fact not a clanker
            let tex_resolution_x = decode_uint(bh.next_bytes(2))
            let tex_resolution_y = decode_uint(bh.next_bytes(2))

            let texture_data = [];

            // Each texture is separated into sections of each of its color channels (Y, Cb, Cr, Alpha (NOT RGBA))
            for (let c=0; c<4; c++) {
                // Each section sould have bytes at the beginning indicating the length of the data for that channel
                let channel_data_size = decode_uint(bh.next_bytes(3))

                // If the length is 0, the channel is not included in the texture and should be omitted
                if (channel_data_size === 0) {
                    texture_data.push(null) // Null indicates an unused channel
                } else {
                    // If there is data for that channel, it should follow immediately after the length byte
                    let channel_data = bh.next_bytes(channel_data_size)
                    texture_data.push(channel_data)
                }
            }

            await this.setMaterialTexture(material, texture_data, tex_resolution_x, tex_resolution_y)
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
            let new_object = this.newObject();
    
            new_object.position.x = decode_num(bh.next_bytes(4))-(this.LIMIT/2);
            new_object.position.y = decode_num(bh.next_bytes(4))-(this.LIMIT/2);
            new_object.position.z = decode_num(bh.next_bytes(4))-(this.LIMIT/2);
    
            new_object.scale.x = decode_num(bh.next_bytes(4));
            new_object.scale.y = decode_num(bh.next_bytes(4));
            new_object.scale.z = decode_num(bh.next_bytes(4));
    
            new_object.rotation.x = decode_radians(bh.next_bytes(2));
            new_object.rotation.y = decode_radians(bh.next_bytes(2));
            new_object.rotation.z = decode_radians(bh.next_bytes(2));

            await this.setModel(new_object.object_id, bh.next_byte())
            await this.setMaterial(new_object.object_id, bh.next_byte())

            new_object.uv_offset[0] = decode_custom_range(bh.next_bytes(2), 0, 1)
            new_object.uv_offset[1] = decode_custom_range(bh.next_bytes(2), 0, 1)

            new_object.uv_scale[0] = decode_num(bh.next_bytes(4))
            new_object.uv_scale[1] = decode_num(bh.next_bytes(4))

            new_object.material.color.r = bh.next_byte()/255
            new_object.material.color.g = bh.next_byte()/255
            new_object.material.color.b = bh.next_byte()/255
            bh.next_byte() // Alpha later

            if (bh.next_byte() === 255) {
                new_object.auto_uv_scale = true
            } else {
                new_object.auto_uv_scale = false
            }

            console.log(new_object.position, new_object.scale, new_object.rotation)

            this.updateUVs(new_object.object_id);
        }
    }
}