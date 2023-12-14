import * as THREE from 'three';
import { World } from '../world.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const world = new World("eyJwYXJ0cyI6W3sicG9zaXRpb24iOlszLjEyNSwxLjUsMC41XSwic2NhbGUiOlswLjI1LDIuNSw1LjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlswLDAuMjUsMC41XSwic2NhbGUiOls2LDAuNSw1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYnJ1c2hlZF9jb25jcmV0ZV8yIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMC42MjUsMC41XSwic2NhbGUiOls2LDAuMjUsNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6InJhd19wbGFua193YWxsIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDEwLDEwXX0seyJwb3NpdGlvbiI6WzIuODc1LDEuNzUsMC41XSwic2NhbGUiOlswLjI1LDIsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTIsMi41LDIuODc1XSwic2NhbGUiOlsxLDAuNSwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCwzLjYyNSwwLjVdLCJzY2FsZSI6WzUuNSwwLjI1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImdyZXlfcm9vZl90aWxlc18wMiIsInR5cGUiOiJjdWJlIiwiY29sb3IiOls1MCwwLDBdfSx7InBvc2l0aW9uIjpbMC43NSwxLjc1LDIuODc1XSwic2NhbGUiOls0LjUsMiwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbMCwxLjc1LC0xLjg3NV0sInNjYWxlIjpbNiwyLDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJiZWlnZV93YWxsXzAwMSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyMDAsMjAwLDIwMF19LHsicG9zaXRpb24iOlstMi43NSwxLjc1LDIuODc1XSwic2NhbGUiOlswLjUsMiwwLjI1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTIuODc1LDEuNzUsMC41XSwic2NhbGUiOlswLjI1LDIsNC41XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiYmVpZ2Vfd2FsbF8wMDEiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjAwLDIwMCwyMDBdfSx7InBvc2l0aW9uIjpbLTMuMTI1LDEuNSwwLjVdLCJzY2FsZSI6WzAuMjUsMi41LDUuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMS41LC0yLjEyNV0sInNjYWxlIjpbNiwyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAuNzUsMS41LDMuMTI1XSwic2NhbGUiOls0LjUsMi41LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicmlja193YWxsXzAwNSIsInR5cGUiOiJjdWJlIiwiY29sb3IiOlsyNTUsMjU1LDI1NV19LHsicG9zaXRpb24iOlstMi43NSwxLjUsMy4xMjVdLCJzY2FsZSI6WzAuNSwyLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0yLDIuNSwzLjEyNV0sInNjYWxlIjpbMSwwLjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJyaWNrX3dhbGxfMDA1IiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0yLDAuMTI1LDMuNjI1XSwic2NhbGUiOlsxLDAuMjUsMC4yNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJydXNoZWRfY29uY3JldGUiLCJ0eXBlIjoiY3ViZSIsImNvbG9yIjpbMjU1LDI1NSwyNTVdfSx7InBvc2l0aW9uIjpbMCwyLjYyNSwwLjVdLCJzY2FsZSI6WzUuNSwwLjI1LDQuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImJlaWdlX3dhbGxfMDAxIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMi44NzUsMC41XSwic2NhbGUiOls3LDAuMjUsNl0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImdyZXlfcm9vZl90aWxlc18wMiIsInR5cGUiOiJjdWJlIiwiY29sb3IiOls1MCwwLDBdfSx7InBvc2l0aW9uIjpbMCwzLjEyNSwwLjVdLCJzY2FsZSI6WzYuNSwwLjI1LDUuNV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImdyZXlfcm9vZl90aWxlc18wMiIsInR5cGUiOiJjdWJlIiwiY29sb3IiOls1MCwwLDBdfSx7InBvc2l0aW9uIjpbMCwzLjM3NSwwLjVdLCJzY2FsZSI6WzYsMC4yNSw1XSwicm90YXRpb24iOlswLDAsMF0sIm1hdGVyaWFsIjoiZ3JleV9yb29mX3RpbGVzXzAyIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzUwLDAsMF19LHsicG9zaXRpb24iOlstMiwwLjM3NSwzLjEyNV0sInNjYWxlIjpbMSwwLjc1LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicnVzaGVkX2NvbmNyZXRlIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6Wy0yLDAuMjUsMy4zNzVdLCJzY2FsZSI6WzEsMC41LDAuMjVdLCJyb3RhdGlvbiI6WzAsMCwwXSwibWF0ZXJpYWwiOiJicnVzaGVkX2NvbmNyZXRlIiwidHlwZSI6ImN1YmUiLCJjb2xvciI6WzI1NSwyNTUsMjU1XX0seyJwb3NpdGlvbiI6WzAsMi4zNzUsMC41XSwic2NhbGUiOlsxLDAuMjUsMV0sInJvdGF0aW9uIjpbMCwwLDBdLCJtYXRlcmlhbCI6ImRvdWJsZV9icmlja19mbG9vciIsInR5cGUiOiJjeWxpbmRlciIsImNvbG9yIjpbMjU1LDI1NSwxNjBdLCJlbWlzc2l2ZSI6dHJ1ZSwiZW1pc3Npb25JbnRlbnNpdHkiOjMsImVtaXNzaW9uUmFuZ2UiOjEwfV19", false);

