import * as THREE from "three";



// object attributes associated with the IDs of input boxes
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

        //console.log(Object.values(this.world.three_object_meshes))

        this.world.canvas.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                const intersects = mouseCast(this.world, Object.values(this.world.three_object_meshes).concat(this.draggables), event);

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

                    if ((!isDraggable) && (intersects[0].object.is_object)) {
                        this.set_selected_object(intersects[0].object.object_id)
                    }
                } else {
                    this.set_selected_object(null)
                }
            }
        });

        this.world.canvas.addEventListener("mousemove", (event) => {
            let highlight;

            if (this.selected_object_id) {
                highlight = this.selected_object_id
            } else {
                const intersects = mouseCast(this.world, this.world.objects, event);
                if (intersects.length > 0) {
                    highlight = intersects[0].object
                }
            }
        });
    }

    set_selected_object(object_id) {
        let object = this.world.data.space.objects[object_id];

        if (object) {
            console.log(object)
            object_id_display.innerText = `object ID: ${object_id}`;

            for (let d in this.draggables) {
                this.draggables[d].visible = true;
            }
            this.cursor.visible = true;

            this.selected_object_id = object_id;
            console.log(this.selected_object_id)

            this.x1.object.position.x = object.position[0] + (object.scale[0] / 2);
            this.x2.object.position.x = object.position[0] - (object.scale[0] / 2);

            this.y1.object.position.y = object.position[1] + (object.scale[1] / 2);
            this.y2.object.position.y = object.position[1] - (object.scale[1] / 2);

            this.z1.object.position.z = object.position[2] + (object.scale[2] / 2);
            this.z2.object.position.z = object.position[2] - (object.scale[2] / 2);

            for (let m in map) {
                let val = object[map[m].attr][map[m].subattr];

                if (map[m].attr === 'rotation') {
                    val /= Math.PI / 180;
                }

                document.getElementById(m).value = val;
            }
        } else {
            //document.getElementById('sidebar').style.display = 'none';

            for (let d in this.draggables) {
                this.draggables[d].visible = false;
            }
            this.cursor.visible = false;
            this.selected_object_id = null;
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
        let object = this.world.data.space.objects[this.selected_object_id];
        
        if (object) {
            this.cursor.position.x = object.position[0];
            this.cursor.position.y = object.position[1];
            this.cursor.position.z = object.position[2];

            this.cursor.scale.x = object.scale[0];
            this.cursor.scale.y = object.scale[1];
            this.cursor.scale.z = object.scale[2];

            //this.cursor.geometry = object.geometry;

            if (this.mode === "scale") {
                object.scale[0] = (this.x1.object.position.x - this.x2.object.position.x);
                object.position[0] = (this.x1.object.position.x / 2) + (this.x2.object.position.x / 2);

                object.scale[1] = (this.y1.object.position.y - this.y2.object.position.y);
                object.position[1] = (this.y1.object.position.y / 2) + (this.y2.object.position.y / 2);

                object.scale[2] = (this.z1.object.position.z - this.z2.object.position.z);
                object.position[2] = (this.z1.object.position.z / 2) + (this.z2.object.position.z / 2);


                this.x1.object.position.z = object.position[2];
                this.x1.object.position.y = object.position[1];

                this.x2.object.position.z = object.position[2];
                this.x2.object.position.y = object.position[1];


                this.y1.object.position.z = object.position[2];
                this.y1.object.position.x = object.position[0];

                this.y2.object.position.z = object.position[2];
                this.y2.object.position.x = object.position[0];


                this.z1.object.position.x = object.position[0];
                this.z1.object.position.y = object.position[1];

                this.z2.object.position.x = object.position[0];
                this.z2.object.position.y = object.position[1];

            } else if (this.mode === "move") {

                if (this.x1.active) {
                    this.x2.object.position.x = (this.x1.object.position.x - object.scale[0])
                } else if (this.x2.active) {
                    this.x1.object.position.x = (this.x2.object.position.x + object.scale[0])
                }

                this.x1.object.position.y = object.position[1];
                this.x2.object.position.y = object.position[1];
                this.x1.object.position.z = object.position[2];
                this.x2.object.position.z = object.position[2];

                object.position[0] = (this.x1.object.position.x / 2) + (this.x2.object.position.x / 2);






                if (this.y1.active) {
                    this.y2.object.position.y = (this.y1.object.position.y - object.scale[1])
                } else if (this.y2.active) {
                    this.y1.object.position.y = (this.y2.object.position.y + object.scale[1])
                }

                this.y1.object.position.x = object.position[0];
                this.y2.object.position.x = object.position[0];
                this.y1.object.position.z = object.position[2];
                this.y2.object.position.z = object.position[2];

                object.position[1] = (this.y1.object.position.y / 2) + (this.y2.object.position.y / 2);







                if (this.z1.active) {
                    this.z2.object.position.z = (this.z1.object.position.z - object.scale[2])
                } else if (this.z2.active) {
                    this.z1.object.position.z = (this.z2.object.position.z + object.scale[2])
                }

                this.z1.object.position.y = object.position[1];
                this.z2.object.position.y = object.position[1];
                this.z1.object.position.x = object.position[0];
                this.z2.object.position.x = object.position[0];

                object.position[2] = (this.z1.object.position.z / 2) + (this.z2.object.position.z / 2);
            }

            this.world.manifest(this.selected_object_id)
        }
    }
}