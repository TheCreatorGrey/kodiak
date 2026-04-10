import * as THREE from "three";
import { World, generateRandomID, updateProgress } from "../world.js";
import { Tool, cast } from "./tool.js"
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
        world.fromSerial(file_content);
    })
}




var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.key] = false; }
window.onkeydown = function(e) { pressedKeys[e.key] = true; }




//   Scripting stuff
// \/\/\/\/\/\/\/\/\/\/

const script_text = document.getElementById("script_text")
const scripting_run_button = document.getElementById("scripting-run-button")

scripting_run_button.onclick = () => {
    world.script.loadFromText(script_text.value)
    console.log(world.script.script)
}


var dt;
async function animate() {
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

            let scale = .1 * world.camera.position.distanceTo(new THREE.Vector3(world.objects[tool.selected_object_id].position[0], world.objects[tool.selected_object_id].position[1], world.objects[tool.selected_object_id].position[2]));
            draggable.object.scale.set(scale, scale, scale);
        }
    }
    
    await world.script.executeUntilNextRefresh()

    tool.update();
    world.renderer.render(world.scene, world.camera);
}



var world;
var tool;
async function setup() {
    world = new World("editor");

    await world.initialize();

    //convertXML(world, "/kodiak/3rdparty/roblox/import_tests/suburb.rbxmx");

    world.renderer.domElement.classList.add("editorCanvas");



    // ================================================
    // \/           GUI Functionality                \/
    // ================================================

    // Header bar stuff \/

    const save_btn = document.getElementById("save_btn");
    const load_btn = document.getElementById("load_btn");

    const move_btn = document.getElementById("move_btn");
    const scale_btn = document.getElementById("scale_btn");
    const rotate_btn = document.getElementById("rotate_btn");
    const del_btn = document.getElementById("del_btn");
    const clone_btn = document.getElementById("clone_btn");

    const new_object_btn = document.getElementById("new_object_btn");

    const snap_input = document.getElementById("snap_input");

    save_btn.onclick = function () {
        world.serialize();
    };

    load_btn.onclick = function () {
        importWorld()
    };

    move_btn.onclick = function () { tool.change('move') };
    scale_btn.onclick = function () { tool.change('scale') };
    rotate_btn.onclick = function () { tool.change('rotate') };

    new_object_btn.onclick = async function () {
        const direction = new THREE.Vector3();

        const intersects = cast(world, world.camera.position, world.camera.getWorldDirection(direction), 10000, world.scene.children);

        console.log(intersects)

        if (intersects.length > 0) {
            let point = intersects[0].point;

            let object = world.newObject();
            object.position.x = point.x;
            object.position.y = point.y;
            object.position.z = point.z;

            await world.setModel(object.object_id, 0)
            await world.setMaterial(object.object_id, 0)
        }
    };

    del_btn.onclick = function () { world.delObject(tool.selected_object_id); tool.set_selected_object(null); };
    clone_btn.onclick = function () { world.cloneObject(tool.selected_object_id) };

    snap_input.onchange = function () {
        for (let d in tool.draggables) {
            let draggable = tool.draggables[d].draggable;
            draggable.snap = snap_input.value;
        }
    }

    // === /\


    // Object Configuration Bar Stuff \/

    const object_id_display = document.getElementById("object_id_display");

    const input_pos_x = document.getElementById("input-pos-x")
    input_pos_x.onchange = function () {
        tool.getSelectedObject().position[0] = parseFloat(input_pos_x.value)
    }

    const input_pos_y = document.getElementById("input-pos-y")
    input_pos_y.onchange = function () {
        tool.getSelectedObject().position[1] = parseFloat(input_pos_y.value)
    }

    const input_pos_z = document.getElementById("input-pos-x")
    input_pos_z.onchange = function () {
        tool.getSelectedObject().position[2] = parseFloat(input_pos_z.value)
    }


    const input_scl_x = document.getElementById("input-scl-x")
    input_scl_x.onchange = function () {
        tool.getSelectedObject().scale[0] = parseFloat(input_scl_x.value)
    }

    const input_scl_y = document.getElementById("input-scl-y")
    input_scl_y.onchange = function () {
        tool.getSelectedObject().scale[1] = parseFloat(input_scl_y.value)
    }

    const input_scl_z = document.getElementById("input-scl-z")
    input_scl_z.onchange = function () {
        tool.getSelectedObject().scale[2] = parseFloat(input_scl_z.value)
    }


    const input_ro_x = document.getElementById("input-ro-x")
    input_ro_x.onchange = function () {
        tool.getSelectedObject().rotation[0] = parseFloat(input_ro_x.value)*Math.PI / 180
    }

    const input_ro_y = document.getElementById("input-ro-y")
    input_ro_y.onchange = function () {
        tool.getSelectedObject().rotation[1] = parseFloat(input_ro_y.value)*Math.PI / 180
    }

    const input_ro_z = document.getElementById("input-ro-z")
    input_ro_z.onchange = function () {
        tool.getSelectedObject().rotation[2] = parseFloat(input_ro_z.value)*Math.PI / 180
    }



    const input_tint_r = document.getElementById("input-tint-r")
    input_tint_r.onchange = async function () {
        world.objects[tool.selected_object_id].material.color.r = parseInt(input_tint_r.value)/255
    }

    const input_tint_g = document.getElementById("input-tint-g")
    input_tint_g.onchange = async function () {
        world.objects[tool.selected_object_id].material.color.g = parseInt(input_tint_g.value)/255
    }

    const input_tint_b = document.getElementById("input-tint-b")
    input_tint_b.onchange = async function () {
        world.objects[tool.selected_object_id].material.color.b = parseInt(input_tint_b.value)/255
    }


    const input_uv_offset_u = document.getElementById("input-uv-offset-u")
    input_uv_offset_u.onchange = async function () {
        world.objects[tool.selected_object_id].uv_offset[0] = parseFloat(input_uv_offset_u.value)
    }

    const input_uv_offset_v = document.getElementById("input-uv-offset-v")
    input_uv_offset_v.onchange = async function () {
        world.objects[tool.selected_object_id].uv_offset[1] = parseFloat(input_uv_offset_v.value)
    }

    const input_uv_scale_u = document.getElementById("input-uv-scale-u")
    input_uv_scale_u.onchange = async function () {
        world.objects[tool.selected_object_id].uv_scale[0] = parseFloat(input_uv_scale_u.value)
    }

    const input_uv_scale_v = document.getElementById("input-uv-scale-v")
    input_uv_scale_v.onchange = async function () {
        world.objects[tool.selected_object_id].uv_scale[1] = parseFloat(input_uv_scale_v.value)
    }

    const input_auto_uv_scale = document.getElementById("input-auto-uv-scale")
    input_auto_uv_scale.onchange = async function () {
        world.objects[tool.selected_object_id].auto_uv_scale = input_auto_uv_scale.checked
    }

    // === /\


    // Material List Bar Stuff \/

    let material_list_bar = document.getElementById("material_list_bar");
    function refreshMaterialList() {
        material_list_bar.innerHTML = "";

        let add_button = document.createElement("button");
        add_button.id = "add_button";
        add_button.className = "assetButton";
        add_button.innerText = "Import +"
        material_list_bar.appendChild(add_button);

        add_button.onclick = () => {
            requestFile(async function(file_content) {
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

            button.onmousedown = (e) => {
                if (e.buttons === 1) { // Left click set material
                    world.setMaterial(tool.selected_object_id, material_id)
                } else if (e.buttons === 2) { // Right click configure material
                    loadMatModMenu("material", material_id)
                }
            }
        }
    }

    refreshMaterialList();


    let model_list_bar = document.getElementById("model_list_bar");
    function refreshModelList() {
        model_list_bar.innerHTML = "";

        let add_button = document.createElement("button");
        add_button.className = "assetButton";
        add_button.innerText = "Import +"
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



    // Material and model configuration menu
    const matmod_config_menu = document.getElementById("material_model_config_bar")
    function loadMatModMenu(material_or_model="material", matmod_id) {
        matmod_config_menu.innerHTML = "";

        if (material_or_model === "model") {

        } else if (material_or_model === "material") {
            let material = world.materials[matmod_id]


            let textures_label = document.createElement("div");
            textures_label.innerText = "Interface:"
            textures_label.className = "sidebar_section"
            matmod_config_menu.appendChild(textures_label)

            let name_subsect = document.createElement("div");
            name_subsect.className = "sidebar_section subsection"
            matmod_config_menu.appendChild(name_subsect)

            let name_label = document.createElement("span");
            name_label.innerText = "Display name:"
            name_subsect.appendChild(name_label)

            let name_textarea = document.createElement("textarea");
            name_textarea.innerText = material.name
            name_textarea.style.width = "60px";
            name_subsect.appendChild(name_textarea)

            name_textarea.onchange = () => {
                material.name = name_textarea.value
                refreshMaterialList()
            }
        }
    }







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