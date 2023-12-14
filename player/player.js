import * as THREE from 'three';
import { World } from '../world.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const urlParams = new URLSearchParams(window.location.search);

const world = new World(urlParams.get('data'));

//

function cast(origin, direction, length, target=world.scene.children) {
    const raycaster = new THREE.Raycaster();
    raycaster.far = length;

    raycaster.set(origin, direction);

    return raycaster.intersectObjects(target);
}

var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.key] = false; }
window.onkeydown = function(e) { pressedKeys[e.key] = true; }


function mouseCast(target=world.scene.children, event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, world.camera);
    
    return raycaster.intersectObjects(target);
}

const controls = new PointerLockControls(world.camera, world.renderer.domElement);
document.addEventListener("mousedown", function() {
    world.renderer.domElement.requestPointerLock();
});


const playerHeight = 1.5;

const playerMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(.5, playerHeight/2, 4),
    new THREE.MeshBasicMaterial({color:0xffffff})
);

world.scene.add(playerMesh);
playerMesh.castShadow = true;
var playerVelocity = {x:0, y:0, z:0};
var playerMaximumVelocity = {nx:-5, ny:-10, nz:-5, px:5, py:5, pz:5};

var dt;
function animate() {
    dt = world.clock.getDelta();
    requestAnimationFrame(animate);

    if (pressedKeys["w"]) {
        world.camera.translateZ(-5*dt)
    }
    if (pressedKeys["s"]) {
        world.camera.translateZ(5*dt)
    }
    if (pressedKeys["a"]) {
        world.camera.translateX(-5*dt)
    }
    if (pressedKeys["d"]) {
        world.camera.translateX(5*dt)
    }

    let c = cast(world.camera.position, new THREE.Vector3(0, -1, 0), 100, world.scene.children);

    if (c.length > 0) {
        world.camera.position.y = c[0].point.y + playerHeight
    }

    playerMesh.position.x = world.camera.position.x;
    playerMesh.position.y = world.camera.position.y - (playerHeight/2);
    playerMesh.position.z = world.camera.position.z;

    playerMesh.position.x = playerVelocity.x;
    playerMesh.position.y = playerVelocity.y;
    playerMesh.position.z = playerVelocity.z;

    world.renderer.render(world.scene, world.camera);
}
animate();