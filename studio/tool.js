import * as THREE from "three";



// Part attributes associated with the IDs of input boxes
export const map = {
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




export function cast(world, origin, direction, length, target) {
    world.raycaster.far = length;

    world.raycaster.set(origin, direction);

    return world.raycaster.intersectObjects(target);
}

function mouseCast(world, target, event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.offsetX / world.canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / world.canvas.clientHeight) * 2 + 1;

    world.raycaster.setFromCamera(mouse, world.camera);

    return world.raycaster.intersectObjects(target);
}



class Draggable {
    constructor(tool, axis, snap = 1) {
        this.tool = tool
        this.axis = axis;
        this.snap = snap;

        this.traversePlaneGeom = new THREE.PlaneGeometry(9999, 9999);
        this.traversePlane = new THREE.Mesh(this.traversePlaneGeom, new THREE.MeshBasicMaterial({ visible: false }));
        this.traversePlane.material.side = THREE.DoubleSide;
        this.traversePlane.name = "traverse";

        this.tool.world.scene.add(this.traversePlane);

        this.objectGeom = new THREE.SphereGeometry(.2);

        this.object = new THREE.Mesh(this.objectGeom, new THREE.MeshBasicMaterial({ transparent: true, opacity: .5 }));
        this.object.renderOrder = 999;
        this.object.material.depthTest = false;
        this.object.material.depthWrite = false;
        this.object.onBeforeRender = function (renderer) { renderer.clearDepth(); };
        this.object.draggable = this;
        this.object.name = "draggable";

        this.tool.world.scene.add(this.object);

        this.active = false;

        this.tool.world.renderer.domElement.addEventListener("mouseup", (event) => {
            if (event.button === 0) {
                this.active = false;
                this.anyDragging = false;
            }
        });


        this.tool.world.canvas.addEventListener("mousemove", (event) => {
            if (this.active) {
                this.traversePlane.lookAt(this.tool.world.camera.position);
                if (this.axis === 'x') {
                    this.traversePlane.lookAt(this.object.position.x, this.tool.world.camera.position.y, this.tool.world.camera.position.z);
                }
                if (this.axis === 'y') {
                    this.traversePlane.lookAt(this.tool.world.camera.position.x, this.object.position.y, this.tool.world.camera.position.z);
                }
                if (this.axis === 'z') {
                    this.traversePlane.lookAt(this.tool.world.camera.position.x, this.tool.world.camera.position.y, this.object.position.z);
                }

                this.traversePlane.position.x = this.object.position.x;
                this.traversePlane.position.y = this.object.position.y;
                this.traversePlane.position.z = this.object.position.z;

                const intersects = mouseCast(this.tool.world, [this.traversePlane], event);

                if (intersects.length > 0) {
                    let point = intersects[0].point;

                    this.object.position[this.axis] = Math.round(point[this.axis] / this.snap) * this.snap;
                }
            }
        });
    }
}





export class Tool {
    constructor(world) {
        this.world = world;

        this.anyDragging = false;

        this.cursor = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        );

        this.cursor.name = "cursor"

        this.world.scene.add(this.cursor);
        this.cursor.visible = false;

        this.x1 = new Draggable(this, "x");
        this.x2 = new Draggable(this, "x");
        this.y1 = new Draggable(this, "y");
        this.y2 = new Draggable(this, "y");
        this.z1 = new Draggable(this, "z");
        this.z2 = new Draggable(this, "z");
        this.draggables = [
            this.x1.object, this.x2.object, this.y1.object,
            this.y2.object, this.z1.object, this.z2.object
        ];

        for (let d in this.draggables) {
            this.draggables[d].visible = false;
        }

        this.mode = "move";

        console.log(Object.values(this.world.three_part_objects))

        this.world.canvas.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                const intersects = mouseCast(this.world, Object.values(this.world.three_part_objects).concat(this.draggables), event);

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

