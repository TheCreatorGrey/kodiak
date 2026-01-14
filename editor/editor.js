import * as THREE from "three";
import { World, generateRandomID } from "../world.js";
import { Tool, cast, map } from "./tool.js"
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// A lot of the code in here is atrocious. I will probably finish cleaning it later.

import { convertXML } from "./xmlconverter.js";




function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}



// File input shite

let file_input_onload;
const file_input = document.getElementById('fileInput');

document.getElementById('fileInput').onchange = function() {
    if (file_input.files.length > 0) {
        var file = file_input.files[0];
        
        var reader = new FileReader();
  
        reader.onload = function(e) {
            var file_content = e.target.result;
            
            if (file_input_onload) {
                file_input_onload(file_content);
            }
    
            //let w = btoa(fileContent);
        };
  
        reader.readAsArrayBuffer(file);
    }
};

async function requestFile(onload) {
    file_input.click()
    file_input_onload = onload
}

async function importWorld() {
    requestFile(function(file_content) {
        world.from_serial(file_content);
    })
}




var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.key] = false; }
window.onkeydown = function(e) { pressedKeys[e.key] = true; }









var dt;
function animate() {
    dt = world.clock.getDelta();
    requestAnimationFrame(animate);

    if (pressedKeys["w"]) {
        world.camera.translateZ(-20 * dt)
    }
    if (pressedKeys["s"]) {
        world.camera.translateZ(20 * dt)
    }
    if (pressedKeys["a"]) {
        world.camera.translateX(-20 * dt)
    }
    if (pressedKeys["d"]) {
        world.camera.translateX(20 * dt)
    }


    if (tool.selected_object_id) {
        for (let d in tool.draggables) {
            let draggable = tool.draggables[d].draggable;

            let scale = .1 * world.camera.position.distanceTo(new THREE.Vector3(world.data.space.objects[tool.selected_object_id].position[0], world.data.space.objects[tool.selected_object_id].position[1], world.data.space.objects[tool.selected_object_id].position[2]));
            draggable.object.scale.set(scale, scale, scale);
        }
    }

    tool.update();
    world.renderer.render(world.scene, world.camera);
}



