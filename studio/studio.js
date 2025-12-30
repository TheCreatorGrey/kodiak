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

function importWorld() {
    var input = document.getElementById("fileInput");

    if (input.files.length > 0) {
      var file = input.files[0];
      
      var reader = new FileReader();

      reader.onload = function(e) {
        var fileContent = e.target.result;

        let w = btoa(fileContent);
        sessionStorage.setItem('world', w)
        window.location.reload(false)
      };

      reader.readAsText(file);
    } else {
      console.log('No file selected.');
    }
}

document.getElementById('fileInput').onchange = importWorld;

var pressedKeys = {};
window.onkeyup = function (e) { pressedKeys[e.key] = false; }
window.onkeydown = function (e) { pressedKeys[e.key] = true; }









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


    if (tool.selected_part_id) {
        for (let d in tool.draggables) {
            let draggable = tool.draggables[d].draggable;

            let scale = .1 * world.camera.position.distanceTo(new THREE.Vector3(world.data.space.parts[tool.selected_part_id].position[0], world.data.space.parts[tool.selected_part_id].position[1], world.data.space.parts[tool.selected_part_id].position[2]));
            draggable.object.scale.set(scale, scale, scale);
        }
    }

    tool.update();
    world.renderer.render(world.scene, world.camera);
}



var world;
var tool;
async function setup() {
    world = new World("studio");
    await world.load("/kodiak/test_place.json",);

    convertXML(world, "/kodiak/3rdparty/roblox/import_tests/suburb.rbxmx");

    world.renderer.domElement.classList.add("studioCanvas");



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

    const new_part_btn = document.getElementById("new_part_btn");

    const snap_input = document.getElementById("snap_input");


    play_btn.onclick = function () {
        //let w = btoa(JSON.stringify(world.export()));

        window.open(`../player`, '_blank').focus()
    };

    save_btn.onclick = function () {
        let Wjson = world.export();

        download(JSON.stringify(Wjson), 'world.kodiak', 'text/plain');
    };

    load_btn.onclick = function () {
        document.getElementById('fileInput').click();
    };

    move_btn.onclick = function () { tool.change('move') };
    scale_btn.onclick = function () { tool.change('scale') };
    rotate_btn.onclick = function () { tool.change('rotate') };

    new_part_btn.onclick = function () {
        const direction = new THREE.Vector3();

        const intersects = cast(world, world.camera.position, world.camera.getWorldDirection(direction), 10000, world.scene.children);

        console.log(intersects)

        if (intersects.length > 0) {
            let point = intersects[0].point;

            let part_id = world.newPart();
            let part = world.getPartByID(part_id);
            part.position[0] = point.x;
            part.position[1] = point.y;
            part.position[2] = point.z;
            console.log(point)
            world.manifest(part_id)
        }
    };

    del_btn.onclick = function () { world.delPart(tool.selected_part_id); tool.set_selected_part(null); };
    clone_btn.onclick = function () { world.clonePart(tool.selected_part_id) };

    snap_input.onchange = function () {
        for (let d in tool.draggables) {
            let draggable = tool.draggables[d].draggable;
            draggable.snap = snap_input.value;
        }
    }

    // === /\


    // Part Configuration Bar Stuff \/

    const part_id_display = document.getElementById("part_id_display");



    for (let m in map) { // Update selected part values when input boxes are changed
        document.getElementById(m).onchange = function () {
            let val = parseFloat(document.getElementById(m).value);
            let selected_part_id = tool.selected_part_id;
            tool.selected_part_id = null;

            if (map[m].attr === 'rotation') {
                val *= Math.PI / 180;
            }

            selected_part_id[map[m].attr][map[m].subattr] = val;

            tool.set_selected_part(selected_part_id);
        }
    }

    // === /\


    // Material List Bar Stuff \/

    let material_list_bar = document.getElementById("material_list_bar");
    function refreshMaterialList() {
        material_list_bar.innerHTML = "";

        let add_button = document.createElement("button");
        add_button.id = "add_button";
        add_button.className = "materialButton";
        add_button.innerText = "Add +"
        material_list_bar.appendChild(add_button);

        add_button.onclick = () => {
            world.newMaterial(generateRandomID())

            refreshMaterialList();
        }

        for (let m in world.materials) {
            let button = document.createElement("img");
            button.src = world.materials[m].textures.diffuse;
            button.className = "materialButton";
            material_list_bar.appendChild(button);

            button.onclick = () => {
                world.setMaterial(tool.selected_part_id, m)
            }
        }
    }

    refreshMaterialList();


    let model_list_bar = document.getElementById("model_list_bar");
    function refreshModelList() {
        model_list_bar.innerHTML = "";

        let add_button = document.createElement("button");
        add_button.id = "add_button";
        add_button.className = "modelButton";
        add_button.innerText = "Add +"
        model_list_bar.appendChild(add_button);

        add_button.onclick = () => {
            world.newMaterial(generateRandomID())

            refreshModelList();
        }

        for (let m in world.models) {
            let button = document.createElement("div");
            button.innerText = m;
            button.className = "modelButton";
            model_list_bar.appendChild(button);

            button.onclick = () => {
                world.setModel(tool.selected_part_id, m)
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
        world.setMaterialTexture(world.getPartByID(tool.selected_part_id).material, "diffuse", material_diffuse_input.value)
    }


    material_scale.onchange = () => {
        let material = world.materials[world.getPartByID(tool.selected_part_id).material];
        console.log(parseFloat(material_scale.value))
        material.scale = parseFloat(material_scale.value)
    }

    material_texture_stretch.onchange = () => {
        let material = world.materials[world.getPartByID(tool.selected_part_id).material];
        material.stretch = material_texture_stretch.checked
    }


    // Material tint input
    // Another questionable attempt to follow DRY
    for (let rgb of ['r', 'g', 'b']) {
        //let rgb_index = ['r', 'g', 'b'][c];

        let input = document.getElementById(`material_tint_${rgb}_input`);
        input.onchange = function () {
            let val = parseFloat(input.value) / 255;
            tool.selected_part_id.material.color[rgb] = val;
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