                    if ((!isDraggable) && (intersects[0].object.is_part)) {
                        this.set_selected_part(intersects[0].object.part_id)
                    }
                } else {
                    this.set_selected_part(null)
                }
            }
        });

        this.world.canvas.addEventListener("mousemove", (event) => {
            let highlight;

            if (this.selected_part_id) {
                highlight = this.selected_part_id
            } else {
                const intersects = mouseCast(this.world, this.world.parts, event);
                if (intersects.length > 0) {
                    highlight = intersects[0].object
                }
            }
        });
    }

    set_selected_part(part_id) {
        let part = this.world.data.space.parts[part_id];

        if (part) {
            console.log(part)
            part_id_display.innerText = `Part ID: ${part_id}`;

            for (let d in this.draggables) {
                this.draggables[d].visible = true;
            }
            this.cursor.visible = true;

            this.selected_part_id = part_id;
            console.log(this.selected_part_id)

            this.x1.object.position.x = part.position[0] + (part.scale[0] / 2);
            this.x2.object.position.x = part.position[0] - (part.scale[0] / 2);

            this.y1.object.position.y = part.position[1] + (part.scale[1] / 2);
            this.y2.object.position.y = part.position[1] - (part.scale[1] / 2);

            this.z1.object.position.z = part.position[2] + (part.scale[2] / 2);
            this.z2.object.position.z = part.position[2] - (part.scale[2] / 2);

            for (let m in map) {
                let val = part[map[m].attr][map[m].subattr];

                if (map[m].attr === 'rotation') {
                    val /= Math.PI / 180;
                }

                document.getElementById(m).value = val;
            }

            document.getElementById(`material_tint_r_input`).value = this.world.data.assets.materials[part.material].tint[0] * 255;
            document.getElementById(`material_tint_g_input`).value = this.world.data.assets.materials[part.material].tint[1] * 255;
            document.getElementById(`material_tint_b_input`).value = this.world.data.assets.materials[part.material].tint[2] * 255;
        } else {
            //document.getElementById('sidebar').style.display = 'none';

            for (let d in this.draggables) {
                this.draggables[d].visible = false;
            }
            this.cursor.visible = false;
            this.selected_part_id = null;
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

        this.x1.object.material.color.setHex(color);
        this.x2.object.material.color.setHex(color);
        this.y1.object.material.color.setHex(color);
        this.y2.object.material.color.setHex(color);
        this.z1.object.material.color.setHex(color);
        this.z2.object.material.color.setHex(color);
        this.cursor.material.color.setHex(color);
    }

    update() {
        let part = this.world.data.space.parts[this.selected_part_id];
        
        if (part) {
            this.cursor.position.x = part.position[0];
            this.cursor.position.y = part.position[1];
            this.cursor.position.z = part.position[2];

            this.cursor.scale.x = part.scale[0];
            this.cursor.scale.y = part.scale[1];
            this.cursor.scale.z = part.scale[2];

            //this.cursor.geometry = part.geometry;

            if (this.mode === "scale") {
                part.scale[0] = (this.x1.object.position.x - this.x2.object.position.x);
                part.position[0] = (this.x1.object.position.x / 2) + (this.x2.object.position.x / 2);

                part.scale[1] = (this.y1.object.position.y - this.y2.object.position.y);
                part.position[1] = (this.y1.object.position.y / 2) + (this.y2.object.position.y / 2);

                part.scale[2] = (this.z1.object.position.z - this.z2.object.position.z);
                part.position[2] = (this.z1.object.position.z / 2) + (this.z2.object.position.z / 2);


                this.x1.object.position.z = part.position[2];
                this.x1.object.position.y = part.position[1];

                this.x2.object.position.z = part.position[2];
                this.x2.object.position.y = part.position[1];


                this.y1.object.position.z = part.position[2];
                this.y1.object.position.x = part.position[0];

                this.y2.object.position.z = part.position[2];
                this.y2.object.position.x = part.position[0];


                this.z1.object.position.x = part.position[0];
                this.z1.object.position.y = part.position[1];

                this.z2.object.position.x = part.position[0];
                this.z2.object.position.y = part.position[1];

            } else if (this.mode === "move") {

                if (this.x1.active) {
                    this.x2.object.position.x = (this.x1.object.position.x - part.scale[0])
                } else if (this.x2.active) {
                    this.x1.object.position.x = (this.x2.object.position.x + part.scale[0])
                }

                this.x1.object.position.y = part.position[1];
                this.x2.object.position.y = part.position[1];
                this.x1.object.position.z = part.position[2];
                this.x2.object.position.z = part.position[2];

                part.position[0] = (this.x1.object.position.x / 2) + (this.x2.object.position.x / 2);






                if (this.y1.active) {
                    this.y2.object.position.y = (this.y1.object.position.y - part.scale[1])
                } else if (this.y2.active) {
                    this.y1.object.position.y = (this.y2.object.position.y + part.scale[1])
                }

                this.y1.object.position.x = part.position[0];
                this.y2.object.position.x = part.position[0];
                this.y1.object.position.z = part.position[2];
                this.y2.object.position.z = part.position[2];

                part.position[1] = (this.y1.object.position.y / 2) + (this.y2.object.position.y / 2);







                if (this.z1.active) {
                    this.z2.object.position.z = (this.z1.object.position.z - part.scale[2])
                } else if (this.z2.active) {
                    this.z1.object.position.z = (this.z2.object.position.z + part.scale[2])
                }

                this.z1.object.position.y = part.position[1];
                this.z2.object.position.y = part.position[1];
                this.z1.object.position.x = part.position[0];
                this.z2.object.position.x = part.position[0];

                part.position[2] = (this.z1.object.position.z / 2) + (this.z2.object.position.z / 2);
            }

            this.world.manifest(this.selected_part_id)
        }
    }
}