function cast(origin, direction, length, target = world.scene.children) {
    world.raycaster.far = length;

    world.raycaster.set(origin, direction);

    return world.raycaster.intersectObjects(target);
}

var pressedKeys = {};
window.onkeyup = function (e) { pressedKeys[e.key] = false; }
window.onkeydown = function (e) { pressedKeys[e.key] = true; }


document.getElementById("movebtn").onclick = function () { tool.change('move') };
document.getElementById("scalebtn").onclick = function () { tool.change('scale') };
document.getElementById("rotatebtn").onclick = function () { tool.change('rotate') };

document.getElementById("newpartbutton").onclick = function () {
    const direction = new THREE.Vector3();

    const intersects = cast(world.camera.position, world.camera.getWorldDirection(direction), 100);

    if (intersects.length > 0) {
        let point = intersects[0].point;

        world.newPart('cube', [point.x, point.y, point.z])
    }
};

document.getElementById("delbtn").onclick = function () { world.delPart(tool.selpart); tool.setSelPart(null) };
document.getElementById("clonebtn").onclick = function () { world.clonePart(tool.selpart) };



function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

document.getElementById("savebtn").onclick = function () {
    let Wjson = world.export();

    download(JSON.stringify(Wjson), 'world.kodiak', 'text/plain');
};

document.getElementById("playbtn").onclick = function () {
    let w = btoa(JSON.stringify(world.export()));

    window.open(`../player/?data=${w}`, '_blank').focus()
};


function mouseCast(target = world.scene.children, event) { //lol, thanks chatGPT
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    world.raycaster.setFromCamera(mouse, world.camera);

    return world.raycaster.intersectObjects(target);
}

fetch('https://api.polyhaven.com/assets?t=textures')
    .then(response => {
        // Check if the response status is OK (HTTP status code 200)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response as needed, depending on whether it's JSON, text, or other data
        // For example, to parse as JSON:
        return response.json();
    })
    .then(data => {
        // Use the data from the response
        console.log(data);
        for (let d in data) {
            document.getElementById("matIndexDiv").insertAdjacentHTML('beforeend', `
        <img id="${d}" class="materialBtn" src="https://cdn.polyhaven.com/asset_img/thumbs/${d}.png" alt="material">
        `)

            document.getElementById(`${d}`).onclick = function () {
                world.setMat(tool.selpart, d)
            }
        }
    })
    .catch(error => {
        // Handle errors
        console.error('Fetch error:', error);
    });

document.getElementById('matSearchBtn').onclick = function () {
    let query = document.getElementById('matSearchTextarea').value;
    let buttonList = document.getElementsByClassName('materialBtn');

    for (let m in buttonList) {
        let btn = buttonList[m];

        if (btn.id.includes(query)) {
            btn.style.display = 'inline'
        } else {
            btn.style.display = 'none'
        }
    }
}


let map = {
    'input-pos-x': {
        'attr': 'position',
        'subattr': 'x'
    },

    'input-pos-y': {
        'attr': 'position',
        'subattr': 'y'
    },

    'input-pos-z': {
        'attr': 'position',
        'subattr': 'z'
    },

    'input-scl-x': {
        'attr': 'scale',
        'subattr': 'x'
    },

    'input-scl-y': {
        'attr': 'scale',
        'subattr': 'y'
    },

    'input-scl-z': {
        'attr': 'scale',
        'subattr': 'z'
    },

    'input-ro-x': {
        'attr': 'rotation',
        'subattr': 'x'
    },

    'input-ro-y': {
        'attr': 'rotation',
        'subattr': 'y'
    },

    'input-ro-z': {
        'attr': 'rotation',
        'subattr': 'z'
    },
}