var world;
var tool;
async function setup() {
    world = new World("editor");

    let request = await fetch("/kodiak/test_place.json");
    let data = await request.json();
    await world.load(data);

    //convertXML(world, "/kodiak/3rdparty/roblox/import_tests/suburb.rbxmx");

    world.renderer.domElement.classList.add("editorCanvas");



    // ================================================
    // \/           GUI Functionality                \/
    // ================================================

    // Header bar stuff \/

    const play_btn = document.getElementById("play_btn");
    const save_btn = document.getElementById("save_btn");
    const load_btn = document.getElementById("load_btn");

    const move_btn = document.getElementById("move_btn");
    const scale_btn = document.getElementById("scale_btn");
    const rotate_btn = document.getElementById("rotate_btn");
    const del_btn = document.getElementById("del_btn");
    const clone_btn = document.getElementById("clone_btn");

    const new_object_btn = document.getElementById("new_object_btn");

    const snap_input = document.getElementById("snap_input");


    play_btn.onclick = function () {
        //let w = btoa(JSON.stringify(world.export()));

        window.open(`../player`, '_blank').focus()
    };

    save_btn.onclick = function () {
        world.serialize();

        //download(serial, 'world.kodiak', 'application/octet-stream');
    };

    load_btn.onclick = function () {
        importWorld()
    };

    move_btn.onclick = function () { tool.change('move') };
    scale_btn.onclick = function () { tool.change('scale') };
    rotate_btn.onclick = function () { tool.change('rotate') };

    new_object_btn.onclick = function () {
        const direction = new THREE.Vector3();

        const intersects = cast(world, world.camera.position, world.camera.getWorldDirection(direction), 10000, world.scene.children);

        console.log(intersects)

        if (intersects.length > 0) {
            let point = intersects[0].point;

            let object_id = world.newPart();
            let object = world.getObjectByID(object_id);
            object.position[0] = point.x;
            object.position[1] = point.y;
            object.position[2] = point.z;
            console.log(point)
            world.manifest(object_id)
        }
    };

    del_btn.onclick = function () { world.delPart(tool.selected_object_id); tool.set_selected_object(null); };
    clone_btn.onclick = function () { world.clonePart(tool.selected_object_id) };

    snap_input.onchange = function () {
        for (let d in tool.draggables) {
            let draggable = tool.draggables[d].draggable;
            draggable.snap = snap_input.value;
        }
    }

    // === /\


    // Object Configuration Bar Stuff \/

    const object_id_display = document.getElementById("object_id_display");



    for (let m in map) { // Update selected object values when input boxes are changed
        document.getElementById(m).onchange = function () {
            let val = parseFloat(document.getElementById(m).value);
            let selected_object_id = tool.selected_object_id;
            tool.selected_object_id = null;

            if (map[m].attr === 'rotation') {
                val *= Math.PI / 180;
            }

            selected_object_id[map[m].attr][map[m].subattr] = val;

            tool.set_selected_object(selected_object_id);
        }
    }

    // === /\


    // Material List Bar Stuff \/

    let material_list_bar = document.getElementById("material_list_bar");
    function refreshMaterialList() {
        material_list_bar.innerHTML = "";

        let add_button = document.createElement("button");
        add_button.id = "add_button";
        add_button.className = "assetButton";
        add_button.innerText = "Add +"
        material_list_bar.appendChild(add_button);

        add_button.onclick = () => {
            requestFile(async function(file_content) {
                //let matid = generateRandomID()
                //let mat = world.newMaterial(matid)
                //world.setMaterial(tool.selected_object_id, matid)
                //world.setMaterialTexture(matid, "diffuse", file_content)
                //console.log(file_content)

                await world.importMaterial(file_content, generateRandomID())
                refreshMaterialList();
            })
        }

        for (let material_id in world.materials) {
            let material = world.materials[material_id];

            let button = document.createElement("div");
            button.className = "assetButton";
            button.innerText = material.name;
            material_list_bar.appendChild(button);

            button.onclick = () => {
                world.setMaterial(tool.selected_object_id, material_id)
            }
        }
    }

    refreshMaterialList();


    let model_list_bar = document.getElementById("model_list_bar");
    function refreshModelList() {
        model_list_bar.innerHTML = "";

        let add_button = document.createElement("button");
        add_button.className = "assetButton";
        add_button.innerText = "Add +"
        model_list_bar.appendChild(add_button);

        add_button.onclick = () => {
            requestFile(function(file_content) {
                world.importModel(file_content)
                console.log(file_content)
                refreshModelList();
            })
        }

        for (let model_id in world.models) {
            let model = world.models[model_id];

            let button = document.createElement("div");
            button.innerText = model.name;
            button.className = "assetButton";
            model_list_bar.appendChild(button);

            button.onclick = () => {
                world.setModel(tool.selected_object_id, model_id)
            }
        }
    }

    refreshModelList();





    const material_diffuse_input = document.getElementById("material_diffuse_input");
    const material_normal_input = document.getElementById("material_normal_input");
    const material_rough_input = document.getElementById("material_rough_input");
    
    const material_texture_stretch = document.getElementById("material_texture_stretch");
    const material_scale = document.getElementById("material_scale");

    const material_tint_r_input = document.getElementById("material_tint_r_input");
    const material_tint_g_input = document.getElementById("material_tint_g_input");
    const material_tint_b_input = document.getElementById("material_tint_b_input");



    material_diffuse_input.onchange = () => {
        world.setMaterialTexture(world.getObjectByID(tool.selected_object_id).material, "diffuse", material_diffuse_input.value)
    }


    material_scale.onchange = () => {
        let material = world.materials[world.getObjectByID(tool.selected_object_id).material];
        console.log(parseFloat(material_scale.value))
        material.scale = parseFloat(material_scale.value)
    }

    material_texture_stretch.onchange = () => {
        let material = world.materials[world.getObjectByID(tool.selected_object_id).material];
        material.stretch = material_texture_stretch.checked
    }


    // Material tint input
    // Another questionable attempt to follow DRY
    for (let rgb of ['r', 'g', 'b']) {
        //let rgb_index = ['r', 'g', 'b'][c];

        let input = document.getElementById(`material_tint_${rgb}_input`);
        input.onchange = function () {
            let val = parseFloat(input.value) / 255;
            tool.selected_object_id.material.color[rgb] = val;
        }
    }


    // === /\

    // ================================
    // /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
    // ================================




    tool = new Tool(world);
    tool.change('move');


    const controls = new PointerLockControls(world.camera, world.renderer.domElement);
    world.renderer.domElement.addEventListener("mousedown", function (event) {
        if (event.button === 2) {
            world.renderer.domElement.requestPointerLock();
        }
    });
    world.renderer.domElement.addEventListener("mouseup", function (event) {
        if (event.button === 2) {
            document.exitPointerLock();
        }
    });

    animate();
}

setup()