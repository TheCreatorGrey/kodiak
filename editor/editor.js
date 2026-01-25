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

    //convertXML(world, "/kodiak/3rdparty/roblox/import_tests/suburb.rbxmx", async (a, b) => {
    //    updateProgress("Importing RBXMX", "parts", a, b)
    //});

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

            let object_id = world.newObject();
            let object = world.getObjectByID(object_id);
            object.position[0] = point.x;
            object.position[1] = point.y;
            object.position[2] = point.z;
            console.log(point)
            world.manifest(object_id)
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
        console.log(world.getThreeMesh(tool.selected_object_id))
        let three_mesh = await world.getThreeMesh(tool.selected_object_id)
        three_mesh.material.color.r = parseInt(input_tint_r.value)
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



    // Material and model configuration menu
    const matmod_config_menu = document.getElementById("material_model_config_bar")
    function loadMatModMenu(material_or_model="material", matmod_id) {
        matmod_config_menu.innerHTML = "";

        if (material_or_model === "model") {

        } else if (material_or_model === "material") {
            let material = world.data.assets.materials[matmod_id]


            let textures_label = document.createElement("div");
            textures_label.innerText = "Interface:"
            textures_label.className = "sidebarSection"
            matmod_config_menu.appendChild(textures_label)

            let name_subsect = document.createElement("div");
            name_subsect.className = "sidebarSection subSection"
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


            let uvs_label = document.createElement("div");
            uvs_label.innerText = "UVs:"
            uvs_label.className = "sidebarSection"
            matmod_config_menu.appendChild(uvs_label)

            let uvs_subsect = document.createElement("div");
            uvs_subsect.className = "sidebarSection subSection"
            matmod_config_menu.appendChild(uvs_subsect)

            let uv_scale_label = document.createElement("span");
            uv_scale_label.innerText = "Scale:"
            uvs_subsect.appendChild(uv_scale_label)

            let uv_u_scale_textarea = document.createElement("textarea");
            uv_u_scale_textarea.innerText = material.scale[0]
            uvs_subsect.appendChild(uv_u_scale_textarea)

            let uv_v_scale_textarea = document.createElement("textarea");
            uv_v_scale_textarea.innerText = material.scale[1]
            uvs_subsect.appendChild(uv_v_scale_textarea)

            uv_u_scale_textarea.onchange = () => {
                material.scale[0] = parseFloat(uv_u_scale_textarea.value)
            }

            uv_v_scale_textarea.onchange = () => {
                material.scale[1] = parseFloat(uv_v_scale_textarea.value)
            }

            let uv_autoscale_label = document.createElement("span");
            uv_autoscale_label.innerText = "Automatic scaling:"
            uvs_subsect.appendChild(uv_autoscale_label)

            let uv_autoscale_checkbox = document.createElement("input");
            uv_autoscale_checkbox.type = "checkbox"
            uv_autoscale_checkbox.checked = !material.stretch
            uvs_subsect.appendChild(uv_autoscale_checkbox)

            uv_autoscale_checkbox.onchange = () => {
                material.stretch = !uv_autoscale_checkbox.checked
                world.data.assets.materials[matmod_id].stretch = !uv_autoscale_checkbox.checked
            }


            let tint_label = document.createElement("div");
            tint_label.innerText = "Tint:"
            tint_label.className = "sidebarSection"
            matmod_config_menu.appendChild(tint_label)

            let tint_subsect = document.createElement("div");
            tint_subsect.className = "sidebarSection subSection"
            matmod_config_menu.appendChild(tint_subsect)

            let tint_r_label = document.createElement("span");
            tint_r_label.innerText = "R:"
            tint_subsect.appendChild(tint_r_label)

            let tint_r_textarea = document.createElement("textarea");
            tint_r_textarea.innerText = material.tint[0]
            tint_subsect.appendChild(tint_r_textarea)

            let tint_g_label = document.createElement("span");
            tint_g_label.innerText = "G:"
            tint_subsect.appendChild(tint_g_label)

            let tint_g_textarea = document.createElement("textarea");
            tint_g_textarea.innerText = material.tint[1]
            tint_subsect.appendChild(tint_g_textarea)

            let tint_b_label = document.createElement("span");
            tint_b_label.innerText = "B:"
            tint_subsect.appendChild(tint_b_label)

            let tint_b_textarea = document.createElement("textarea");
            tint_b_textarea.innerText = material.tint[2]
            tint_subsect.appendChild(tint_b_textarea)

            tint_r_textarea.onchange = () => {
                material.tint[0] = parseInt(tint_r_textarea.value)
            }

            tint_g_textarea.onchange = () => {
                material.tint[1] = parseInt(tint_g_textarea.value)
            }

            tint_b_textarea.onchange = () => {
                material.tint[2] = parseInt(tint_b_textarea.value)
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