for (let m in map) {
    document.getElementById(m).onchange = function () {
        let val = parseFloat(document.getElementById(m).value);
        let selpart = tool.selpart;
        tool.selpart = null;

        if (map[m].attr === 'rotation') {
            val *= Math.PI / 180;
        }

        selpart[map[m].attr][map[m].subattr] = val;

        tool.setSelPart(selpart);
    }
}

for (let c in ['r', 'g', 'b']) {
    let cLiteral = ['r', 'g', 'b'][c];

    document.getElementById(`input-co-${cLiteral}`).onchange = function () {
        let val = parseFloat(document.getElementById(`input-co-${cLiteral}`).value) / 255;

        tool.selpart.material.color[cLiteral] = val;

        if (tool.selpart.emissive) {
            tool.selpart.light.color[cLiteral] = val;
        }
    }
}

let modelList = ['cube', 'sphere', 'cylinder', 'plane', 'torus', 'pyramid', 'cone'];
for (let c in modelList) {
    let cLiteral = modelList[c];

    document.getElementById(`change-${cLiteral}`).onclick = function () {
        world.setGeom(tool.selpart, cLiteral);
    }
}

document.getElementById('input-em').onchange = function () {
    world.changeEmissive(tool.selpart, document.getElementById('input-em').checked);

    if (document.getElementById('input-em').checked) {
        document.getElementById('input-em-int').value = 2;
        document.getElementById('input-em-ran').value = 10;
    }
}

document.getElementById('input-em-int').onchange = function () {
    if (tool.selpart.emissive) {
        tool.selpart.light.intensity = parseFloat(document.getElementById('input-em-int').value)
    }
}

document.getElementById('input-em-ran').onchange = function () {
    if (tool.selpart.emissive) {
        let val = parseFloat(document.getElementById('input-em-ran').value);

        tool.selpart.light.shadow.camera.far = val;
        tool.selpart.light.shadow.camera.top = val;
        tool.selpart.light.shadow.camera.bottom = - val;
        tool.selpart.light.shadow.camera.left = - val;
        tool.selpart.light.shadow.camera.right = val;
    }
}

document.getElementById('snap-input').onchange = function () {
    for (let d in tool.draggables) {
        let draggable = tool.draggables[d].draggable;

        draggable.snap = document.getElementById('snap-input').value;
    }
}

class Tool {
    constructor() {
        this.anyDragging = false;

        this.cursor = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        );

        world.scene.add(this.cursor);
        this.cursor.visible = false;

        class Draggable {
            constructor(axis, snap = .25) {
                this.axis = axis;
                this.snap = snap;

                this.traversePlaneGeom = new THREE.PlaneGeometry(9999, 9999);
                this.traversePlane = new THREE.Mesh(this.traversePlaneGeom, new THREE.MeshBasicMaterial({ visible: false }));
                this.traversePlane.material.side = THREE.DoubleSide;

                world.scene.add(this.traversePlane);

                this.objectGeom = new THREE.SphereGeometry(.2);

                this.object = new THREE.Mesh(this.objectGeom, new THREE.MeshBasicMaterial({ transparent: true, opacity: .5 }));
                this.object.renderOrder = 999;
                this.object.material.depthTest = false;
                this.object.material.depthWrite = false;
                this.object.onBeforeRender = function (renderer) { renderer.clearDepth(); };
                this.object.draggable = this;

                world.scene.add(this.object);

                this.active = false;

                world.renderer.domElement.addEventListener("mouseup", (event) => {
                    if (event.button === 0) {
                        this.active = false;
                        this.anyDragging = false;
                        world.updateUVs(tool.selpart);
                    }
                });


                world.renderer.domElement.addEventListener("mousemove", (event) => {
                    if (this.active) {
                        this.traversePlane.lookAt(world.camera.position);
                        if (this.axis === 'x') {
                            this.traversePlane.lookAt(this.object.position.x, world.camera.position.y, world.camera.position.z);
                        }
                        if (this.axis === 'y') {
                            this.traversePlane.lookAt(world.camera.position.x, this.object.position.y, world.camera.position.z);
                        }
                        if (this.axis === 'z') {
                            this.traversePlane.lookAt(world.camera.position.x, world.camera.position.y, this.object.position.z);
                        }

                        this.traversePlane.position.x = this.object.position.x;
                        this.traversePlane.position.y = this.object.position.y;
                        this.traversePlane.position.z = this.object.position.z;

                        const intersects = mouseCast([this.traversePlane], event);

                        if (intersects.length > 0) {
                            let point = intersects[0].point;

                            this.object.position[this.axis] = Math.round(point[this.axis] / this.snap) * this.snap;
                        }
                    }
                });
            }
        }

        this.x1 = new Draggable("x");
        this.x2 = new Draggable("x");
        this.y1 = new Draggable("y");
        this.y2 = new Draggable("y");
        this.z1 = new Draggable("z");
        this.z2 = new Draggable("z");
        this.draggables = [
            this.x1.object, this.x2.object, this.y1.object,
            this.y2.object, this.z1.object, this.z2.object
        ];

        for (let d in this.draggables) {
            this.draggables[d].visible = false;
        }

        this.mode = "move";

        world.renderer.domElement.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                const intersects = mouseCast(world.parts.concat(this.draggables), event);

                let isDraggable = false;
                if (intersects.length > 0) {
                    for (let h in intersects) {
                        let hit = intersects[h];

                        if (hit.object.draggable) {
                            hit.object.draggable.active = true;
                            this.anyDragging = true;
                            isDraggable = true

                            break
                        }
                    }

                    if ((!isDraggable) && (intersects[0].object.isPart)) {
                        this.setSelPart(intersects[0].object)
                    }
                } else {
                    tool.setSelPart(null)
                }
            }
        });

        world.renderer.domElement.addEventListener("mousemove", (event) => {
            let highlight;

            if (this.selpart) {
                highlight = this.selpart
            } else {
                const intersects = mouseCast(world.parts, event);
                if (intersects.length > 0) {
                    highlight = intersects[0].object
                }
            }
        });
    }

    setSelPart(obj) {
        if (obj) {
            document.getElementById('sidebar').style.display = 'inline';
            document.getElementById('matIndexContainer').style.display = 'inline';

            for (let d in this.draggables) {
                this.draggables[d].visible = true;
            }
            this.cursor.visible = true;

            this.selpart = obj;

            this.x1.object.position.x = this.selpart.position.x + (this.selpart.scale.x / 2);
            this.x2.object.position.x = this.selpart.position.x - (this.selpart.scale.x / 2);

            this.y1.object.position.y = this.selpart.position.y + (this.selpart.scale.y / 2);
            this.y2.object.position.y = this.selpart.position.y - (this.selpart.scale.y / 2);

            this.z1.object.position.z = this.selpart.position.z + (this.selpart.scale.z / 2);
            this.z2.object.position.z = this.selpart.position.z - (this.selpart.scale.z / 2);

            for (let m in map) {
                let val = this.selpart[map[m].attr][map[m].subattr];

                if (map[m].attr === 'rotation') {
                    val /= Math.PI / 180;
                }

                document.getElementById(m).value = val;
            }

            document.getElementById('input-co-r').value = tool.selpart.material.color.r * 255;
            document.getElementById('input-co-g').value = tool.selpart.material.color.g * 255;
            document.getElementById('input-co-b').value = tool.selpart.material.color.b * 255;

            if (tool.selpart.emissive === true) {
                document.getElementById('input-em').checked = true;

                document.getElementById('input-em-int').value = tool.selpart.light.intensity;
                document.getElementById('input-em-ran').value = tool.selpart.light.shadow.camera.far;
            } else {
                document.getElementById('input-em').checked = false;
            }
        } else {
            document.getElementById('sidebar').style.display = 'none';
            document.getElementById('matIndexContainer').style.display = 'none';

            for (let d in this.draggables) {
                this.draggables[d].visible = false;
            }
            this.cursor.visible = false;
        }
    }

    change(mode) {
        this.mode = mode;
        let color;

        if (mode === "scale") {
            color = 0xFF6400;
        } else if (mode === "move") {
            color = 0x6464FF;
        }

        tool.x1.object.material.color.setHex(color);
        tool.x2.object.material.color.setHex(color);
        tool.y1.object.material.color.setHex(color);
        tool.y2.object.material.color.setHex(color);
        tool.z1.object.material.color.setHex(color);
        tool.z2.object.material.color.setHex(color);
        tool.cursor.material.color.setHex(color);
    }

    update() {
        if (this.selpart) {
            this.cursor.position.x = this.selpart.position.x;
            this.cursor.position.y = this.selpart.position.y;
            this.cursor.position.z = this.selpart.position.z;

            this.cursor.scale.x = this.selpart.scale.x;
            this.cursor.scale.y = this.selpart.scale.y;
            this.cursor.scale.z = this.selpart.scale.z;

            this.cursor.geometry = this.selpart.geometry;

            if (this.mode === "scale") {
                this.selpart.scale.x = (this.x1.object.position.x - this.x2.object.position.x);
                this.selpart.position.x = (this.x1.object.position.x / 2) + (this.x2.object.position.x / 2);

                this.selpart.scale.y = (this.y1.object.position.y - this.y2.object.position.y);
                this.selpart.position.y = (this.y1.object.position.y / 2) + (this.y2.object.position.y / 2);

                this.selpart.scale.z = (this.z1.object.position.z - this.z2.object.position.z);
                this.selpart.position.z = (this.z1.object.position.z / 2) + (this.z2.object.position.z / 2);


                this.x1.object.position.z = this.selpart.position.z;
                this.x1.object.position.y = this.selpart.position.y;

                this.x2.object.position.z = this.selpart.position.z;
                this.x2.object.position.y = this.selpart.position.y;


                this.y1.object.position.z = this.selpart.position.z;
                this.y1.object.position.x = this.selpart.position.x;

                this.y2.object.position.z = this.selpart.position.z;
                this.y2.object.position.x = this.selpart.position.x;


                this.z1.object.position.x = this.selpart.position.x;
                this.z1.object.position.y = this.selpart.position.y;

                this.z2.object.position.x = this.selpart.position.x;
                this.z2.object.position.y = this.selpart.position.y;
            } else if (this.mode === "move") {
                if (tool.x1.active) {
                    tool.x2.object.position.x = (tool.x1.object.position.x - tool.selpart.scale.x)
                } else if (tool.x2.active) {
                    tool.x1.object.position.x = (tool.x2.object.position.x + tool.selpart.scale.x)
                }

                tool.x1.object.position.y = tool.selpart.position.y;
                tool.x2.object.position.y = tool.selpart.position.y;
                tool.x1.object.position.z = tool.selpart.position.z;
                tool.x2.object.position.z = tool.selpart.position.z;

                this.selpart.position.x = (this.x1.object.position.x / 2) + (this.x2.object.position.x / 2);






                if (tool.y1.active) {
                    tool.y2.object.position.y = (tool.y1.object.position.y - tool.selpart.scale.y)
                } else if (tool.y2.active) {
                    tool.y1.object.position.y = (tool.y2.object.position.y + tool.selpart.scale.y)
                }

                tool.y1.object.position.x = tool.selpart.position.x;
                tool.y2.object.position.x = tool.selpart.position.x;
                tool.y1.object.position.z = tool.selpart.position.z;
                tool.y2.object.position.z = tool.selpart.position.z;

                this.selpart.position.y = (this.y1.object.position.y / 2) + (this.y2.object.position.y / 2);







                if (tool.z1.active) {
                    tool.z2.object.position.z = (tool.z1.object.position.z - tool.selpart.scale.z)
                } else if (tool.z2.active) {
                    tool.z1.object.position.z = (tool.z2.object.position.z + tool.selpart.scale.z)
                }

                tool.z1.object.position.y = tool.selpart.position.y;
                tool.z2.object.position.y = tool.selpart.position.y;
                tool.z1.object.position.x = tool.selpart.position.x;
                tool.z2.object.position.x = tool.selpart.position.x;

                this.selpart.position.z = (this.z1.object.position.z / 2) + (this.z2.object.position.z / 2);
            }
        }
    }
}

const tool = new Tool();


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

var dt;
function animate() {
    dt = world.clock.getDelta();
    requestAnimationFrame(animate);

    if (pressedKeys["w"]) {
        world.camera.translateZ(-5 * dt)
    }
    if (pressedKeys["s"]) {
        world.camera.translateZ(5 * dt)
    }
    if (pressedKeys["a"]) {
        world.camera.translateX(-5 * dt)
    }
    if (pressedKeys["d"]) {
        world.camera.translateX(5 * dt)
    }


    if (tool.selpart) {
        for (let d in tool.draggables) {
            let draggable = tool.draggables[d].draggable;

            let scale = .1 * world.camera.position.distanceTo(tool.selpart.position);
            draggable.object.scale.set(scale, scale, scale);
        }
    }

    tool.update();
    world.renderer.render(world.scene, world.camera);
}
animate();